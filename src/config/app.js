'use strict';

const config = {
  dev: false,
  build: false,
  agents: {
    app: {
      protocol: 'http',
      host: 'api.master.ewsedu.com',
      main: true
    },
    passport: {
      protocol: 'https',
      host: 'passport.ewsedu.com'
    },
    resource: {
      protocol: 'https',
      host: 'static.ewsedu.com'
    },
    socket: {
      protocol: 'https',
      host: 'socket.ewsedu.com',
      socket: true,
      nsp: '/app'
    }
  },
  page: '/dist/index.html',
  target: 'student'
};

let dev = {};
try {
  config.dev = require('./dev.setting');
} catch (e) {
  config.dev = config.dev;
}
if (config.dev) {
  try {
    dev = require('./app.dev');
  } catch (e) {
    dev = {};
  }
}

const proxy = Object.assign(config, dev);
export default proxy;
