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
              <div class="px-2">
                <div>文章</div>
                <span>{{ postsNum }}</span>
              </div>
              <div class="px-2">
                <div>笔记</div>
                <span>{{ notesNum }}</span>
              </div>
              <div class="px-2">
                <div>标签</div>
                <span>{{ tagsNum }}</span>
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
  methods: {
    findPagesNum(id) {
      let pages = this.$site.pages.filter(item => {
        return item.id == id;
      });

      return pages.length;
    }
  },
  watch: {
    $route(to, from) {
      if (to.path != from.path) {
        this.script.fetch();
      }
    }
  },
  computed: {
    postsNum() {
      return this.findPagesNum("post");
    },
    notesNum() {
      return this.findPagesNum("note");
    },
    tagsNum() {
      return this.$tag.list.length;
    }
  },
  mounted() {
    this.script = require("busuanzi.pure.js");
    this.$router.afterEach(() => {
      this.isMobileHeaderOpen = false;
    });
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