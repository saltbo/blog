<template>
  <div id="app__global-layout">
    <Header />
    <main class="container lg:mt-5 lg:mx-auto">
      <Layout />
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
    Toc,
  },
  data() {
    return {
      script: Object,
      isMobileHeaderOpen: false,
    };
  },
  methods: {
    findPagesNum(id) {
      let pages = this.$site.pages.filter((item) => {
        return item.id == id;
      });

      return pages.length;
    },
  },
  watch: {
    $route(to, from) {
      if (to.path != from.path) {
        this.script.fetch();
      }
    },
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
    },
  },
  mounted() {
    this.script = require("busuanzi.pure.js");
    this.$router.afterEach(() => {
      this.isMobileHeaderOpen = false;
    });
  },
};
</script>

<style lang="stylus" scoped>
#app__global-layout
  word-wrap: break-word;
</style>