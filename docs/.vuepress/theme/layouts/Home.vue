<template>
  <div>
    <Card title="开源项目">
      <div class="grid grid-cols-2 gap-4 my-5">
        <Card shadow="never">
          <h3>Uptoc</h3>
          <div class="intro">A static file deployment tool that supports multiple platforms./ 一个支持多家云厂商的静态文件部署工具</div>
          <div class="flex flex-row">
            <div class="py-2">Go</div>
            <div class="py-2 ml-2">120</div>
            <div class="py-2 ml-2">cli deploying publishing</div>
          </div>
        </Card>
        <Card shadow="never">
          <h3>Uptoc</h3>
          <div class="intro">A static file deployment tool that supports multiple platforms./ 一个支持多家云厂商的静态文件部署工具</div>
          <div class="flex flex-row">
            <div class="py-2">Go</div>
            <div class="py-2 ml-2">120</div>
            <div class="py-2 ml-2">cli deploying publishing</div>
          </div>
        </Card>
        <Card shadow="never">
          <h3>Uptoc</h3>
          <div class="intro">A static file deployment tool that supports multiple platforms./ 一个支持多家云厂商的静态文件部署工具</div>
          <div class="flex flex-row">
            <div class="py-2">Go</div>
            <div class="py-2 ml-2">120</div>
            <div class="py-2 ml-2">cli deploying publishing</div>
          </div>
        </Card>
      </div>
    </Card>
    <Card title="置顶文章" class="mt-5">
      <router-link :to="page.path" class="flex my-3" v-for="page in pages">
        <div class="w-1/3 p-2">
          <img src="https://static.zkqiang.cn/images/20200323131541.png-cover" alt />
        </div>
        <div class="w-2/3 p-2">
          <h3 class="title">{{ page.title }}</h3>
          <div class="intro">{{ page.excerpt }}</div>
          <div class="flex flex-row">
            <div class="py-2">{{ page.frontmatter.date | moment('YYYY-MM-DD') }}</div>
            <div class="py-2 ml-2">阅读约10分钟</div>
            <div class="py-2 ml-2">{{ page.frontmatter.tags }}</div>
          </div>
        </div>
      </router-link>
    </Card>
  </div>
</template>

<script>
export default {
  computed: {
    pages() {
      let pages = this.$site.pages.filter(item => {
        return item.id == "post";
      });
      console.log(this.$site);

      return pages.slice(0, 5);
    }
  }
};
</script>

<style lang="stylus" scoped>
.title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.intro {
  color: #718096;
  min-height: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; // 控制多行的行数
  -webkit-box-orient: vertical;
}
</style>