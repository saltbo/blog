<template>
  <div class="projects">
    <a class="block py-1" v-for="project in projects" :href="project.path" target="_blank" rel="noopener">
      <span class="lg:inline-block lg:w-20 lg:text-right">{{ project.title }}</span>
      <span class="intro">- {{ project.intro }}</span>
      <Badge v-if="project.stable" text="stable" />
      <Badge v-else type="warn" text="beta" />
    </a>
  </div>
</template>


<script>
export default {
  computed: {
    projects() {
      let posts = [
        {
          title: "Zpan",
          intro:
            "基于云存储的网盘系统，解决传统网盘下载速度受限于服务器带宽的问题",
          path: "https://github.com/saltbo/zpan",
          stable: false,
        },
        {
          title: "Uptoc",
          intro: "静态文件部署工具，支持多家云平台",
          path: "https://github.com/saltbo/uptoc",
          stable: true,
        },
        {
          title: "Gofbot",
          intro: "通用的消息转发机器人，支持配置自定义模板",
          path: "https://github.com/saltbo/gofbot",
          stable: true,
        },
      ];
      return posts;
    },
  },
};
</script>

<style lang="stylus" scoped>
@tailwind base;
</style>

