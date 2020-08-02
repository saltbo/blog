<template>
  <div>
    <div class="my-2" v-for="post in posts">
      <span class="hidden lg:inline-block text-gray-600 w-24">{{ post.frontmatter.date | moment('YYYY-MM-DD') }}</span>
      <router-link :to="post.path">{{ post.title }}</router-link>
      <span class="lg:hidden text-gray-600 text-xs">({{ post.frontmatter.date | moment('MMM DD，YYYY') }})</span>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    posts() {
      let posts = this.$site.pages.filter((item) => {
        return item.id == "post" && item.frontmatter.pinned;
      });
      this.sortPostsByDate(posts);
      return posts;
    },
  },
};
</script>

<style lang="stylus" scoped>
@tailwind base;
</style>