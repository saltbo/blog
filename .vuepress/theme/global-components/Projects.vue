<template>
  <div>
    <div class="projects pt-3">
      <div class="py-1" v-for="project in projects">
        <router-link :to="project.path">{{ project.title }}: {{ project.intro }}</router-link>
      </div>
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

<style>
</style>