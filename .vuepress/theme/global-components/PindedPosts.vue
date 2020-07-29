<template>
  <div>
    <div class="writing pt-3">
      <div class="py-1" v-for="post in posts">
        <span class="text-gray-600 w-20">{{ post.frontmatter.date | moment('YYYY-MM-DD') }}</span>
        <router-link class="ml-10" :to="post.path">{{ post.title }}</router-link>
      </div>
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

<style>
</style>