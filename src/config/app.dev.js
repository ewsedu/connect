'use strict';

const config = {
  dev: true,
  build: false,
  agents: {
    app: {
      protocol: 'http',
      host: 'api.master.ewsedu.com',
      main: true
    },
    // app: {
    //   protocol: 'http',
    //   host: '192.168.1.51:7601',
    //   main: true
    // },
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

module.exports = config;
