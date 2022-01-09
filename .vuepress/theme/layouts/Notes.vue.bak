<template>
  <Card title="我的笔记">
    <div class="lg:px-20 pb-10">
      <div class="flex py-1" v-for="page in pages">
        <router-link class="flex flex-grow w-8/12" :to="page.path">
          <span class="inline-block truncate">{{ page.title }}</span>
          <Badge v-for="label in page.frontmatter.labels" :text="label" />
        </router-link>

        <span class="flex-none text-gray-600 ml-5">{{ page.frontmatter.date | moment('YYYY-MM-DD') }}</span>
      </div>
    </div>
  </Card>
</template>

<script>
export default {
  components: {},
  methods: {
    compareDate(a, b) {
      function getTimeNum(date) {
        return new Date(date.frontmatter.date).getTime();
      }
      return getTimeNum(b) - getTimeNum(a);
    },
    sortPostsByDate(posts) {
      posts.sort((prev, next) => {
        return this.compareDate(prev, next);
      });
    },
  },
  computed: {
    pages() {
      let pages = this.$site.pages.filter((item) => {
        return item.id == "note";
      });
      this.sortPostsByDate(pages);
      return pages;
    },
  },
  mounted() {},
};
</script>

<style lang="stylus" scoped></style>