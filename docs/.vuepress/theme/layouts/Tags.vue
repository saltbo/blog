<template>
  <div>
    <Card class="text-center pb-10">
      <h3 class="my-8">目前共计 {{$tag.list.length}} 个标签</h3>
      <ul class="mt-5">
        <li class="tags-li-inline" v-for="tag in $tag.list">
          <router-link class="page-link" :to="tag.path" style>{{ tag.name }}</router-link>
        </li>
      </ul>
    </Card>
  </div>
</template>

<script>
export default {
  computed: {
    tagSize() {
      return (
        (this.$themeConfig.footer && this.$themeConfig.footer.copyright) || []
      );
    }
  }
};
</script>

<style lang="stylus" scoped>
.tags-li-inline {
  @apply: inline mx-10;
  line-height: 50px;
}
</style>