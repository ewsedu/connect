<style scoped rel="stylesheet/scss" lang="scss">
    img {
        object-fit: cover;
    }
</style>

<template>
    <img
            v-if="avatar"
            :src="avatar"
            :key="avatar"
            :width="width"
            :height="height"
            :style="{'margin':margin,'padding':padding}"
            @click="handleClick"
            :onerror="avatarError"
    >
</template>

<script>
export default {
  name: 'user-avatar',
  props: {
    url: {
      default: null
    },
    width: {
      default: ''
    },
    height: {
      default: ''
    },
    margin: {
      default: ''
    },
    padding: {
      default: ''
    },
    gender: {
      default: '0'
    },
    identity: {
      default: 'student'
    }
  },
  data() {
    return {
      avatar: ''
    };
  },
  watch: {
    url() {
      this.avatar = this.getAvatar();
    }
  },
  mounted() {
    this.avatar = this.getAvatar();
  },
  methods: {
    getAvatar() {
      const url = this.url || '';
      if (!url) {
        return this.getDefaultAvatar();
      }
      if (url.indexOf('://') > -1 || url.indexOf('data.image/') > -1) {
        return url;
      }
      return this.Api.Resource.baseUrl + url;
    },
    getDefaultAvatar() {
      const gender = (this.gender || 0).toString();
      const genderImg = {
        0: require('../assets/images/avatar/default.png'),
        1: this.identity === 'student' ? require('../assets/images/avatar/maleStudent.png') : require('../assets/images/avatar/maleTeacher.png'),
        2: this.identity === 'student' ? require('../assets/images/avatar/femaleStudent.png') : require('../assets/images/avatar/femaleTeacher.png')
      };
      return genderImg[gender];
    },
    handleClick() {
      this.$emit('click');
    },
    avatarError() {
      this.avatar = this.getDefaultAvatar();
    }
  }
};
</script>
