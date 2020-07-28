<template>
  <Card title="我的笔记">
    <div class="px-20 pb-10">
      <div class="py-1" v-for="page in pages">
        <router-link :to="page.path">{{ page.title }}</router-link>
        <Badge v-for="label in page.frontmatter.labels" :text="label" />
        <span class="float-right text-gray-600">{{ page.frontmatter.date | moment('YYYY-MM-DD') }}</span>
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

<style lang="stylus" scoped>
.timeline-item {
  padding-bottom: 0;

  h3 {
    margin-top: 50px;
    margin-bottom: 0;
  }

  .post-link {
    color: #888;
    font-size: 14px;
    font-weight: 550;
    cursor: pointer;
    text-decoration: none;

    .date {
      display: inline-block;
      width: 45px;
    }

    .title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  &:hover {
    .timeline-circle {
      color: $accentColor !important;
    }

    .post-link {
      color: $accentColor;
    }
  }
}
</style>