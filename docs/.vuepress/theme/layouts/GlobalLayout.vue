<template>
  <div id="app__global-layout">
    <Header />
    <main class="container">
      <div class="flex">
        <div class="w-3/4 px-2 py-2">
          <Layout />
        </div>
        <div class="w-1/4 px-2 py-2">
          <Card class>
            <div class="flex flex-row justify-center text-center">
              <div class="p-2">
                <div>文章数</div>
                <span>20</span>
              </div>
              <div class="p-2">
                <div>笔记数</div>
                <span>20</span>
              </div>
              <div class="p-2">
                <div>标签数</div>
                <span>120</span>
              </div>
            </div>
          </Card>
          <Card class="mt-5">
            <img class="my-2" src="https://img.alicdn.com/tfs/TB1QJC6dOrpK1RjSZFhXXXSdXXa-300-100.jpg" alt />
            <img class="my-2" src="https://s2.ax1x.com/2020/02/12/1bns2D.jpg" alt />
            <img class="my-2" src="https://img.alicdn.com/tfs/TB1QJC6dOrpK1RjSZFhXXXSdXXa-300-100.jpg" alt />
            <img class="my-2" src="https://s2.ax1x.com/2020/02/12/1bns2D.jpg" alt />
            <img class="my-2" src="https://img.alicdn.com/tfs/TB1QJC6dOrpK1RjSZFhXXXSdXXa-300-100.jpg" alt />
            <img class="my-2" src="https://s2.ax1x.com/2020/02/12/1bns2D.jpg" alt />
          </Card>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script>
import Layout from "@app/components/GlobalLayout.vue";
import Header from "@theme/components/Header.vue";
import Footer from "@theme/components/Footer.vue";
import Toc from "@theme/components/Toc.vue";
export default {
  components: {
    Layout,
    Header,
    Footer,
    Toc
  },
  data() {
    return {
      script: Object,
      isMobileHeaderOpen: false
    };
  },
  mounted() {
    this.script = require("busuanzi.pure.js");
    this.$router.afterEach(() => {
      this.isMobileHeaderOpen = false;
    });
  },
  watch: {
    $route(to, from) {
      if (to.path != from.path) {
        this.script.fetch();
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
#app__global-layout {
  word-wrap: break-word;
}

main {
  @apply: mx-auto mt-5 px-10;
}
</style>