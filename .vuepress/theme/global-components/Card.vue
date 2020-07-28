<template>
  <div :class="cardClass">
    <div v-if="title" class="header">
      <h1>{{title}}</h1>
    </div>
    <div class="body" :style="bodyStyle">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    shadow: {
      type: String,
      default: "always"
    },
    bodyStyle: {
      type: Object
    }
  },
  computed: {
    cardClass() {
      if (this.shadow == "always") {
        return "card shadow";
      }

      return "card";
    }
  }
};
</script>

<style lang="stylus" scoped>
.card {
  @apply: rounded border border-solid border-gray-300;

  .header {
    @apply: p-4;
    border-bottom: 1px solid #eee;
  }

  .body {
    @apply: overflow-hidden p-4;
  }
}
</style>