<template>
  <Card class="writing">
    <!-- <div>太棒了! 目前共计 {{articles.length}} 篇文章。 继续努力。</div> -->
    <div class="writing-item" v-for="article in articles">
      <h3 v-if="!article.id">{{ article.title }}</h3>
      <div v-else>
        <p class="date">{{ article.frontmatter.date | moment('MM-DD') }}</p>
        <router-link :to="article.path">{{ article.title }}</router-link>
      </div>
    </div>
  </Card>
</template>

<script>
export default {
  components: {},
  methods: {},
  computed: {
    articles() {
      let posts = this.$site.pages.filter((item) => {
        return item.id == "post";
      });
      this.sortPostsByDate(posts);

      // insert the year item into the posts array.
      let lastYear;
      for (let i = 0; i < posts.length; i++) {
        let year = posts[i].frontmatter.date.moment("YYYY");
        if (year != lastYear) {
          posts.splice(i, 0, { title: year });
        }

        lastYear = year;
      }

      return posts;
    },
  },
  mounted() {},
};
</script>

<style lang="stylus" scoped>
.writing {
  @apply: px-20 pb-10;

  .writing-item {
    @apply: my-2;

    h3 {
      @apply: mt-10;
    }

    .date {
      @apply: inline-flex text-gray-600 w-20 ml-5;
    }
  }
}
</style>