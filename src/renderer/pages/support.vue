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
    .dir-path {
      cursor: pointer;
    }
    .dir-path:hover {
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
.ivu-table-cell span.uri {
  cursor: pointer;
}
.ivu-table-cell span.uri:hover  {
  text-decoration: underline;
}
</style>

<template>
  <Layout :style="{padding: '0 24px 24px'}">
    <Content :style="{padding: '24px', paddingTop: '80px', minHeight: '280px', background: '#fff', overflow: 'scroll'}">
      <Button type="success" @click="addServer">新增转发</Button>
      <Table :columns="columns1" :data="servers"></Table>
    </Content>
    <Modal
        v-model="status.addServer"
        title="新增转发"
        @on-ok="ok"
        @on-cancel="cancel">
      <Form :model="form" :label-width="80">
        <FormItem label="名称">
          <Input v-model="form.name" placeholder="请输入"></Input>
        </FormItem>
        <FormItem label="uuid">
          <Input v-model="form.uuid" placeholder="请输入"></Input>
        </FormItem>
        <FormItem label="缓存">
          <i-switch v-model="form.cache" size="large">
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </i-switch>
        </FormItem>
        <FormItem label="转发地址">
          <Input v-model="form.name" placeholder="请输入"></Input>
        </FormItem>
      </Form>
    </Modal>
  </Layout>
</template>

<script>
const shortid = require('shortid');

export default {
  name: 'select-school',
  data() {
    return {
      status: {
        addServer: false
      },
      config: {
      },
      form: {},
      connected: null,
      columns1: [{
        title: '名称',
        key: 'name'
      }, {
        title: 'uuid',
        key: 'uuid'
      }, {
        title: '转发方式',
        key: 'mode'
      }, {
        title: '缓存',
        key: 'cache'
      }, {
        title: 'host',
        key: 'host',
        render: (h, params) => {
          return h('span', {
            class: ['uri'],
            on: {
              click: () => {
                this.Toast.show('已复制');
                this.$copyText(params.row.host);
              }
            }
          }, params.row.host);
        }
      }, {
        title: '操作',
        render: (h, params) => {
          const row = params.row || {};
          return h('div', [
            h('Button', {
              props: {
                type: 'error',
                size: 'small'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.clear(row);
                }
              }
            }, '清除缓存'),
            h('Button', {
              props: {
                type: 'error',
                size: 'small'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.delete(row);
                }
              }
            }, '删除')
          ]);
        }
      }],
      servers: []
    };
  },
  methods: {
    delete(row = {}) {
      this.$proxy.removeRemoteServer(row.uuid);
      this.getServers();
    },
    clear(row = {}) {
      this.$request('clear-cache', row.uuid).then(() => {
        this.Toast.show('操作成功');
      });
    },
    addServer() {
      this.status.addServer = true;
      this.form.uuid = shortid.generate();
    },
    getServers() {
      const servers = this.$proxy.getServers() || [];
      this.servers = servers.map(node => {
        node.host = this.$proxy.getAddress(node.uuid);
        return node;
      });
    }
  },
  mounted() {
    this.getServers();
  }
};
</script>
