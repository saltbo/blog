<template>
  <Card class="lg:px-20 md:px-16 lg:pb-10">
    <!-- <div>太棒了! 目前共计 {{articles.length}} 篇文章。 继续努力。</div> -->
    <div class="flex py-1" v-for="article in articles">
      <h2 class="w-full mt-10 mb-3" v-if="!article.id">{{ article.title }}</h2>
      <template v-else>
        <span class="flex-none text-gray-600 w-16 ml-3 lg:ml-6">{{ article.frontmatter.date | moment('MM-DD') }}</span>
        <router-link class="flex-grow truncate" :to="article.path">{{ article.title }}</router-link>
      </template>
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

<style lang="stylus" scoped></style>