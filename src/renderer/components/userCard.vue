<style scoped rel="stylesheet/scss" lang="scss">
    .user-card-container {
        display: block;
        border-bottom: 1px solid #eee;
        background-color: #ffffff;
        margin: 4px 0;
        cursor: default;
        transition: all .2s ease-in-out;
        .user-card-body {
            height: 48px;
            display: flex;
            flex-flow: nowrap row;
            align-items: center;
            position: relative;
            .user-card-avatar {
                width: 48px;
                height: 48px;
                overflow: hidden;
                img{
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
            .user-card-content {
                margin-left: 10px;
                .user-name{
                    font-size: .95rem;
                }
                .user-info{
                    font-size: .8rem;
                    color: #999;
                }
            }
            .user-card-status{
                position: absolute;
                right: 10px;
                top: 10px;
            }
        }
        &:hover{
            border-color: #ffffff;
            box-shadow: 0 0 8px #2494F2;
            cursor: pointer;
        }
    }

    .user-card-active{
        box-shadow: 0 0 4px orange;
        background-color: rgba(255, 165, 0, 0.05);
    }
</style>

<template>
    <div class="user-card-container" :class="{'user-card-active':this.active}">
        <div class="user-card-body">
            <div class="user-card-avatar">
                <user-avatar :url="avatar" :gender="gender" :identity="identity"></user-avatar>
            </div>
            <div class="user-card-content">
                <div class="user-name">{{name}}</div>
                <div class="user-info"><slot name="info"></slot></div>
            </div>
            <div class="user-card-status">
                <slot name="status"></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: 'user-card',
  props: {
    active: {
      default: false
    },
    avatar: {
      default: ''
    },
    name: {
      default: ''
    },
    gender: {
      default: 0
    },
    identity: {
      default: 'student'
    }
  },
  data() {
    return {
      image: ''
    };
  },
  mounted() {
    this.image = this.getImage();
  },
  watch: {
    url(value) {
      this.image = value;
    }
  },
  methods: {
    getImage() {
      const url = this.url || '';
      const src = this.src || '';
      if (url) {
        if (url.indexOf('://') > -1) {
          return url;
        }
        // return this.Api.Resource.baseUrl + url;
      }
      if (src) {
        try {
          return require('../assets/images/' + src);
        } catch (e) {
          console.log('Image resource \'' + src + '\' is not found !');
          return require('../assets/images/imagePlaceholder.png');
        }
      }
    },
    handleClick() {
      this.$emit('click');
      if (this.showLarge !== undefined) {
        this.showLargeViaModal();
      }
    },
    imageError() {
      this.image = require('../assets/images/imagePlaceholder.png');
    },
    downloadImage() {
      const downloadTarget = document.createElement('a');
      downloadTarget.href = this.url;
      downloadTarget.target = '_blank';
      downloadTarget.download = `图片(${Date.now().toString(36)}) - 学拓帮`;
      downloadTarget.click();
    },
    showLargeViaModal() {
      this.$Modal.confirm({
        title: '查看大图',
        cancelText: '关闭',
        okText: '保存到本地',
        width: 800,
        onOk: () => {
          this.downloadImage();
        },
        closable: true,
        render: (h) => {
          return [
            h('ui-image', {
              props: {
                url: this.url
              },
              style: {
                maxWidth: '100%',
                display: 'block',
                margin: '0 auto'
              }
            }), h('div', {
              style: {
                color: '#999',
                textAlign: 'center',
                fontSize: '.8rem',
                letterSpacing: '1px',
                margin: '10px auto'
              }
            }, '按Esc键可快速关闭')
          ];
        }
      });
    }
  }
};
</script>
