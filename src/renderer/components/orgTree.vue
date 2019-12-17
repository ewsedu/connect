<style scoped>
</style>

<template>
  <section v-if="getSchoolid">
    <Tree :data="data" @on-select-change="onSelectChange"></Tree>
    <Spin size="large" fix v-if="loading"></Spin>
  </section>
</template>

<script>
export default {
  name: 'org-tree',
  props: ['schoolid', 'type'],
  data() {
    return {
      tip: '暂无数据',
      loading: false,
      data: [],
      status: {
        editOrg: false,
        editGroup: false
      },
      form: {
        editOrg: {},
        editGroup: {}
      }
    };
  },
  methods: {
    onSelectChange(node) {
      this.$emit('on-select-change', node[0]);
    },
    getSchoolid() {
      return this.schoolid || this.Page.Param.schoolid || '';
    },
    getRequestParam() {
      return {
        schoolid: this.getSchoolid()
      };
    },
    requestData() {
      const api = this.api || '/school/view/org';
      this.loading = true;
      this.Api.get(api, this.getRequestParam()).on('success', json => {
        const school = json.data.school;
        const orgs = json.data.orgs;
        const groups = json.data.groups;
        const children = this.getFormatChildren(this.type === 'group' ? groups : orgs);
        this.data = [{
          title: school.name,
          expand: true,
          children: children
        }];
      }).on('mistake', json => {
        this.tip = json.data.data;
      }).on('complete', () => {
        this.loading = false;
      });
    },
    getFormatChildren(items = []) {
      return items.map(item => {
        return Object.assign(item, {
          title: item.name || '未命名',
          expand: true,
          children: this.type === 'org' ? this.findChildren(items, item.id) : []
        });
      });
    },
    findChildren(items = [], id) {
      const children = items.filter(item => {
        return item.parentid === id;
      });
      return children.length > 0 ? this.getFormatChildren(children) : [];
    },
    refresh() {
      this.requestData();
    }
  },
  mounted() {
    this.refresh();
  }
};
</script>
