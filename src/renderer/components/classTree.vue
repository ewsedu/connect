<style scoped>
</style>

<template>
  <div v-if="getSchoolid">
    <Tree :data="data" @on-select-change="onSelectChange"></Tree>
    <Spin fix size="large" v-if="loading"></Spin>
  </div>
</template>

<script>
export default {
  name: 'class-tree',
  props: ['schoolid'],
  data() {
    return {
      tip: '暂无班级数据',
      loading: false,
      data: [],
      dataRaw: [],
      page: 1,
      status: {
        editClass: false
      },
      form: {
        editClass: {}
      }
    };
  },
  methods: {
    onSelectChange(node) {
      this.$emit('on-select-change', node[0]);
    },
    requestData() {
      const api = this.api || '/school/view/classes';
      this.loading = true;
      this.Api.get(api, this.getRequestParam()).on('success', json => {
        this.dataRaw = json.data;
        const school = json.data.school;
        const classes = json.data.classes;
        const tree = this.getClassesTree(classes);
        this.data = [{
          title: school.name,
          expand: true,
          children: tree
        }];
      }).on('mistake', json => {
        this.tip = json.data.data;
      }).on('complete', () => {
        this.loading = false;
      });
    },
    getSchoolid() {
      return this.schoolid || this.$route.params.school.id || '';
    },
    getRequestParam() {
      const basic = {
        schoolid: this.getSchoolid()
      };
      return basic;
    },
    getLevelName(level = 0) {
      const levels = ['学前', '小学', '初中', '高中'];
      return levels[level];
    },
    getClassesTree(classes = []) {
      let self = this;
      let levels = {};
      let grades = {};
      let trees = [];
      classes.forEach((v, k) => {
        let level = {
          id: v.level,
          title: self.getLevelName(v.level),
          levelid: v.level,
          isParent: true,
          isLevel: true,
          expand: true,
          children: []
        };
        levels[v.level] = level;
      });
      classes.forEach((v, k) => {
        let target = v.level + '-' + v.grade;
        let grade = {
          id: target,
          title: v.grade + '级',
          levelid: v.level,
          grade: v.grade,
          isParent: true,
          isGrade: true,
          children: []
        };
        grades[target] = grade;
      });
      classes.forEach((v, k) => {
        let grade = grades[v.level + '-' + v.grade];
        if (grade) {
          v.levelid = v.level;
          v.classes = v.id;
          v.title = v.name;
          v.isClasses = true;
          grade.children.push(v);
        }
      });
      for (const k in grades) {
        const v = grades[k];
        let level = levels[v.levelid];
        if (level) {
          level.children.push(v);
        }
      }
      for (const k in levels) {
        const v = levels[k];
        trees.push(v);
      }
      return trees;
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
