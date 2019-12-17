<style scoped lang="scss">
    .panel-container {
        margin-top: 80px;
        .panel-body {
            position: relative;
            height: calc(100vh - 140px);
            overflow: hidden;
            .panel-content {
                height:calc(100% - 80px);
                position: relative;
                overflow: auto;
                .school-item {
                    cursor: pointer !important;
                    .school-name {
                        font-size: 1rem;
                    }
                }
                .school-item-active {
                    box-shadow: 0 0 4px orange;
                    background-color: rgba(255, 165, 0, 0.05);
                }
            }
            .page-control {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                padding: 10px 0;
                margin: 0 auto;
                text-align: center;
                box-shadow:0 -2px 6px rgba(177,177,177,.5);
                background-color: #ffffff;
            }
        }
    }

    .action-menu-container {
        display: flex;
        flex-flow: nowrap row;
        justify-content: space-around;
        align-items: center;
        .action-menu-item {
            position: relative;
            cursor: pointer;
            font-size: .85rem;
            letter-spacing: 1px;
            border: 1px solid #efefef;
            padding: 10px 20px;
            transition: all 200ms ease-in-out;
            text-align: center;
            color: #666;
            .action-menu-title {
                border-top: 1px solid #efefef;
                margin-top: 10px;
                padding-top: 10px;
            }
            .action-menu-count {
                position: absolute;
                top: -10px;
                right: -10px;
                width: 30px;
                height: 20px;
                border-radius: 2px;
                background-color: red;
                color: #ffffff;
                padding: 0 5px;
                text-align: center;
                line-height: 20px;
                overflow: hidden;
                font-size: .8rem;
            }
            &:hover {
                box-shadow: 0 0 8px #2494F2;
            }
        }
    }
    .apps {
      margin: 0 auto;
      margin-top: 100px;
      width: 980px;
    }
    .apps .app-item {
      width: 200px;
      // height: 160px;
      padding: 20px;
      background: white;
      text-align: center;
      display: inline-block;
      margin-right: 16px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
    }
    .apps .app-item .iconfont {
      font-size: 7em !important;
      display: block;
    }
</style>

<template>
  <Layout :style="{padding: '0 24px 24px'}">
      <Breadcrumb :style="{margin: '24px 0'}">
          <BreadcrumbItem>Home</BreadcrumbItem>
          <BreadcrumbItem>Components</BreadcrumbItem>
          <BreadcrumbItem>Layout</BreadcrumbItem>
      </Breadcrumb>
      <Content :style="{paddingTop: '24px', minHeight: '280px'}">
        <div class="apps">
          <div class="app-item" @click="toDev">
            <i class="iconfont icon-dev"></i>
            开发调试
          </div>
          <div class="app-item">
            <i class="iconfont icon-version"></i>
            版本管理
          </div>
          <div class="app-item" @click="toSupport">
            <i class="iconfont icon-help"></i>
            辅助工具
          </div>
          <div class="app-item" @click="toSetting">
            <i class="iconfont icon-setting"></i>
            系统设置
          </div>
        </div>
      </Content>
  </Layout>
</template>

<script>
export default {
  name: 'select-school',
  data() {
    return {
      status: {
        loadingSchoolList: false,
        actionMenu: false
      },
      data: {
        school: {},
        schoolList: [],
        galleryCount: 0
      },
      config: {
        pageControl: {
          defaultPageSize: 15,
          totalCount: 0,
          offset: 0
        }
      },
      params: {
        keyword: ''
      },
      timer: null
    };
  },
  methods: {
    toDev() {
      this.$router.push({name: 'dev'});
    },
    toSupport() {
      this.$router.push({name: 'support'});
    },
    toSetting() {
      this.$router.push({name: 'setting'});
    },
    getPath(e, path = '') {
      this.$electron.ipcRenderer.send('open-dev-target', path[0]);
    },
    selectSchoolItem(schoolItem) {
      this.data.school = schoolItem;
      this.queryGalleryCount();
      this.status.actionMenu = true;
    },
    pageRedirect(pageName) {
      this.$router.push({name: pageName, params: {schoolItem: this.data.school}});
    },
    queryGalleryCount(schoolid = null) {
      schoolid = schoolid === null ? this.data.school.id : schoolid;
      this.$db.count({scheme: 'existPhotoList', schoolid: schoolid}, (error, count) => {
        if (error) {
          console.log(error);
        }
        this.data.galleryCount = count;
      });
    },
    requestSchoolList(currentPage = 0) {
      this.status.loadingSchoolList = true;
      const {keyword} = this.params;
      const {defaultPageSize} = this.config.pageControl;
      this.Api.get('/school/index/list', {
        limit: defaultPageSize,
        offset: (currentPage > 0 ? currentPage - 1 : 0) * defaultPageSize,
        name: keyword
      }).on('success', json => {
        this.data.schoolList = json.data.schools || [];
        this.config.pageControl = json.data.pages || {};
        this.status.loadingSchoolList = false;
      });
    },
    searchBySchoolName(keyword) {
      this.params.keyword = keyword;
      this.requestSchoolList();
    }
  },
  mounted() {
    this.$electron.ipcRenderer.on('selectedItem', this.getPath);
  },
  watch: {
    'params.keyword'(keyword) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.searchBySchoolName(keyword);
      }, 800);
    }
  }
};
</script>
