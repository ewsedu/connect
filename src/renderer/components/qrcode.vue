<style lang="scss" scoped>
  .qrCode {
    /deep/ img {
      margin: 0 auto;
    }
  }
</style>

<template>
  <div id="qrcode" ref="qrcode" class="qrCode">
  </div>
</template>

<script>
import QRCode from 'qrcodejs2';

export default {
  name: 'qrcode',
  components: {
    QRCode
  },
  props: {
    text: {
      default: '学拓帮'
    },
    size: {
      default: 200
    }
  },
  data() {
    return {
      code: null
    };
  },
  mounted() {
    this.$nextTick(function() {
      this.qrcode();
    });
  },
  watch: {
    text(val) {
      if (this.code) {
        this.code.clear();
        this.code.makeCode(val);
      }
    }
  },
  methods: {
    qrcode() {
      this.code = new QRCode('qrcode', {
        width: this.size,
        height: this.size,
        text: this.text,
        correctLevel: QRCode.CorrectLevel.L
      });
    }
  }
};

</script>
