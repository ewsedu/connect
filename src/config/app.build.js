'use strict';

const config = {
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
      protocol: 'http',
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
