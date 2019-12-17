<style scoped lang="scss">
    .title-board-container {
        position: relative;
        margin-bottom: 10px;
        display: flex;
        flex-flow: nowrap row;
        align-items: center;
        justify-content: space-between;
        .title-board-left {
            font-size: .9rem;
            color: #2494F2;
            letter-spacing: 1px;
            padding-bottom: 5px;
            border-bottom: 3px solid #2494F2;
        }
        .title-board-right {
        }
    }
</style>

<template>
    <div class="title-board-container">
        <div class="title-board-left" :class="{'title-board-center':center !== undefined}">
            <slot></slot>
        </div>
        <div class="title-board-right">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script>
export default {
  name: 'title-board',
  props: {
    center: {
      default: undefined
    }
  },
  data() {
    return {
    };
  },
  methods: {
  },
  mounted() {
  }
};
</script>
