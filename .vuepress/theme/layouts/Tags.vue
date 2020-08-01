<template>
  <Card class="text-center p-10">
    <h3>目前共计 {{$tag.list.length}} 个标签</h3>
    <div class="flex flex-wrap justify-center mt-5 break-normal">
      <router-link class="tag mx-2 lg:mr-10" v-for="tag in $tag.list" :to="tag.path">{{ tag.name }}</router-link>
    </div>
  </Card>
</template>

<script>
export default {
  computed: {
    tagSize() {
      return (
        (this.$themeConfig.footer && this.$themeConfig.footer.copyright) || []
      );
    },
  },
};
</script>

<style lang="stylus" scoped>
.tag
  line-height: 3;
</style>