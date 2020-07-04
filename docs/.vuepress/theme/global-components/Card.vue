<template>
  <div class="rounded p-4 overflow-hidden shadow">
    <div v-if="title" class="title">{{title}}</div>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    title: {
      //   required: true
    }
  }
};
</script>

<style>
</style>