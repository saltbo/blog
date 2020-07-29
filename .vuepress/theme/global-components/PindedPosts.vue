<template>
  <div class="writing">
    <div class="writing-item" v-for="post in posts">
      <p class="date">{{ post.frontmatter.date | moment('YYYY-MM-DD') }}</p>
      <router-link :to="post.path">{{ post.title }}</router-link>
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
.writing {
  @apply: mt-5;

  .writing-item {
    @apply: my-2;

    .date {
      @apply: inline-flex text-gray-600 w-32;
    }
  }
}
</style>