<template>
  <div>
    <Card title="我的项目">
      <div class="grid grid-cols-2 gap-4 px-10">
        <Card shadow="never">
          <router-link to="/uptoc">
            <h3>Uptoc</h3>
          </router-link>
          <div class="intro">A static file deployment tool that supports multiple platforms./ 一个支持多家云厂商的静态文件部署工具</div>
          <div class="flex flex-row">
            <div class="py-2">Go</div>
            <div class="py-2 ml-2">120</div>
            <div class="py-2 ml-2">cli deploying publishing</div>
          </div>
        </Card>
      </div>
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
      return this.$site.pages.filter((item) => {
        return item.id == "post";
      });
    },
  },
};
</script>

<style lang="stylus" scoped></style>