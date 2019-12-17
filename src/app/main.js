'use strict';
import appConfig from '../config/app';
import helper from './helper';
const buildConfig = require('../config/app.build');
const config = typeof (appConfig) !== 'undefined' ? appConfig : buildConfig;
export default (Runtime, instance) => {
  const M = Runtime;
  const Client = M.Client;

  M.Api.loadAgents(config.agents);
  M.Api.request.intercept.request.use(request => {
    request.headers['x-moe-access-token'] = M.Passport.token;
    request.headers['x-moe-identity-id'] = M.Identity.id;
    request.headers['x-moe-identity-type'] = config.target;
    request.headers['x-moe-client'] = JSON.stringify(Client);
    return request;
  });

  if (config.page) {
    M.Page.setBasePath(config.page);
  }

  const Passport = {
    UserInstance: Symbol('user'),
    Token: 'access-token',
    get token() {
      return M.Session.get(this.Token);
    },
    get user() {
      const instance = this[this.UserInstance];
      if (!instance) {
        const user = M.Session.get('user');
        if (user) {
          this[this.UserInstance] = user;
        }
      }
      return this[this.UserInstance] || {};
    },
    get history() {
      const history = M.Session.get('user/history') || [];
      return history;
    },
    login(accessToken = '') {
      if (this.user && this.user.id) {
        this.logout();
      }
      this.hideLogin();
      M.Session.set(this.Token, accessToken);
      return this.access(false);
    },
    access(logined) {
      return new Promise(resolve => {
        M.Api.get('/auth/my/identity/list').on('success', json => {
          const user = json.data.Admin || {};
          const identityList = json.data.identityList || {};
          const lists = identityList[config.target] || [];
          if (!lists || lists.length <= 0) {
            // ..备用
          }
          M.User.login(user);
          M.Identity.setIdentityList(identityList);
          resolve(user);
        });
      }).then(user => {
        if (!logined) {
          // const Top = M.engine.webview.getLaunchWebview();
          // return this.loadHome(Top);
        } else {
          return user;
        }
      });
    },
    logout() {
      const user = this.user;
      if (user.id > 0) {
        const history = this.history;
        const exists = history.find(data => {
          return data.id == user.id;
        });
        if (exists) {
          history.splice(history.indexOf(exists), 1);
        }
        const save = [ user ];
        if (history) {
          save.push(...history);
        }
        M.Session.set('user/history', save);
      }
      M.Session.del('access-token');
      M.Identity.logout();
      M.User.logout();
      // M.App.restart();
    },
    loadHome(webview) {
      const isHtml5Plus = M.isHtml5PlusRuntime;
      if (!isHtml5Plus) {
        M.Page.open('/');
        return false;
      }
      const id = 'app/home';
      const last = M.Webview.getWebviewById(id);
      if (last) {
        last.close();
      }
      this.hideLogin();
      const view = M.Webview.create('/home.html', id, {});
      view.hide();
      webview.append(view);
      return Promise.resolve(view);
    },
    showHome() {
      const id = 'app/home';
      const last = M.Webview.getWebviewById(id);
      if (last) {
        last.show('fade-in');
      }
    },
    hideLogin() {
      const path = '/user/auth/index';
      const index = M.Page.exists(path);
      if (index) {
        index.close();
      }
    },
    showLogin() {
      const path = '/auth/login';
      M.Page.open(path);
    },
    Connect: {
      services: [],
      init() {
        const isHtml5Plus = M.isHtml5PlusRuntime;
        if (!isHtml5Plus) {
          return Promise.resolve([]);
        }
        const engine = M.engine;
        return new Promise((resolve, reject) => {
          engine.oauth.getServices(services => {
            this.services = services;
            resolve(services);
          });
        });
      },
      isAvailable(service) {
        let find = this.services.find(data => {
          return data.id === service;
        });
        return find || false;
      },
      auth(service) {
        if (!service) {
          return Promise.reject(new Error('No Service'));
        }
        return new Promise((resolve, reject) => {
          service.login(() => {
            service.getUserInfo(event => {
              resolve(event.target);
            }, e => {
              service.logout();
              reject(new Error('认证失败，请重试'));
            });
          }, e => {
            reject(new Error('授权失败，请重试'));
          });
        });
      }
    }
  };
  const User = {
    get userid() {
      return this.user.id || 0;
    },
    get user() {
      return Passport.user;
    },
    login(user = {}) {
      return M.Session.set('user', user);
    },
    logout() {
      return M.Session.del('user');
    },
    isLogined() {
      return Passport.token && this.userid > 0;
    }
  };
  const Identity = {
    get Key() {
      const userid = User.userid;
      return {
        id: `user/${userid}/identity/id`,
        list: `user/${userid}/identity/list`,
        time: `user/${userid}/identity/time`
      };
    },
    get id() {
      const id = M.Session.get(this.Key.id);
      if (!id) {
        const target = this.first;
        const defaultId = target.id || 0;
        if (defaultId > 0) {
          this.setIdentityId(defaultId);
        }
        return defaultId;
      }
      return id;
    },
    get target() {
      const id = this.id;
      const list = this.list;
      if (list.length <= 0) {
        return {};
      }
      let target = {};
      if (!id) {
        target = this.first;
      } else {
        const exists = list.find(data => {
          return data.id == id;
        });
        target = exists || list[0];
      }
      const newId = target.id;
      if (newId != id) {
        this.setIdentityId(newId);
      }
      return target;
    },
    get first() {
      const list = this.list;
      return list.length > 0 ? list[0] : {};
    },
    get list() {
      const list = M.Session.get(this.Key.list) || [];
      return list;
    },
    get time() {
      const time = M.Session.get(this.Key.time);
      return time;
    },
    setIdentityId(id = 0) {
      M.Session.set(this.Key.id, id);
      return id;
    },
    setIdentityList(identityList) {
      let list = [];
      if (identityList instanceof Array) {
        list = identityList;
      } else {
        list = identityList[config.target];
      }
      M.Session.set(this.Key.list, list);
      M.Session.set(this.Key.time, M.Helper.datetime.time());
      // M.Page.emit('identity-refresh', list);
      return list;
    },
    logout() {
    }
  };
  const Track = {
    report(action = '', target = '', anchor = '', key = '') {
      const data = {
        action,
        target,
        anchor,
        key
      };
      return M.Api.post('/home/track/report', data).on('success', () => {
      }).on('error', () => {
      }).on('mistake', () => {
      });
    }
  };
  const Safety = {
    getKey(name = 'main') {
      return `app/safety/${name}`;
    },
    get running() {
      return this.status;
    },
    get status() {
      return this.isEnable();
    },
    get isSupportFingerprint() {
      return this.fingerprint.isSupport;
    },
    get fingerprint() {
      return M.Security.fingerprint;
    },
    get isEnable() {
      const key = this.getKey();
      return M.Session.get(key);
    },
    get isEnableFingerprint() {
      const key = this.getKey('fingerprint');
      return M.Session.get(key) && this.isSupportFingerprint;
    },
    enableFingerprint() {
      const key = this.getKey('fingerprint');
      M.Session.set(key, true);
      return true;
    },
    disableFingerprint() {
      const key = this.getKey('fingerprint');
      M.Session.del(key);
      return false;
    },
    requestAuthFingerprint(force = false) {
      return new Promise((resolve, reject) => {
        const request = this.fingerprint.authenticate();
        const promise = request.promisify;
        const isAndroid = M.Client.os.name.toLowerCase() === 'android';
        let view = null;
        if (isAndroid) {
          const param = {
            force,
            styles: {
              background: 'transparent'
            }
          };
          view = M.Page.invoke('/user/auth/fingerprint', param, true);
          view.onclose = () => {
            request.cancel();
          };
        }
        promise.finally(() => {
          if (view) {
            view.close('auto');
          }
        });
        promise.then(result => {
          resolve(result);
        }).catch(e => {
          reject(e);
        });
      });
    },
    securityCheck() {
      if (this.isEnableFingerprint) {
        return this.requestAuthFingerprint(true);
      }
    }
  };

  M.Passport = Passport;
  M.User = User;
  M.Identity = Identity;
  M.Track = Track;
  M.Safety = Safety;
  if (instance && instance.$root) {
    instance.helper = helper;
    instance.$root.helper = helper;
  }
};
