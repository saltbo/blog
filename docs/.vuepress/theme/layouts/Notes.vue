<template>
  <Card title="我的笔记">
    <table class="table-auto my-0">
      <tbody>
        <tr v-for="page in pages">
          <td class="w-1/2 px-4 py-2">
            <router-link :to="page.path">{{ page.title }}</router-link>
          </td>
          <td class="w-1/4 px-4 py-2">{{ page.frontmatter.date | moment}}</td>
        </tr>
      </tbody>
    </table>
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
    }
  },
  computed: {
    pages() {
      let pages = this.$site.pages.filter(item => {
        return item.id == "note";
      });
      this.sortPostsByDate(pages);
      console.log(pages);
      return pages;
    }
  },
  mounted() {}
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