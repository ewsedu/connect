<style scoped lang="scss">
    .panel-container {
        margin-top: 80px;
        .panel-body {
            position: relative;
            height: calc(100vh - 140px);
            overflow: hidden;
            .panel-content {
                height:calc(100% - 80px);
                position: relative;
                overflow: auto;
                .school-item {
                    cursor: pointer !important;
                    .school-name {
                        font-size: 1rem;
                    }
                }
                .school-item-active {
                    box-shadow: 0 0 4px orange;
                    background-color: rgba(255, 165, 0, 0.05);
                }
            }
            .page-control {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                padding: 10px 0;
                margin: 0 auto;
                text-align: center;
                box-shadow:0 -2px 6px rgba(177,177,177,.5);
                background-color: #ffffff;
            }
        }
    }

    .action-menu-container {
        display: flex;
        flex-flow: nowrap row;
        justify-content: space-around;
        align-items: center;
        .action-menu-item {
            position: relative;
            cursor: pointer;
            font-size: .85rem;
            letter-spacing: 1px;
            border: 1px solid #efefef;
            padding: 10px 20px;
            transition: all 200ms ease-in-out;
            text-align: center;
            color: #666;
            .action-menu-title {
                border-top: 1px solid #efefef;
                margin-top: 10px;
                padding-top: 10px;
            }
            .action-menu-count {
                position: absolute;
                top: -10px;
                right: -10px;
                width: 30px;
                height: 20px;
                border-radius: 2px;
                background-color: red;
                color: #ffffff;
                padding: 0 5px;
                text-align: center;
                line-height: 20px;
                overflow: hidden;
                font-size: .8rem;
            }
            &:hover {
                box-shadow: 0 0 8px #2494F2;
            }
        }
    }
    .dir {
      width: 100%;
      height: 30px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .dir-path, .uri {
      cursor: pointer;
    }
    .dir-path:hover, .uri:hover {
      text-decoration: underline;
    }
    .v-console {
      background: #f9f9f9;
      border: 1px solid #cecccc;
    }
    .v-console .v-console-logs {
      max-height: 600px;
      overflow: scroll;
      padding: 8px 16px;
    }
    .v-console .console-item{
      border-bottom: 1px solid #cecccc;
      padding: 8px 0px;
    }
    .v-console /deep/ .ivu-alert {
      margin-bottom: 0px;
    }

    .v-console .console-item:last-child{
      border-bottom: none;
    }
    .v-console-search {
      height: 30px;
      background: white;
      border-top: 1px solid #cecccc;
      padding: 0px 10px;
    }
    .v-console-search .search {
      background: none;
      border: none;
      outline: none;
      width: 100%;
      height: 100%;
      line-height: 30px;
    }
    .v-console-control {
      height: 45px;
      padding: 10px;
      background: white;
      border-top: 1px solid #cecccc;
    }

.my-warn-json-theme {
  background: #332b00;
  white-space: nowrap;
  color: #c1a06e;
  font-size: 12px;
  font-family: Consolas, Menlo, Courier, monospace;

  .jv-ellipsis {
    color: #999;
    background-color: #eee;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 4px 2px 4px;
    border-radius: 3px;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }
  .jv-button { color: #49b3ff }
  .jv-key { color: #111111 }
  .jv-item {
    &.jv-array { color: #111111 }
    &.jv-boolean { color: #fc1e70 }
    &.jv-function { color: #067bca }
    &.jv-number { color: #fc1e70 }
    &.jv-object { color: #111111 }
    &.jv-undefined { color: #e08331 }
    &.jv-string {
      color: #42b983;
      word-break: break-word;
      white-space: normal;
    }
  }
  .jv-code {
    color: #c1a06e;
    .jv-toggle {
      &:before {
        padding: 0px 2px;
        border-radius: 2px;
      }
      &:hover {
        &:before {
          background: #eee;
        }
      }
    }
  }
}
.qr-code {
  width: 200px;
}
.demo-split-pane {
  min-height: 600px;
}
/deep/ .vue-codemirror {
  height: 100%;
}
/deep/ .CodeMirror {
  height: 100%;
}
</style>

<template>
  <Layout>
    <Sider>
        <Menu active-name="1-2" theme="dark" width="auto" :open-names="['1']">
            <Submenu name="1">
                <template slot="title">
                    <Icon type="ios-navigate"></Icon>
                    Item 1
                </template>
            </Submenu>
            <MenuItem name="open-target" @click.native="openTarget">
              <Icon type="ios-navigate"></Icon>
              打开目录
            </MenuItem>
            <MenuItem name="open-target" v-for="(item, index) in projectList" :key="index" @click.native="showTargetInfo(item)">
              {{item.name}} <Tag color="success" size="default" v-if="getRunningStatus(item)">运行中</Tag>
              <div class="dir">{{item.path}}</div>
            </MenuItem>
        </Menu>
    </Sider>x
    <Layout :style="{padding: '0 24px 24px'}">
      <Content :style="{padding: '24px', paddingTop: '80px', minHeight: '280px', background: '#fff', overflow: 'scroll'}" v-if="project.name">
        <Form :model="formLeft" label-position="left" :label-width="100">
          <FormItem label="项目名称">
            {{project.name}}
          </FormItem>
          <FormItem label="项目地址" @click.native="enterDir(project.path)" class="dir-path">{{project.path}}</FormItem>
          <FormItem label="Git" v-if="project.response.isRepo">{{project.response.log}}</FormItem>
          <FormItem label="状态">
            <Tag color="warning" v-if="project.pkg.isDevelopment">开发模式</Tag>
            <Tag v-else color="primary">生产模式</Tag>
            <Tag color="warning" v-if="project.pkg.isBeta">测试版</Tag>
            <Tag color="success" v-if="project.pkg.isRelease">发行版</Tag>
            <Tag color="blue" v-if="getRunningStatus(project)">运行中</Tag>
          </FormItem>
          <FormItem label="发行">
            <Button type="info" size="small" @click="buildPackage(project)">构建</Button>
            <Button type="success" size="small" @click="archivePackage(project)">打包</Button>
            <Button type="primary" size="small" @click="publishPackage(project)" :loading="status.publishPackage">发布</Button>
          </FormItem>
          <FormItem label="运行">
            <Button type="error" size="small" v-if="getRunningStatus(project)" @click="stopServer(project)">停止服务</Button>
            <Button type="success" size="small" v-if="!getRunningStatus(project)" @click="buildServer(project)">启动服务</Button>
          </FormItem>
          <FormItem label="公网调试" v-if="project.pkg.isDevelopment">
            <i-switch v-model="publicDebug" @on-change="switchPublicDebug" />
            <span @click="copy(publicDebugUrl)" class="uri">{{publicDebugUrl}}</span>
          </FormItem>
          <FormItem label="远程调试" v-if="project.response.package.ewsedu.type == 'app' && qrcodeUrl">
            <div class="qr-code">
              <qrcode v-if="qrcodeUrl" :text="qrcodeUrl" width="200"></qrcode>
            </div>
          </FormItem>
        </Form>
        <div class="build-info">
          <Alert type="info" v-if="buildMessage">
            <span v-html="buildMessage"></span>
          </Alert>
        </div>
        <Tabs value="console">
          <TabPane label="Console" name="console">
            <div class="v-console" ref="vconsole">
              <div class="v-console-logs" ref="vlogs">
                <div class="console-item" v-for="(item, index) in history" :key="index" v-if="logs && logs.length > 0">
                  <Alert banner :type="item.type || 'info'">
                    <span v-if="item.time">[{{item.time}}]</span> console.{{item.cmd}}: <span v-if="!(item.args[0] instanceof Object)">{{item.args[0]}}</span>
                    <json-viewer v-if="(item.args[0] instanceof Object)" :theme="`${item.cmd == 'log' ? 'jv-light' : `my-${item.cmd}-json-theme` }`" :value="item.args[0]" :expand-depth="0" copyable sort boxed></json-viewer>
                  </Alert>
                </div>
                <Alert v-if="logs.length == 0" type="warning">暂无日志信息</Alert>
              </div>
              <div class="v-console-search">
                <input class="search" v-model="searchWord" ref="search" placeholder="搜索">
              </div>
              <div class="v-console-control">
                <Button type="warning" size="small" @click="clearLogs(project)">清屏</Button>
                <Button type="info" size="small" :ghost="!lockLog" @click="lockLog = !lockLog">锁定</Button>
                <Button type="primary" size="small" @click="scrollToBottom(project)">滚动到底部</Button>
                当前共有{{logs.length}}条日志
              </div>
            </div>
          </TabPane>
          <TabPane label="Network" name="network">
            <div id="awesome-shell" ref="awesome-shell"></div>
          </TabPane>
          <!-- <TabPane label="Config" name="config">
            <Split>
                <div slot="left" class="demo-split-pane">
                  <Tree :data="configTree" @on-select-change="choseConfig"></Tree>
                </div>
                <div slot="right" class="demo-split-pane" style="height:100%; min-height: 600px;">
                  <codemirror v-model="code" :options="editorOptions"></codemirror>
                </div>
            </Split>
          </TabPane> -->
        </Tabs>
        <!-- <codemirror v-model="code" :options="editorOptions"></codemirror> -->
      </Content>
    </Layout>
    <Modal
        v-model="buildModal"
        title="构建">
      <Row>
        <Col span="8">
          <Steps :current="buildStep" direction="vertical">
            <Step title="环境设置" content="选择构建环境"></Step>
            <Step title="发行设置" content="选择是否发行" v-show="buildForm.env == 'production'"></Step>
            <Step title="配置文件" content="选择配置文件"></Step>
            <Step title="设置版本" content="输入构建版本"></Step>
            <Step title="确认配置" content="确认构建信息"></Step>
            <Step title="构建" content="构建"></Step>
          </Steps>
        </Col>
        <Col span="16">
          <div class="build-step" v-if="buildStep == 0">
            <RadioGroup v-model="buildForm.env" vertical>
              <Radio v-for="(item, index) in choices.env" :key="index" :label="item.value" border>{{item.name}}</Radio>
            </RadioGroup>
          </div>
          <div class="build-step" v-if="buildStep == 1 && buildForm.env == 'production'">
            <RadioGroup v-model="buildForm.release" vertical>
              <Radio v-for="(item, index) in choices.release" :key="index" :label="item.value" border>{{item.name}}</Radio>
            </RadioGroup>
          </div>
          <div class="build-step" v-if="buildStep == 2">
            <RadioGroup v-model="buildForm.conf" vertical>
              <Radio v-for="(item, index) in choices.conf" :key="index" :label="item.value" border>{{item.name}}</Radio>
            </RadioGroup>
          </div>
          <div class="build-step" v-if="buildStep == 3">
            <InputNumber :min="1" v-model="buildForm.version"></InputNumber>
          </div>
          <div class="build-step" v-if="buildStep == 4">
            <CellGroup>
              <Cell v-for="(item, index) in task" :key="index" :title="`${index}:${item}`" />
            </CellGroup>
          </div>
          <div class="build-step" style="max-height: 300px;" v-if="buildStep == 5" v-html="buildMessage"></div>
        </Col>
      </Row>
      <div slot="footer">
        <Button type="info" size="large" @click="prev">上一步</Button>
        <Button type="primary" size="large" @click="next">下一步</Button>
      </div>
    </Modal>
  </Layout>
</template>

<script>
import 'codemirror/theme/monokai.css';
import Shell from 'shell.js';

const ip = require('ip');
const types = {
  warn: 'warning',
  error: 'error',
  log: 'success',
  info: 'info',
  debug: 'warning'
};

export default {
  name: 'select-school',
  data() {
    return {
      formLeft: {},
      code: '',
      buildStep: 0,
      lockLog: false,
      publicDebug: false,
      buildModal: false,
      buildDev: false,
      searchWord: '',
      split: '0.5',
      editorOptions: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        mode: 'text/javascript',
        theme: 'monokai'
      },
      status: {
        publishPackage: false,
        loadingSchoolList: false,
        actionMenu: false
      },
      buildForm: {
        env: '',
        release: '',
        conf: '',
        version: 0
      },
      choices: {},
      data: {
        school: {},
        schoolList: [],
        galleryCount: 0
      },
      task: {},
      active: '',
      projects: [],
      projectList: [],
      processList: [],
      logs: [],
      config: {
        pageControl: {
          defaultPageSize: 15,
          totalCount: 0,
          offset: 0
        }
      },
      params: {
        keyword: ''
      },
      customConfigs: [],
      timer: null,
      refreshTimer: null,
      buildMessage: ''
    };
  },
  methods: {
    getCustomConfigs(project = this.project) {
      this.customConfigs = [];
      this.$request('request-custom-configs', project).then(configs => {
        this.customConfigs = configs;
      });
    },
    openTarget() {
      this.$request('open-directory-dialog', 'openDirectory').then((paths = []) => {
        if (!paths) {
          return false;
        }
        if (paths[0]) {
          return this.$request('open-dev-target', paths[0]);
        } else {
          return false;
        }
      }).then(response => {
        if (!response) {
          return false;
        }
        const pack = response.package || {};
        const ewsedu = pack.ewsedu || null;
        if (!ewsedu) {
          this.Toast.show('该目录不是一个有效的开发目录', 'error');
          return false;
        }
        const list = this.Runtime.Session.get('project-list') || [];
        const exists = list.find(data => {
          return data.path == response.path;
        });
        if (exists) {
          this.Toast.show('该目录已存在', 'error');
        } else {
          list.push({
            name: ewsedu.name,
            bundle: ewsedu.bundle,
            path: response.path
          });
        }
        this.Runtime.Session.set('project-list', list);
        this.refreshProjects();
      });
      // this.$electron.ipcRenderer.send('open-directory-dialog', 'openDirectory');
    },
    refreshProjects() {
      const list = this.Runtime.Session.get('project-list') || [];
      this.$request('request-projects', list).then(this.receiveProjects);
    },
    refreshLogs(project = this.project) {
      this.logs = [];
      this.$root.io.local.emit('request-message', {
        bundle: project.name
      }, logs => {
        this.logs = logs;
        this.refreshConsole();
      });
    },
    copy(text) {
      this.Toast.show('已复制' + text);
      return this.$copyText(text);
    },
    receiveProjects(response) {
      this.projectList = response.projects;
      this.processList = response.processes;
      setTimeout(() => {
        this.refreshProjects();
      }, 1000);
    },
    enterDir(path) {
      this.$request('open-dir', path);
    },
    getRunningInfo(item = {}) {
      const path = item.path;
      return this.processList.find(node => {
        return node.path == path;
      }) || false;
    },
    getRunningStatus(item = {}) {
      return !!this.getRunningInfo(item);
    },
    showTargetInfo(item) {
      this.active = item.name;
      this.getCustomConfigs();
      this.refreshLogs();
    },
    refreshConsole(force = false) {
      if (this.lockLog && !force) {
        return false;
      }
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }
      this.refreshTimer = setTimeout(() => {
        if (this.$refs.vlogs) {
          this.$refs.vlogs.scrollTo(0, this.$refs.vlogs.scrollHeight);
        }
      }, 100);
    },
    clearLogs() {
      this.logs = [];
      this.refreshConsole(true);
    },
    scrollToBottom() {
      this.refreshConsole(true);
    },
    stopServer(project) {
      const info = this.getRunningInfo(project);
      this.$electron.ipcRenderer.send('stop-server', info);
    },
    startServer(project = this.project, options = {}) {
      this.$electron.ipcRenderer.send('run-task', project, options);
    },
    archivePackage(project = this.project) {
      this.$request('archive-package', project);
    },
    buildServer(project = this.project) {
      this.buildPackage(project, true);
    },
    switchPublicDebug(flag = false) {
      if (flag) {
        this.$proxy.addRemoteDebugServer(this.project);
      } else {
        this.$proxy.removeRemoteDebugServer(this.project);
      }
    },
    buildPackage(project = this.project, buildDev = false) {
      this.buildDev = buildDev;
      this.buildStep = buildDev ? 2 : 0;
      this.buildForm = {
        env: 'development',
        release: 0,
        conf: 'env'
      };
      this.buildModal = true;
      Promise.all([
        this.$request('app-proxy', {
          project,
          name: 'getEnvChoices'
        }),
        this.$request('app-proxy', {
          project,
          name: 'getReleaseChoices'
        }),
        this.$request('app-proxy', {
          project,
          name: 'getConfChoices'
        })
      ]).then(response => {
        const [ env, release, conf ] = response;
        this.choices = {
          env,
          release,
          conf
        };
      });
    },
    publishPackage(project = this.project) {
      if (this.project.pkg.isDevelopment) {
        this.Toast.show('当前模式为开发模式，请使用公网调试功能');
        return false;
      }
      this.status.publishPackage = true;
      this.$request('publish-package', project).then(() => {
        this.status.publishPackage = false;
        this.$proxy.addRemoteDistServer(project);
        this.Toast.show('发布成功，远程调试地址已复制');
        this.$copyText(this.$proxy.getAddress(project.name));
      });
    },
    deepMatch(matcher = {}, word = '') {
      const string = JSON.stringify(matcher);
      return string.indexOf(word) > -1;
    },
    pullGit(project = this.project) {
      this.$request('pull-git', project).then(result => {
      });
    },
    choseConfig(node) {
      const config = node[0].title;
      this.$request('get-config-raw', {
        project: this.project,
        config
      }).then(raw => {
        this.code = raw;
      });
    },
    prev() {
      if (this.buildStep <= 0) {
        return false;
      }
      this.buildStep--;
      if (this.buildStep == 1 && this.buildForm.env != 'production') {
        this.buildStep--;
      }
    },
    next() {
      if (this.buildStep == 5) {
        this.buildModal = false;
        return false;
      }
      this.buildStep++;
      if (this.buildStep == 1 && this.buildForm.env != 'production') {
        this.buildStep++;
      }
      if (this.buildStep == 3) {
        this.$request('app-proxy', {
          project: this.project,
          name: 'getBuildVersion',
          args: [{
            env: this.buildForm.env,
            release: this.buildForm.release,
            configEnv: this.buildForm.conf
          }]
        }).then(response => {
          this.buildForm.version = response;
        });
      } else if (this.buildStep == 4) {
        this.$request('app-proxy', {
          project: this.project,
          name: 'confirm',
          args: [{
            env: this.buildForm.env,
            configEnv: this.buildForm.conf,
            buildVersion: this.buildForm.version
          }]
        }).then(response => {
          this.task = response;
        });
      } else if (this.buildStep == 5) {
        this.startServer(this.project, {
          env: this.buildForm.env,
          config: this.buildForm.conf,
          release: this.buildForm.release,
          version: this.buildForm.version,
          server: this.buildDev ? 1 : 0
        });
      }
    },
    cancel() {
    }
  },
  mounted() {
    this.refreshProjects();
    setTimeout(() => {
      this.$root.io.local.on('remote-console', message => {
        this.logs.push(message);
        this.refreshConsole();
      });
      this.$root.io.local.on('task-stdout-data', message => {
        if (message.data) {
          this.buildMessage = message.data;
        }
      });
      this.$root.io.local.on('task-stderr-data', message => {
        this.buildMessage = message.data.toString();
      });
    }, 300);
    const shell = new Shell('#awesome-shell', {
      user: 'foobar',
      host: 'MacMini',
      path: '/etc/',
      style: 'osx',
      theme: 'dark',
      responsive: false,
      commands: [ 'First command', 'Second command', '...' ]
    });
    console.log(shell);
  },
  computed: {
    project() {
      if (this.active) {
        const project = this.projectList.find(node => {
          return node.name == this.active;
        });
        const response = project.response || {};
        project.pkg = response.pkg || {};
        return project;
      }
      return {};
    },
    publicDebugUrl() {
      if (this.active && this.publicDebug) {
        return this.$proxy.getAddress(this.active + '-debug');
      }
      return '';
    },
    qrcodeUrl() {
      const host = ip.address();
      const project = this.project;
      // const status = this.getRunningStatus(project);
      // if (!status) {
      //   return '';
      // }
      const request = {
        action: 'redirect',
        path: '/user/developer/lan-install',
        params: {
          host,
          port: 36987,
          project: {
            name: project.name,
            path: project.path
          }
        }
      };
      return `http://web.app.ewsedu.com/common/transfer/proxy?request=${encodeURIComponent(JSON.stringify(request))}`;
    },
    configTree() {
      const configs = this.customConfigs || [];
      return configs.map(node => {
        return {
          title: node
        };
      });
    },
    history() {
      const logs = (this.logs || []).filter(node => {
        if (!this.searchWord) {
          return true;
        }
        const matchs = node.args || {};
        let match = false;
        for (const k in matchs) {
          const matcher = matchs[k];
          if (matcher instanceof Object) {
            match = this.deepMatch(matcher, this.searchWord);
          } else {
            if ((matcher.toString()).indexOf(this.searchWord) > -1) {
              match = true;
            }
          }
        }
        return match;
      });
      this.refreshConsole();
      return logs.map(node => {
        node.type = types[node.cmd];
        return node;
      });
    }
  },
  watch: {
    active(val) {
      this.publicDebug = this.$proxy.isOpen(val + '-debug');
    },
    'params.keyword'(keyword) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.searchBySchoolName(keyword);
      }, 800);
    }
  }
};
</script>
