<style lang="scss">
    body {
        background-color: rgba(239, 239, 239, 0.51) !important;
    }

    .app {
      .page-view {
          // padding-top: 60px;
      }
      .update-view {
        width: 80%;
        max-width: 980px;
        margin: 0 auto;
        margin-top: 15%;
      }
    }
</style>

<template>
    <div class="app">
        <div class="update-view" v-if="update">
          正在更新
          <Progress :percent="percent" :stroke-color="['#108ee9', '#87d068']" />
        </div>
        <header-bar v-if="!update && route.name !== 'login'"></header-bar>
        <router-view v-if="!update" :class="{'page-view':route.name !== 'login'}"></router-view>

    </div>
</template>

<script>
import main from '../app/main';

export default {
  data() {
    return {
      percent: 0,
      update: false,
      route: {}
    };
  },
  created() {
    main(this.Runtime, this.$root);
  },
  mounted() {
    this.route = this.$route;

    this.$Message.config({
      top: 120,
      duration: 3
    });
    this.$electron.ipcRenderer.on('message', (event, message) => {
      console.log(message);
      if (message instanceof Object) {
        if (message.action == 'update-available') {
          this.$Notice.success({
            title: '版本更新',
            desc: '检测到新版本，是否更新',
            render: h => {
              return h('span', [
                '检测到新版本，是否更新？',
                h('a', {
                  on: {
                    click: () => {
                      this.$request('open-dev-tools');
                      this.$request('confirm-update');
                      this.$Message.loading({
                        content: '更新中'
                      });
                      this.$Notice.destroy();
                      this.update = true;
                    }
                  }
                }, '确认更新')
              ]);
            },
            duration: 0
          });
        } else if (message.action == 'download-progress') {
          const progress = message.progress || {};
          this.percent = parseFloat(parseFloat(progress.percent).toFixed(2)) || 0;
        } else if (message.action == 'update-downloaded') {
          this.percent = 100;
        }
      }
    });
    this.$request('check-update');
  },
  updated() {
    this.route = this.$route;
  }
};
</script>
