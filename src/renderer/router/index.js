import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: require('@/pages/login').default
    },
    {
      path: '/index',
      name: 'index',
      component: require('@/pages/index').default
    },
    {
      path: '/dev',
      name: 'dev',
      component: require('@/pages/dev').default
    },
    {
      path: '/support',
      name: 'support',
      component: require('@/pages/support').default
    },
    {
      path: '/setting',
      name: 'setting',
      component: require('@/pages/setting').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});
