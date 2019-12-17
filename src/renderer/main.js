import Plus from 'moe-plus';
import Vue from 'vue';
import axios from 'axios';
import App from './App';
import router from './router';
import store from './store';
// import iView from 'iview';
import ViewUI from 'view-design';
import db from './datastore';
import vueCropper from 'vue-cropper';
import kebabCase from 'lodash/kebabCase';
import JsonViewer from 'vue-json-viewer';
import VueCodemirror from 'vue-codemirror';
import VueClipBoard from 'vue-clipboard2';
import * as io from 'socket.io-client';
import './assets/iview.less'; // iView 主题层叠样式文件
import './assets/override.scss'; // iView 样式覆写文件
import './assets/style.scss'; // eCamera 自定义样式覆写文件
import './assets/iconfont/iconfont.css';
import 'codemirror/lib/codemirror.css';

const electron = require('vue-electron');

const shortid = require('shortid');
const Runtime = {Vue};
const M = new Plus(null, Runtime);
const development = process.env.NODE_ENV == 'development';
console.log(development);

if (!process.env.IS_WEB) Vue.use(electron);
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.use(ViewUI);
Vue.use(vueCropper);
Vue.use(JsonViewer);
Vue.use(VueCodemirror);
Vue.use(VueClipBoard);

Vue.prototype.$db = db;
Vue.prototype.$toast = (title, desc) => {
  Vue.prototype.$Message.success(title);
};

const nextComponents = require.context(
  './components', // 其组件目录的相对路径
  true, // 是否查询其子目录
  /\.vue$/ // 匹配基础组件文件名的正则表达式
);
nextComponents.keys().forEach(fileName => {
  const componentConfig = nextComponents(fileName);
  const componentName = kebabCase(
    fileName.replace(/^\.\/(.*)\.\w+$/, '$1')
  );
  Vue.component(
    componentName,
    componentConfig.default || componentConfig
  );
});

const Application = {
  uuid: null,
  init() {
    let uuid = M.Runtime.Session.get('ews/connect/uuid') || '';
    if (!uuid) {
      uuid = shortid.generate();
    }
    this.uuid = uuid;
    M.Runtime.Session.set('ews/connect/uuid', uuid);
  }
};
Vue.prototype.$application = Application;
Vue.prototype.$request = (cmd, param) => {
  return new Promise(resolve => {
    const uuid = M.Runtime.Helper.uuid.v4();
    Vue.prototype.$electron.ipcRenderer.once(`common-response-${uuid}`, (e, response) => {
      resolve(response);
    });
    Vue.prototype.$electron.ipcRenderer.send('common-request', {
      uuid,
      cmd,
      param
    });
  });
};
const ProxyMaster = {
  io: null,
  init() {
    // this.connect();
    setInterval(() => {
      Vue.prototype.$request('sync-servers', this.getServers());
    }, 1000);
  },
  getConfig() {
    const custom = M.Runtime.Session.get('ewsedu/proxy/config') || {};
    const isDevelopment = false;
    const remoteHost = isDevelopment ? window.location.hostname : 'tunnel.ewsedu.com';
    const remotePort = isDevelopment ? 7400 : 80;
    const basehost = isDevelopment ? 'tn.dev.ewsedu.com' : 'tn.ewsedu.com';
    const config = {
      remote: remoteHost + ':' + remotePort,
      basehost
    };
    return Object.assign({}, config, custom);
  },
  getServers() {
    return M.Runtime.Session.get('ewsedu/proxy/servers') || [];
  },
  isOpen(uuid = '') {
    return !!this.getServerInstance(uuid);
  },
  getAddress(uuid = '') {
    const config = this.getConfig();
    return `http://${uuid}-${Application.uuid || ''}.${config.basehost}`;
  },
  getServerInstance(uuid = '') {
    const servers = this.getServers();
    return servers.find(data => {
      return data.uuid == uuid;
    });
  },
  addRemoteDebugServer(project = {}) {
    const server = {
      name: project.name,
      uuid: `${project.name}-debug`,
      path: project.path,
      mode: 'debug'
    };
    this.pushServer(server);
  },
  addRemoteDistServer(project = {}) {
    const server = {
      name: project.name,
      uuid: `${project.name}`,
      path: project.path,
      mode: 'dist',
      cache: true
    };
    this.pushServer(server);
  },
  removeRemoteServer(uuid) {
    const servers = this.getServers();
    const exists = servers.find(data => {
      return data.uuid == uuid;
    });
    if (exists) {
      const index = servers.indexOf(exists);
      servers.splice(index, 1);
    }
    return M.Runtime.Session.set('ewsedu/proxy/servers', servers);
  },
  pushServer(server = {}) {
    const servers = this.getServers();
    const exists = servers.find(data => {
      return data.uuid == server.uuid;
    });
    if (!exists) {
      servers.push(server);
    } else {
      servers.splice(servers.indexOf(exists), 1, server);
    }
    return M.Runtime.Session.set('ewsedu/proxy/servers', servers);
  },
  connect() {
    if (this.io) {
      this.io.disconnect();
      this.io = null;
    }
    const config = this.getConfig();
    const remote = config.remote;
    const socket = io(`ws://${remote}/intranet`, {
      query: {
        uuid: Application.uuid
      }
    });
    socket.on('connect', () => {
      console.log('proxy connect');
    });
    socket.on('discconect', () => {
      console.log('proxy disconnect');
    });
    socket.on('ews/request', query => {
      const server = this.getServerInstance(query.instance);
      Vue.prototype.$request('http-proxy', {
        query,
        server
      }).then(response => {
        if (response) {
          console.log('ews/response');
          socket.emit('ews/response', {
            requestid: query.requestid,
            response
          });
        }
      });
    });
    this.io = socket;
  }
};
Vue.prototype.$proxy = ProxyMaster;

M.on('ready', () => {
  Vue.use(M.MountPoint.Vue);
  const instance = Object.assign(Runtime, {
    vm: new Vue({
      el: '#app',
      store,
      router,
      components: {
        App
      },
      template: '<App />',
      created() {
        this.$application.init();
        this.$proxy.init();
        this.$root.io = {};
        this.$request('get-local-port').then(localPort => {
          const local = io('ws://127.0.0.1:' + localPort);
          local.on('main-console', e => {
            console.log(e);
          });
          this.$root.io.local = local;
        });
      }
    })
  });
  window.addEventListener('plus-webview-trigger', listener => {
    const detail = listener.detail;
    instance.vm.$emit(detail.event, detail.data);
  });
});
