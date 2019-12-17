import {app, Menu, ipcMain, BrowserWindow, globalShortcut, dialog, screen} from 'electron';
import net from 'net';
import test from './test';
import util from './util';
import glob from 'glob';
import { autoUpdater } from 'electron-updater';

const fs = require('fs-extra');
const path = require('path');
const { spawn, exec } = require('child_process');
const isWin = process.platform === 'win32';
const cwd = isWin ? process.cwd() : '/tmp/Ewsedu';
const historyApiFallback = require('./history');

if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\');
}
const express = require('express');
const shortid = require('shortid');
const bodyParser = require('body-parser');
const cleanJson = require('strip-json-comments');
const superagent = require('superagent');
const ioClient = require('socket.io-client');
// const fly = require('flyio');
// fly.config.parseJson = false;
// fly.config.withCredentials = true;

const ansi = require('ansi-html-stream');
let io = null;
const debug = {
  log() {
    console.log.apply(console, arguments);
    if (io) {
      io.emit('main-console', arguments);
    }
  }
};

let serverPort = 36987;

const portIsOccupied = port => {
  const server = net.createServer().listen(port);
  return new Promise((resolve, reject) => {
    server.on('listening', () => {
      debug.log(`the server is runnint on port ${port}`);
      server.close();
      resolve(port);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        debug.log(`this port ${port} is occupied.try another.`);
        resolve(portIsOccupied(port + 1)); // 如占用端口号+1
      } else {
        reject(err);
      }
    });
  });
};
const publicPath = path.join(cwd, 'public');
const devPackPath = isWin ? path.join(publicPath, 'pack-temp') : '/tmp/Ewsedu/public/pack-temp';
const distPackPath = isWin ? path.join(publicPath, 'dist') : '/tmp/Ewsedu/public/dist';
portIsOccupied(serverPort).then(port => {
  serverPort = port;
  const server = express();
  server.use(bodyParser.json()); // for parsing application/json
  server.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  server.use((req, res, next) => {
    // 设置是否运行客户端设置 withCredentials
    // 即在不同域名下发出的请求也可以携带 cookie
    res.header('Access-Control-Allow-Credentials', true);
    // 第二个参数表示允许跨域的域名，* 代表所有域名
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS'); // 允许的 http 请求的方法
    // 允许前台获得的除 Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma 这几张基本响应头之外的响应头
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if (req.method == 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  // server.use((req, res, next) => {
  //   debug.log(res);
  //   req.url = '/dist/master/index.html';
  //   next();
  // });
  server.use(historyApiFallback());
  server.use(express.static(publicPath));
  server.all('/archive-package', (req, res) => {
    const project = req.body.project || req.query.project || {};
    const wgtName = `${project.name}.wgt`;
    if (!project || !project.name) {
      res.jsonp('error');
      return false;
    }
    archivePackage(project, path.join(devPackPath, wgtName)).then(() => {
      res.jsonp({
        error: 0,
        data: {
          file: `/pack-temp/${wgtName}`
        }
      });
    });
  });
  const http = require('http').createServer(server);
  io = require('socket.io')(http);
  io.on('connection', socket => {
    socket.on('remote-message', message => {
      if (message.bundle) {
        const logs = Master.logs[message.bundle];
        if (!logs) {
          Master.logs[message.bundle] = [];
        }
        if (Master.logs[message.bundle].length >= 100) {
          Master.logs[message.bundle].splice(0, 1);
        }
        Master.logs[message.bundle].push(message);
      }
      io.emit('remote-console', message);
    });
    socket.on('request-message', (message, fn) => {
      if (message.bundle) {
        const logs = Master.logs[message.bundle];
        if (!logs) {
          Master.logs[message.bundle] = [];
        }
        fn && fn(Master.logs[message.bundle]);
      }
    });
  });

  http.listen(port, function() {
    debug.log(`listening on * ${port}`);
  });
});

let mainWindow;
let userScreen;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`;

function createWindow() {
  if (process.platform === 'darwin') {
    const template = [
      {
        label: 'Application',
        submenu: [
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click() {
              app.quit();
            }}
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' }
        ]
      }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } else {
    Menu.setApplicationMenu(null);
  }
  mainWindow = new BrowserWindow({
    height: 460,
    width: 360,
    useContentSize: true,
    resizable: true,
    frame: false,
    webPreferences: {
      webSecurity: false
    }
  });
  mainWindow.loadURL(winURL);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const Master = {
  jobs: {},
  logs: {}
};
const updateUrl = 'http://oss.app.ewsedu.com/client/connect/';
autoUpdater.setFeedURL(updateUrl);
autoUpdater.autoDownload = false;
autoUpdater.on('update-downloaded', () => {
  sendMessage({
    action: 'update-downloaded'
  });
  autoUpdater.quitAndInstall();
});
autoUpdater.on('error', error => {
  sendMessage(error);
});
autoUpdater.on('checking-for-update', () => {
  sendMessage('check');
});
autoUpdater.on('update-available', info => {
  sendMessage({
    action: 'update-available'
  });
  // autoUpdater.downloadUpdate();
});
autoUpdater.on('update-not-available', info => {
  sendMessage('not ava');
});
autoUpdater.on('download-progress', progress => {
  sendMessage({
    action: 'download-progress',
    progress
  });
});

app.on('ready', () => {
  // if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates();
  createWindow();
  userScreen = screen.getPrimaryDisplay().size;
  debug.log(userScreen);
  globalShortcut.register('CommandOrControl+Alt+F', () => {
    dialog.showMessageBox({
      title: '按键测试',
      type: 'info',
      message: '成功!',
      detail: '你按了 Control+Alt+F',
      buttons: ['晓得了']
    });
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('resize-window', () => {
  // const base = 1;
  // const options = {
  //   x: userScreen.width / 4 - userScreen.width * base / 4,
  //   y: userScreen.height / 4 - userScreen.height * base / 4,
  //   width: userScreen.width * base,
  //   height: userScreen.height * base
  // };
  // // debug.log(options);
  // mainWindow.setBounds(options);
  mainWindow.maximize();
});

const ProxyMaster = {
  caches: {},
  servers: [],
  getServerInstance(uuid = '') {
    const servers = this.servers || [];
    return servers.find(data => {
      return data.uuid == uuid;
    });
  },
  setCache(name = '', data) {
    this.caches[name] = {
      data
    };
    setTimeout(() => {
      delete this.caches[name];
    }, 60 * 1000);
  }
};
const NetControl = {
  list: [],
  query: [],
  done: {}
};

let proxySocket = null;

const fns = {
  'confirm-update': () => {
    autoUpdater.downloadUpdate();
    return Promise.resolve();
  },
  'check-update': () => {
    if (process.env.NODE_ENV === 'production') {
      autoUpdater.checkForUpdates();
    }
    return Promise.resolve();
  },
  'sync-servers': servers => {
    ProxyMaster.servers = servers;
    return Promise.resolve();
  },
  'clear-cache': uuid => {
    return Promise.resolve(proxySocket.emit('clear/cache', uuid));
  },
  'connect-proxy': uuid => {
    const hostname = 'tunnel.ewsedu.com';
    // const hostname = '127.0.0.1:7400';
    const socket = ioClient(`ws://${hostname}/intranet`, {
      query: {
        uuid
      }
    });
    socket.on('connect', () => {
      debug.log('proxy connect' + uuid);
    });
    socket.on('discconect', () => {
      debug.log('proxy disconnect');
    });
    socket.on('ews/request', (query, fn) => {
      const server = ProxyMaster.getServerInstance(query.instance);
      if (!server) {
        return false;
      }
      const exists = !!query.exists;
      const state = query.state || {};
      fns['http-proxy'].apply(this, [{
        query,
        server
      }]).then(response => {
        if (response) {
          // if (response.header['content-type'].indexOf('application/javascript') > -1) {
          //   const body = response.body.toString();
          //   const ugly = UglifyJS.minify(body, {
          //     mangle: false
          //   });
          //   response.body = ugly.code;
          // }
          // response.body = response.body ? response.body.toString() : null;
          let useCache = false;
          if (exists && state.mtime) {
            response.text = null;
            response.body = null;
            useCache = true;
          }
          const data = {
            requestid: query.requestid,
            response: {
              header: response.header,
              text: response.text,
              body: response.body,
              cache: server.cache,
              useCache
            }
          };
          if (fn) {
            fn(data);
          } else {
            socket.emit('ews/response', data, res => {
            });
          }
        }
      });
    });
    proxySocket = socket;
    return Promise.resolve();
  },
  'open-directory-dialog': param => {
    return new Promise(resolve => {
      dialog.showOpenDialog({
        properties: [ param ]
      }, files => {
        resolve(files);
      });
    });
  },
  'get-local-port': () => {
    return Promise.resolve(serverPort);
  },
  'open-dev-target': dir => {
    return getTargetInfo(dir);
  },
  'open-dir': dir => {
    return new Promise(resolve => {
      openFinder(dir);
      resolve();
    });
  },
  'publish-package': project => {
    const type = project.response.package.ewsedu.type;
    let dir = '';
    if (type == 'app') {
      dir = path.join(path.dirname(project.path), 'dist');
    } else {
      dir = path.join(project.path, 'dist');
    }
    proxySocket.emit('clear/cache', project.name);
    const dist = path.join(distPackPath, project.name);
    return fs.remove(dist).then(() => {
      return fs.copy(dir, dist);
    });
  },
  'request-projects': projects => {
    const request = projects.map(node => {
      return getTargetInfo(node.path);
    });
    return Promise.all(request).then(list => {
      projects.forEach((node, index) => {
        node.response = list[index];
      });
      return projects;
    }).then(projects => {
      const srcs = projects.map(node => {
        return node.path;
      });
      return new Promise(resolve => {
        test(srcs).then(processes => {
          resolve({
            projects,
            processes
          });
        }).catch(e => {
          resolve({
            projects,
            processes: []
          });
        });
      });
    });
  },
  'request-custom-configs': project => {
    return helperProxy(project.path, 'getCustomConfig');
  },
  'archive-package': project => {
    return archivePackage(project, '', true);
  },
  'get-config-raw': data => {
    const { project, config } = data;
    return helperProxy(project.path, 'getCustomConfigPath').then(customConfigPath => {
      const filepath = path.join(customConfigPath, config);
      return fs.readFileSync(filepath).toString();
    });
  },
  'app-proxy': data => {
    const { project, name, args } = data;
    return helperProxy(project.path, name, args);
  },
  'http-proxy': data => {
    const { query, server, control } = data;
    const uid = data.uid || shortid.generate();
    const overload = false;
    data.overload = overload;
    if (!control) {
      // NetControl.list.push(data);
      if (data.overload) {
        return new Promise(resolve => {
          setInterval(() => {
            if (NetControl.done[uid]) {
              resolve(NetControl.done[uid]);
              delete NetControl.done[uid];
            }
          }, 100);
        });
      }
    }
    // let base = '';
    let pre = null;
    if (!server) {
      return Promise.resolve(null);
    }
    if (server.mode == 'debug') {
      if (ProxyMaster.caches[server.path]) {
        pre = Promise.resolve(ProxyMaster.caches[server.path].data);
      } else {
        pre = helperProxy(server.path, 'getLocalInfo').then(response => {
          const data = `http://127.0.0.1:${response.port}`;
          ProxyMaster.setCache(server.path, data);
          return data;
        });
      }

      // debug.log(base);
    } else {
      const instance = query.instance || '';
      pre = Promise.resolve(`http://127.0.0.1:${serverPort}/dist/${instance}`);
    }
    return pre.then(host => {
      const uri = query.uri || '';
      const address = `${host}${encodeURIComponent(uri)}`;
      // const address = 'http://localhost:8080/webpack-dev-server';
      return new Promise(resolve => {
        superagent.get(address)
          .set('X-Requested-With', 'XMLHttpRequest')
          .set('accept', '*/*')
          .set('Expires', '-1')
          .set('Cache-Control', 'no-cache,no-store,must-revalidate,max-age=-1,private')
          .then(response => {
            resolve(response);
          }).catch(e => {
            const response = e.response || {
              text: `http://${e.address}:${e.port} 404 not found ${e.code}`
            };
            resolve(response);
          });
      }).then(response => {
        const exists = NetControl.list.find(data => {
          return data.uid == uid;
        });
        if (exists) {
          NetControl.splice(NetControl.indexOf(exists), 1);
        }
        const next = NetControl.list.find(node => {
          return node.overload == true;
        });
        if (data.control) {
          NetControl.done[uid] = {
            ok: 1,
            text: 'ok'
          };
        }
        if (next) {
          next.control = 1;
          fns['http-proxy'].apply(this, [ next ]);
        }
        return response;
      });
    });
  },
  'open-dev-tools': () => {
    mainWindow.webContents.openDevTools();
  }
};

ipcMain.on('common-request', (event, data) => {
  const uuid = data.uuid || '';
  const cmd = data.cmd || '';
  const param = data.param || {};
  if (fns[cmd]) {
    const call = fns[cmd].apply(this, [param]);
    if (call) {
      call.then(response => {
        event.sender.send(`common-response-${uuid}`, response);
      });
    }
  }
});

ipcMain.on('run-task', (event, project, options = {}) => {
  // const options = {
  //   env: 'development',
  //   config: 'dev',
  //   release: false,
  //   version: 720,
  //   cli: true
  // };
  options.cli = true;
  const cmd = [
    'node',
    path.join(project.path, 'app', 'build'),
    '--options=' + encodeURIComponent(JSON.stringify(options))
  ];
  if (options.server) {
    cmd.push('--dev');
  } else {
    cmd.push('--build-vue');
  }
  // windows flag /d /s /c
  const shFlag = isWin ? '/d /s /c' : '-c';
  const cmds = [
    shFlag,
    `"${cmd.join(' ')}"`
  ];
  const sh = isWin ? 'cmd' : 'sh';
  const job = spawn(sh, cmds, {
    cwd: project.path,
    windowsVerbatimArguments: !!isWin,
    env: isWin ? process.env : Object.assign(process.env, {
      'PATH': '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'
    }),
    shell: true
  });
  const stream = ansi({ chunked: true });
  job.stdout.pipe(stream);
  stream.on('data', data => {
    debug.log(data);
    io.emit('task-stdout-data', {
      bundle: project.name,
      data: data.toString()
    });
  });
  // job.stdout.on('data', data => {
  // });
  job.stderr.on('data', data => {
    io.emit('task-stderr-data', {
      bundle: project.name,
      data: data.toString()
    });
  });
  job.on('close', code => {
    debug.log('job close ' + code);
  });
  return job;
});

ipcMain.on('stop-server', (event, p) => {
  try {
    process.kill(p.pid);
  } catch (e) {
    debug.log(e);
  }
});

ipcMain.on('min', e => mainWindow.minimize());
ipcMain.on('max', e => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
ipcMain.on('close', e => mainWindow.close());

function getTargetInfo(p) {
  return new Promise(resolve => {
    const packagePath = path.join(p, 'package.json');
    const exists = fs.existsSync(packagePath);
    const response = {
      path: p,
      exists
    };
    // let parsed = false;
    if (!exists) {
    } else {
      try {
        const pack = fs.readFileSync(packagePath);
        response.package = JSON.parse(pack) || {};
      } catch (e) {
        response.package = {};
      }
      const ewsedu = response.package.ewsedu || {};
      let pkgPath = '';
      if (ewsedu.type == 'app') {
        pkgPath = path.join(path.dirname(p), 'js/build/pkg.json');
      } else {
        pkgPath = path.join(p, 'pkg.json');
      }
      try {
        const pkg = fs.readFileSync(pkgPath);
        response.pkg = JSON.parse(pkg) || {};
      } catch (e) {
        response.pkg = {};
      }
    }
    resolve(response);
  });
}

function helperProxy(p, action, args = []) {
  return new Promise(resolve => {
    const cmd = `node proxy helper ${action} ${encodeURIComponent(JSON.stringify(args))}`;
    exec(cmd, {
      cwd: path.join(p, 'app'),
      env: isWin ? process.env : Object.assign(process.env, {
        'PATH': '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'
      }),
      shell: true
    }, (e, stdout, stderr) => {
      resolve(stdout ? JSON.parse(stdout) : null);
    });
  });
}

function makeCleanJson(filepath = '') {
  const raw = fs.readFileSync(filepath).toString();
  const json = cleanJson(raw, {
    whitespace: false
  });
  return json;
}

function archivePackage(project, wgtPath = '', enter = false) {
  const response = project.response || {};
  const pkg = response.package || {};
  const ewsedu = pkg.ewsedu || {};
  const type = ewsedu.type || 'app';
  if (type == 'app') {
    return archiveAppPackage(project, wgtPath, enter);
  }
  return archiveWebPackage(project, wgtPath, enter);
}

function archiveAppPackage(project, wgtPath = '', enter = false) {
  const appPath = path.dirname(project.path);
  const manifest = path.join(appPath, 'manifest.json');
  return new Promise(resolve => {
    glob(appPath + '/*', {}, (e, files) => {
      const unpackage = ['src', 'unpackage', 'manifest.json', 'node_modules'];
      const source = files.filter(node => {
        return unpackage.every(data => {
          return node.indexOf(data) <= -1;
        });
      }).map(node => {
        if (node.indexOf('.') > -1) {
          return node;
        }
        const names = node.split('/');
        const name = names[names.length - 1];
        return {
          src: node,
          target: name
        };
      });
      const json = makeCleanJson(manifest);
      source.push({
        type: 'string',
        text: json,
        name: 'manifest.json'
      });
      wgtPath = wgtPath || path.join(cwd, 'packages', project.name + '.wgt');
      resolve(util.zip(source, wgtPath).then(wgt => {
        if (enter) {
          openFinder(path.dirname(wgt));
        }
        return wgtPath;
      }));
    });
  });
}

function archiveWebPackage(project, wgtPath = '', enter = false) {
  const distPath = path.join(project.path, 'dist');
  const source = [{
    src: distPath,
    target: '/'
  }];
  wgtPath = wgtPath || path.join(cwd, 'packages', project.name + '.zip');
  return util.zip(source, wgtPath).then(wgt => {
    if (enter) {
      openFinder(path.dirname(wgt));
    }
    return wgtPath;
  });
}

function openFinder(path = '') {
  isWin ? exec(`explorer.exe /select,"${path}"`) : exec(`open ${path}`);
}
function sendMessage(message) {
  mainWindow.webContents.send('message', message);
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
