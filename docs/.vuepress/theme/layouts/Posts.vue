<template>
  <div>
    <Card class="mt-5">
      <Articles :data="articles" />
    </Card>
  </div>
</template>

<script>
import Articles from "@theme/components/Articles.vue";
export default {
  components: {
    Articles,
  },
  computed: {
    articles() {
      let posts = this.$pagination.pages.filter((item) => {
        return item.id == "post";
      });
      this.sortPostsByDate(posts);
      return posts;
    },
  },
};
</script>

<style lang="stylus" scoped></style>