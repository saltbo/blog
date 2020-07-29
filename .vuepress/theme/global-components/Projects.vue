<template>
  <div class="projects">
    <div class="projects-item" v-for="project in projects">
      <router-link :to="project.path">{{ project.title }}: {{ project.intro }}</router-link>
    </div>
  </div>
</template>


<script>
export default {
  computed: {
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
};
</script>

<style lang="stylus" scoped>
.projects {
  @apply: mt-5;

  .projects-item {
    @apply: my-1;
  }
}
</style>