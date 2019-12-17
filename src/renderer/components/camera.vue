<style scoped rel="stylesheet/scss" lang="scss">
    .camera-container {
        position: relative;
        margin: 0 auto;
        width: 100%;
        #camera-video {
            display: block;
            margin: 20px auto;
            box-shadow: 0 0 6px #2494F2;
        }
        .camera-overlay {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 998;
            display: flex;
            flex-flow: nowrap row;
            align-items: center;
            justify-content: center;
            .camera-overlay-frame {
                border: 3px solid rgba(255, 255, 255, .5);
                img {
                    width: 100%;
                    height: 100%;
                }
            }
        }
        .camera-countdown {
            position: absolute;
            right: 100px;
            bottom: 20px;
            z-index: 998;
            color: rgba(255, 255, 255, .5);
            font-size: 3rem;
            font-weight: 500;
            text-shadow: 1px 1px 8px rgba(0, 0, 0, .5);
        }
        .camera-tool {
            position: absolute;
            bottom: 20px;
            width: 100%;
            display: flex;
            flex-flow: nowrap row;
            align-content: center;
            align-items: center;
            justify-content: center;
            height: 40px;
            margin-top: -5px;
            z-index: 999;
            .camera-tool-item {
                cursor: pointer;
                padding: 8px;
                transition: all 400ms ease-in-out;
                border-radius: 50%;
                &:hover {
                    background-color: rgba(255, 255, 255, .5);
                    box-shadow: 0 0 10px rgba(0, 0, 0, .8) inset;
                }
            }
        }
    }

    .camera-result {
        width: 100%;
        height: 400px;
        overflow: hidden;
        .camera-preview-image {
            max-height: 95%;
            display: block;
            margin: 10px auto;
            box-shadow: 0 0 8px #2494F2;
        }
    }
</style>

<template>
    <div class="camera-container">
        <title-board>
            采集头像
            <div slot="right">
                <Tag>拍照模式</Tag>
                <Select v-model="status.mode" style="width:140px" :transfer="true">
                    <Tooltip :transfer="true">
                        <div slot="content">
                            点击相机按钮后显示拍照结果
                            <br>预览后选择保存
                        </div>
                        <Option value="normal">先拍后预览</Option>
                    </Tooltip>
                    <Tooltip :transfer="true">
                        <div slot="content">
                            点击照相按钮后立即拍照
                            <br>并直接保存本地
                        </div>
                        <Option value="direct">直接拍保存</Option>
                    </Tooltip>
                    <Tooltip :transfer="true">
                        <div slot="content">
                            三秒倒计时后进行拍照
                            <br>自动保存本地
                        </div>
                        <Option value="countdown">倒计时拍照</Option>
                    </Tooltip>
                    <Tooltip :transfer="true">
                        <div slot="content">
                            先进行拍照再在原图上进行框选和裁剪
                        </div>
                        <Option value="cropper">先拍后裁剪</Option>
                    </Tooltip>
                </Select>
            </div>
        </title-board>
        <div class="camera-overlay">
            <div class="camera-overlay-frame"
                 :style="{width:camera.boxWidth + 'px',height:camera.boxHeight + 'px'}">
                <pic src="shotExample.png"></pic>
            </div>
        </div>
        <div class="camera-countdown" v-if="status.mode === 'countdown'">
            {{status.countdown === 0 ? '拍摄完成':status.countdown}}
        </div>
        <video id="camera-video"
               :style="{width:camera.videoContainerWidth  + 'px',height:camera.videoContainerHeight + 'px'}">
        </video>
        <div class="camera-tool">
            <div class="camera-tool-item" @click="clickTakePhotoBtn()">
                <Icon type="md-camera" size="40" color="rgba(255,255,255,.8)"/>
            </div>
        </div>
        <slot></slot>
        <Modal title="拍照结果处理" v-model="status.workPanel" class-name="vertical-center-modal"
               :width="camera.videoContainerWidth + 100 + 'px'">
            <div class="camera-result">
                <canvas id="camera-origin-canvas" style="display: none;" :width="camera.videoWidth"
                        :height="camera.videoHeight"></canvas>
                <canvas id="camera-resize-canvas" style="display: none"></canvas>
                <vueCropper
                        ref="cropper"
                        v-if="photo.capture !== null && status.step === 'cropper' && status.mode === 'cropper'"
                        :img="photo.capture"
                        :can-move="true"
                        :autoCrop="true"
                        :autoCropWidth="camera.boxWidth"
                        :autoCropHeight="camera.boxHeight"
                        :outputSize="1"
                        :outputType="camera.outputType">
                </vueCropper>
                <img :src="photo.final"
                     v-if="photo.final !== null && status.step === 'upload'"
                     class="camera-preview-image">
            </div>
            <div slot="footer" style="text-align: center">
                <Button v-if="status.step === 'cropper'" type="error" @click="status.workPanel = false" icon="md-trash">
                    重新拍摄
                </Button>
                <Button v-if="status.step === 'upload' && status.mode === 'cropper'" type="warning"
                        icon="md-arrow-round-back" @click="redoCopper()">
                    重新裁剪
                </Button>
                <Button v-if="status.step === 'cropper' && status.mode === 'cropper'" type="info"
                        icon="ios-refresh-circle-outline"
                        @click="rotateCopper()">
                    旋转图像
                </Button>
                <Dropdown @on-click="download">
                    <Button type="success" icon="md-download">导出图片
                        <Icon v-if="status.step === 'upload'" type="ios-arrow-down"></Icon>
                    </Button>
                    <DropdownMenu slot="list">
                        <DropdownItem name="capturePhoto" v-if="status.mode === 'cropper'">导出原拍摄图</DropdownItem>
                        <DropdownItem name="finalPhotoPNG" v-if="status.step === 'upload'">导出裁剪图</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Button v-if="status.step === 'cropper' && status.mode === 'cropper'" type="primary"
                        icon="md-checkmark"
                        @click="confirmCropper()">
                    确认裁剪
                </Button>
                <Dropdown @on-click="emitResult" v-if="status.step === 'upload' || status.mode === 'normal'">
                    <Button type="primary" icon="md-cloud-upload">
                        保存
                        <Icon v-if="status.step === 'upload'" type="ios-arrow-down"></Icon>
                    </Button>
                    <DropdownMenu slot="list">
                        <DropdownItem name="saveLocal">保存本地,稍后上传</DropdownItem>
                        <DropdownItem name="submit">直接上传</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </Modal>
    </div>
</template>

<script>
export default {
  name: 'camera',
  props: {
    requireConfirm: {
      default: undefined
    }
  },
  data() {
    return {
      status: {
        workPanel: false,
        step: 'cropper',
        mode: 'normal', // [拍照模式] normal:直接拍照，预览截图； direct:直接拍照，不预览；copper：先拍照后裁剪截图
        countdown: 3
      },
      camera: {
        videoWidth: 1920,
        videoHeight: 1080,
        videoContainerWidth: 960,
        videoContainerHeight: 540,
        boxWidth: 307,
        boxHeight: 378,
        outputType: 'jpg'
      },
      photo: {
        capture: null,
        final: null
      }
    };
  },
  methods: {
    clickTakePhotoBtn() {
      this.$emit('click-take-photo-btn');
      if (this.requireConfirm === undefined) {
        this.takePhotoTrigger();
      }
    },
    takePhotoTrigger() {
      if (this.status.mode === 'countdown') {
        this.countdownSecond();
        setTimeout(() => {
          this.captureCamera();
        }, 3000);
        setTimeout(() => {
          this.emitResult('saveLocal');
        }, 4000);
        return false;
      }
      if (this.status.mode === 'direct') {
        setTimeout(() => {
          this.emitResult('saveLocal');
        }, 500);
      }
      this.captureCamera();
      this.status.workPanel = true;
    },
    captureCamera() {
      const {videoContainerWidth, videoContainerHeight, videoWidth, videoHeight, boxWidth, boxHeight} = this.camera;
      const video = document.getElementById('camera-video');
      const canvasOrigin = document.getElementById('camera-origin-canvas');
      const contextOrigin = canvasOrigin.getContext('2d');
      const canvasResize = document.getElementById('camera-resize-canvas');
      const contextResize = canvasResize.getContext('2d');
      if (this.status.mode === 'cropper') {
        canvasOrigin.width = videoContainerWidth;
        canvasOrigin.height = videoContainerHeight;
        contextOrigin.drawImage(video, 0, 0, videoContainerWidth, videoContainerHeight);
        this.photo.capture = canvasOrigin.toDataURL('image/jpg');
      } else {
        canvasOrigin.width = videoWidth;
        canvasOrigin.height = videoHeight;
        contextOrigin.drawImage(video, 0, 0, videoWidth, videoHeight);
        this.photo.capture = canvasOrigin.toDataURL('image/jpg');
        const originImage = new Image();
        originImage.src = canvasOrigin.toDataURL('image/jpg');
        canvasResize.width = 307;
        canvasResize.height = 379;
        const box = {x: 650, y: 200, w: 480, h: 270};
        const scaleX2 = (canvasResize.width / videoWidth) * (videoWidth / canvasResize.width);
        const scaleY2 = (canvasResize.height / videoHeight) * (videoHeight / canvasResize.height);
        let sx = box.x * scaleX2;
        let sy = box.y * scaleY2;
        setTimeout(() => {
          contextResize.drawImage(originImage, sx, sy, boxWidth * 2, boxHeight * 2, 0, 0, boxWidth, boxHeight);
          this.photo.final = canvasResize.toDataURL('image/jpg');
          this.status.step = 'upload';
        }, 300);
      }
    },
    clearCamera() {
      this.photo.capture = null;
      this.photo.final = null;
      this.status.step = 'cropper';
    },
    redoCopper() {
      this.photo.final = null;
      this.status.step = 'cropper';
    },
    rotateCopper() {
      this.$refs.cropper.rotateRight();
    },
    confirmCropper() {
      this.$refs.cropper.getCropData((data) => {
        this.photo.final = data;
      });
      this.status.step = 'upload';
    },
    download(option) {
      let saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
      saveLink.href = option === 'capturePhoto' ? this.photo.capture : this.photo.final;
      saveLink.download = `用户头像采集(${Date.now().toString(36)}) - 学拓帮`;
      let event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      saveLink.dispatchEvent(event);
    },
    emitResult(option) {
      const photo = this.photo.final;
      this.$emit(option === 'saveLocal' ? 'result-save' : 'result-upload', photo);
    },
    countdownSecond() {
      setInterval(() => {
        if (this.status.countdown > 0) {
          this.status.countdown--;
        }
      }, 1000);
    }
  },
  mounted() {
    navigator.mediaDevices.getUserMedia({
      video: {
        width: this.camera.videoWidth,
        height: this.camera.videoHeight
      }
    }).then(stream => {
      let video = document.getElementById('camera-video');
      video.srcObject = stream;
      video.play();
    }).catch(error => {
      console.log(error);
    });
  },
  watch: {
    'status.workPanel'(status) {
      if (status === false) {
        this.clearCamera();
      }
    }
  }
};
</script>
