<template>
  <div id="app__global-layout">
    <Header />
    <main class="container">
      <Layout />
    </main>
    <Footer />
  </div>
</template>

<script>
import Layout from "@app/components/GlobalLayout.vue";
import Header from "@theme/components/Header.vue";
import Footer from "@theme/components/Footer.vue";
export default {
  components: {
    Layout,
    Header,
    Footer
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
  @apply: mx-auto mt-5 px-20;
}
</style>