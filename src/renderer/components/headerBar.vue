<style scoped lang="scss">
    .header-container {
        position: fixed;
        width: 100%;
        top: 0;
        height: 60px;
        z-index: 1000;
        margin-bottom: 10px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        -webkit-app-region: drag;
        background: #4e8cfe;
        background: -webkit-gradient(linear, 0 100%, 0 0, from(#4e8cfe), to(#38b9fd));
        background: -webkit-linear-gradient(90deg, #4e8cfe, #38b9fd);
        background: linear-gradient(90deg, #4e8cfe, #38b9fd);
        background: -moz-linear-gradient(90deg, #4e8cfe, #38b9fd);
        background: -o-linear-gradient(90deg, #4e8cfe, #38b9fd);
        .header-band {
            cursor: pointer;
            line-height: 1.6;
            height: 60px;
            display: flex;
            flex-flow: nowrap row;
            align-items: center;
            align-content: center;
            color: white;
            cursor: pointer;
            img {
                position: absolute;
                top: 0;
                left: 0;
                width: 60px;
                height: 60px;
                box-shadow: 2px 2px 6px rgba(0, 0, 0, .1);
            }
            .head-logo {
              -webkit-app-region: no-drag !important;
            }
            .text {
                text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
                letter-spacing: 2px;
                font-size: 1.1rem;
                margin-left: 80px;
                span {
                    display: block;
                    font-size: .85rem;
                }
            }
        }
        .header-action {
            -webkit-app-region: no-drag !important;
            position: absolute;
            border-radius: 2px;
            top: 0;
            right: 5px;
            letter-spacing: 1px;
            .header-user-btn {
                display: inline-block;
                padding: 2px 14px;
                line-height: 20px;
                border-radius: 4px;
                color: #fff;
                box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2) inset;
                transition: all 200ms;
            }
            .header-action-item {
                display: inline;
                padding: 8px;
                font-size: 1.3rem;
                transition: all 200ms ease-in;
                color: #ffffff;
                text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
                &:hover {
                    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.4);
                }
            }
        }

    }
</style>

<template>
    <div class="header-container">
        <Menu mode="horizontal" theme="dark" active-name="1">
            <div class="header-band" @click="toIndex">
              <div class="head-logo">
                <pic src="logo.png"></pic>
                <div class="text">
                    学拓帮
                    <span>Ewsedu Connect</span>
                </div>
              </div>
            </div>
            <div class="header-action">
                <Dropdown placement="bottom-start" style="margin-left: 20px" v-if="user.id > 0">
                    <a href="javascript:void(0)" class="header-user-btn">
                        {{user.name}}
                        <Icon type="ios-arrow-down"></Icon>
                    </a>
                    <DropdownMenu slot="list">
                        <DropdownItem @click.native="openDev">打开调试工具</DropdownItem>
                        <DropdownItem @click.native="logout">注销</DropdownItem>
                        <DropdownItem @click.native="clearData">清除数据</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <div class="header-action-item" @click="windowsAction('min')">
                    <Icon type="md-remove"/>
                </div>
                <div class="header-action-item" @click="windowsAction('max')">
                    <Icon type="ios-browsers-outline"/>
                </div>
                <div class="header-action-item" @click="windowsAction('close')">
                    <Icon type="md-close"/>
                </div>
            </div>
        </Menu>
    </div>
</template>

<script>
export default {
  name: 'header-bar',
  data() {
    return {
      user: {
        name: '学拓帮运营人员',
        id: 0
      }
    };
  },
  methods: {
    windowsAction(type) {
      if (type === 'close') {
        this.$Modal.confirm({
          title: '是否确认退出',
          content: '下次启动将自动登录',
          onOk: () => {
            this.$electron.ipcRenderer.send('close');
          },
          onCancel: () => {
            this.$Message.info('已取消退出');
          }
        });
        return false;
      }
      if (type === 'back') {
        this.$router.back(-1);
        return false;
      }
      this.$electron.ipcRenderer.send(type);
    },
    openDev() {
      this.$request('open-dev-tools');
    },
    logout() {
      this.$Modal.confirm({
        title: '确认注销当前账号？',
        content: '注销后软件将重新启动。',
        onOk: () => {
          this.Runtime.Passport.logout();
          this.$electron.remote.app.relaunch();
          this.$electron.remote.app.exit();
        },
        onCancel: () => {
          this.$Message.info('已取消注销');
        }
      });
    },
    toIndex() {
      this.$router.push({name: 'index'});
    },
    clearData() {
      this.$Modal.confirm({
        title: '确认清空所有数据和未上传的图片？',
        content: '确认后将清除所有拍照数据并重新启动。',
        onOk: () => {
          this.$db.remove({}, {multi: true});
          this.$electron.remote.app.relaunch();
          this.$electron.remote.app.exit();
        },
        onCancel: () => {
          this.$Message.info('已取消清除数据');
        }
      });
    }
  },
  mounted() {
    if (this.Runtime.User) {
      this.user = this.Runtime.User.user || {};
    }
  }
};
</script>
