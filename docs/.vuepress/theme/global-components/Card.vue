<template>
  <div :class="cardClass">
    <div v-if="title" class="title">{{title}}</div>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    shadow: {
      type: String,
      default: "always"
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
  @apply: rounded p-4 overflow-hidden border border-solid border-gray-300;
  // border: 1px solid #eee;
}
</style>