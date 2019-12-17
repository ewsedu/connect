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
</style>

<template>
  <Layout :style="{padding: '0 24px 24px'}">
    <Content :style="{padding: '24px', paddingTop: '80px', minHeight: '280px', background: '#fff', overflow: 'scroll'}">
      环境变量:
      <json-viewer :value="env" :expand-depth="2" copyable sort></json-viewer>
      版本信息：
      <json-viewer :value="versions" :expand-depth="2" copyable sort></json-viewer>
      <!-- <Form :model="formItem" :label-width="120">
        <FormItem label="系统版本">
          <Input v-model="version" readonly type="text"></Input>
        </FormItem>
        <FormItem>
            <Button type="primary">保存</Button>
        </FormItem>
      </Form> -->
    </Content>
  </Layout>
</template>

<script>

export default {
  name: 'select-school',
  data() {
    return {
      config: {
      },
      connected: null,
      formItem: {},
      columns1: [{
        title: '名称',
        key: 'name'
      }, {
        title: '转发方式',
        key: 'mode'
      }, {
        title: 'host',
        key: 'host'
      }],
      servers: [],
      version: '',
      versions: '',
      env: ''
    };
  },
  methods: {
  },
  mounted() {
    this.version = process.version;
    this.versions = process.versions;
    this.env = process.env;
    console.log(this.version);
  }
};
</script>
