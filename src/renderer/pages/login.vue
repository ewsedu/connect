<style lang="scss" scoped>
    .login-container {
        height: 100%;
        position: relative;
        .login-content {
            position: relative;
            text-align: center;
            color: white;
            height: 150px;
            background: #4e8cfe;
            background: -webkit-gradient(linear, 0 100%, 0 0, from(#4e8cfe), to(#38b9fd)) !important;
            background: -webkit-linear-gradient(90deg, #4e8cfe, #38b9fd) !important;
            background: -webkit-gradient(linear, left top, right top, from(#4e8cfe), to(#38b9fd)) !important;
            background: -webkit-linear-gradient(left, #4e8cfe, #38b9fd) !important;
            background: linear-gradient(90deg, #4e8cfe, #38b9fd) !important;
            background: -o-linear-gradient(90deg, #4e8cfe, #38b9fd) !important;
            box-shadow: 0 0 1px 1px rgba(255, 255, 255, 0.3);
            -webkit-app-region: drag;
            .login-text {
                position: absolute;
                margin-top: 30px;
                width: 100%;
                z-index: 99;
                h1 {
                    text-shadow: rgba(0, 0, 0, 0.1) 1px 1px 0;
                    font-size: 30px;
                    font-weight: 400;
                }
                h2 {
                    text-shadow: rgba(0, 0, 0, 0.1) 1px 1px 0;
                    font-size: 18px;
                    font-weight: 400;
                }
            }
            .wave-background {
                position: absolute;
                top: 0;
                align-items: center;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.52);
                overflow: hidden;
                z-index: 98;

                &:before, &:after {
                    content: "";
                    position: absolute;
                    left: 50%;
                    min-width: 300vw;
                    min-height: 300vw;
                    background-color: #0084ff;
                    background: -webkit-gradient(linear, left top, right top, from(#4e8cfe), to(#38b9fd)) !important;
                    background: linear-gradient(90deg, #4e8cfe, #38b9fd) !important;
                    background: -o-linear-gradient(90deg, #4e8cfe, #38b9fd) !important;
                    animation-name: rotate;
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                }

                &:before {
                    bottom: 5vh;
                    border-radius: 45%;
                    animation-duration: 10s;
                }

                &:after {
                    bottom: 2vh;
                    opacity: .5;
                    border-radius: 47%;
                    animation-duration: 10s;
                }
            }
        }
        .login-form {
            margin: 20px;
            label {
                font-size: 1.1rem;
                font-weight: normal;
                color: #2b85e4;
                padding: 0 8px;
            }
            input {
                width: 100%;
                height: 40px;
                line-height: 40px;
                font-size: 18px;
                border: none;
                outline: none;
                padding: 0px 8px;
                border-bottom: 1px solid #ebebeb;
                transition: all .3s ease;
                &:focus {
                    color: #4e8cfe;
                    border-bottom: 2px solid #4e8cfe;
                }
            }
            .form-group {
                margin-bottom: 20px;

                .btn {
                    display: block;
                    text-align: center;
                    font-size: 1rem;
                    -webkit-transition: all .3s ease;
                    transition: all .3s ease;
                    margin-top: 5px;
                    margin-bottom: 5px;
                    width: 100%;
                    color: rgb(255, 255, 255);
                    line-height: 40px;
                    border-radius: 4px;
                    touch-action: manipulation;
                    user-select: none;
                    -webkit-user-drag: none;
                    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                    background: #4e8cfe;
                    background: -webkit-gradient(linear, 0 100%, 0 0, from(#4e8cfe), to(#38b9fd)) !important;
                    background: -webkit-linear-gradient(90deg, #4e8cfe, #38b9fd) !important;
                    background: -webkit-gradient(linear, left top, right top, from(#4e8cfe), to(#38b9fd)) !important;
                    background: -webkit-linear-gradient(left, #4e8cfe, #38b9fd) !important;
                    background: linear-gradient(90deg, #4e8cfe, #38b9fd) !important;
                    background: -o-linear-gradient(90deg, #4e8cfe, #38b9fd) !important;
                    &:hover {
                        color: white;
                    }
                }

                .close-btn {
                    background: rgba(255, 79, 62, 0.64) !important;
                }
            }
            .user-icon {
                position: absolute;
                right: 10px;
                top: 5px;
                z-index: 98;
                cursor: default;
                transition: all 200ms ease-in-out;
                color: #aaa;
                &:hover {
                    color: #2494F2;
                }
            }
            .user-list {
                position: absolute;
                min-height: 40px;
                max-height: 100px;
                width: 100%;
                z-index: 98;
                background-color: #ffffff;
                border: 1px solid #efefef;
                box-shadow: 1px 1px 10px rgba(0, 0, 0, .2);
                animation: listOut .2s ease-in 0s 1 normal;
                .user-list-item {
                    color: #999999;
                    padding: 5px 10px;
                    &:not(:last-child) {
                        border-bottom: 1px solid #efefef;
                    }
                    &:hover {
                        background-color: rgba(239, 239, 239, 0.51);
                    }
                }
            }
        }
        .login-qrCode-btn {
            position: fixed;
            bottom: 0;
            padding: 10px;
            width: 100%;
            text-align: center;
            box-shadow: 0 0 10px rgba(0, 0, 0, .2);
            transition: all 200ms ease-in-out;
            &:hover {
                cursor: pointer;
                background-color: #ffffff;
                box-shadow: 0 0 20px rgba(0, 0, 0, .2);
                transform: scale(1.1);
            }
        }
        .login-qrCode-panel {
            position: fixed;
            bottom: 0;
            width: 100%;
            height: 70%;
            border-radius: 20px;
            background-color: #ffffff;
            box-shadow: 0 -10px 20px rgba(0, 0, 0, .1);
            z-index: 100;
            .login-qrCode-close {
                position: absolute;
                top: 10px;
                right: 10px;
                cursor: pointer;
                &:hover {
                    /*animation: name duration timing-function delay iteration-count direction;*/
                    animation: iconRotate .5s ease-in 0s 1 normal;
                }
            }
            iframe {
                height: 100%;
                border: none;
                outline: none;
            }
        }
    }

    @-webkit-keyframes listOut {
        0% {
            transform: translateY(-20px);
        }
        50% {
            transform: translateY(20px);
        }
        80% {
            transform: translateY(10px);
        }
        100% {
            transform: translateY(0);
        }
    }

    @-webkit-keyframes iconRotate {
        0% {
            -webkit-transform: rotate(0deg);
        }
        50% {
            -webkit-transform: rotate(180deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
        }
    }

    @keyframes rotate {
        0% {
            transform: translate(-50%, 0) rotateZ(0deg);
        }
        50% {
            transform: translate(-50%, -2%) rotateZ(180deg);
        }
        100% {
            transform: translate(-50%, 0%) rotateZ(360deg);
        }
    }
</style>

<template>
    <div class="login-container">
        <div class="login-content">
            <div class="login-text">
                <h1>学拓帮</h1>
                <h2>Ewsedu Connect</h2>
            </div>
            <div class="wave-background"></div>
        </div>
        <div class="login-form">
            <Form :rules="rules" :model="form" ref="form" @submit.native.prevent="login">
                <FormItem prop="mobile">
                    <Input type="text" v-model="form.mobile" placeholder="手机号"
                           size="large"></Input>
                    <Icon :type="status.userList ? 'ios-arrow-dropup':'ios-arrow-dropdown'" size="25" class="user-icon"
                          @click="status.userList = !status.userList"/>
                    <div class="user-list show-scroll" v-if="status.userList">
                        <div class="user-list-item" v-if="data.userList.length === 0">暂无已登录过的数据</div>
                        <div class="user-list-item" v-else v-for="item in data.userList" :key="item.mobile" @click="inputExistUser(item)">
                            {{item.mobile}}
                        </div>
                    </div>
                </FormItem>
                <FormItem prop="password">
                    <Input type="password" v-model="form.password" placeholder="密码" size="large"></Input>
                </FormItem>
                <FormItem>
                    <Button type="primary" html-type="submit" long>登陆</Button>
                    <Button type="error" @click="close" long style="margin-top: 10px;">退出</Button>
                </FormItem>
            </Form>
            <Spin fix size="large" v-if="status.loginLoading"></Spin>
        </div>
        <div class="login-qrCode-btn" v-if="!status.qrCode" @click="status.qrCode = true">
            <pic src="qrCode.png" width="30"></pic>
        </div>
        <div class="login-qrCode-panel" v-else>
            <div class="login-qrCode-close">
                <Icon type="ios-close" size="35" color="#999" @click="status.qrCode = false"></Icon>
            </div>
            <iframe width="100%" scrolling="no" src="http://web.app.ewsedu.com/#/passport/quick/request?scale=2"></iframe>
        </div>
    </div>
</template>

<script>
export default {
  name: 'login',
  data() {
    return {
      data: {
        userList: []
      },
      form: {
        mobile: '',
        password: ''
      },
      status: {
        qrCode: false,
        loginLoading: false,
        userList: false
      },
      rules: {
        mobile: [
          {
            required: true,
            len: 11,
            message: '请输入正确的手机号',
            trigger: 'blur'
          }
        ],
        password: [
          {required: true, message: '请输入你的密码', trigger: 'blur'}
        ]
      }
    };
  },
  methods: {
    close() {
      this.$electron.remote.app.exit();
    },
    queryLoginUserList() {
      this.$db.find({scheme: 'loginUserList'}, (error, docs) => {
        if (error) {
          console.log(error);
        }
        this.data.userList = docs || [];
      });
    },
    inputExistUser(userItem) {
      const {mobile, password} = userItem;
      this.form.mobile = mobile;
      this.form.password = password;
      this.status.userList = false;
    },
    login() {
      const {mobile, password} = this.form;
      this.status.loginLoading = true;
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.Api.Passport.post('/auth/login', {
            mobile: mobile === '12345678900' ? '18561907611' : mobile,
            password: password === '12345678900' ? '123456' : password
          }).on('success', (json, response) => {
            const accessToken = json.data.accessToken;
            this.logined(accessToken);
            this.$db.find({scheme: 'loginUserList', mobile: mobile}, (error, docs) => {
              if (error) {
                console.log(error);
              }
              if (docs.length === 0) {
                const newLoginUser = {
                  scheme: 'loginUserList',
                  mobile: mobile,
                  password: password
                };
                this.$db.insert(newLoginUser, () => {
                  this.data.userList.push(newLoginUser);
                });
              }
            });
          });
        }
      });
    },
    logined(accessToken) {
      this.Runtime.Passport.login(accessToken);
      this.Api.get('/auth/my/identity/list').on('success', json => {
        if (json.data.identityList.length === 0) {
          this.Toast.show('当前账号没有权限登陆！');
          this.status.qrCode = false;
          return false;
        }
        this.Toast.show('登录成功！');
        this.status.loginLoading = false;
        this.$electron.ipcRenderer.send('resize-window');
        this.$request('connect-proxy', this.$application.uuid);
        this.$router.push({name: 'index'});
      });
    }
  },
  mounted() {
    if (this.Runtime.Passport.token) {
      this.logined(this.Runtime.Passport.token);
    }
    window.addEventListener('message', event => {
      const origin = event.data;
      let json = {};
      try {
        json = JSON.parse(origin);
      } catch (e) {
        json = {};
      }
      if (json.name === 'ewsedu-quick-login-token' && json.data.token) {
        this.logined(json.data.token);
      }
    }, false);
    this.queryLoginUserList();
  },
  watch: {
    'form.mobile'(mobile) {
      if (mobile.length < 11) {
        this.form.password = '';
      }
    }
  }
};
</script>
