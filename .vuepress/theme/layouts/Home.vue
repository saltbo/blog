<template>
  <Card class="px-20 py-10">
    <h2>Activity</h2>
    <Content class="custom activity" />

    <h2 class="pt-10">Writing</h2>
    <div class="writing pt-3">
      <div class="py-1" v-for="post in posts">
        <span class="text-gray-600 w-20">{{ post.frontmatter.date | moment('YYYY-MM-DD') }}</span>
        <router-link class="ml-10" :to="post.path">{{ post.title }}</router-link>
      </div>
    </div>

    <h2 class="pt-10">Projects</h2>
    <div class="projects pt-3">
      <div class="py-1" v-for="project in projects">
        <router-link :to="project.path">{{ project.title }}: {{ project.intro }}</router-link>
      </div>
    </div>
  </Card>
</template>

<script>
import axios from "axios";
export default {
  components: {},
  computed: {
    posts() {
      let posts = this.$site.pages.filter((item) => {
        return item.id == "post" && item.frontmatter.pinned;
      });
      this.sortPostsByDate(posts);
      return posts;
    },
    projects() {
      let posts = [
        {
          title: "uptoc",
          intro:
            "A static file deployment tool that supports multiple platforms./ 一个支持多家云厂商的静态文件部署工具",
          path: "https://github.com/saltbo/uptoc",
        },
      ];
      return posts;
    },
  },
  methods: {},
  mounted() {},
};
</script>

<style lang="stylus" scoped>
.activity {
  @apply: mx-0 !important;

  & >>> pre, pre[class*='language-'] {
    @apply: bg-gray-300;

    code {
      color: #000;
    }
  }

  & >>> div[class*='language-'] {
    @apply: bg-gray-300;
  }
}
</style>