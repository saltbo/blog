<template>
  <el-container>
    <el-header style="padding: 0">
      <Header />
    </el-header>
    <el-main style="margin-top: 30px;">
      <DefaultGlobalLayout class="container"/>
    </el-main>
    <el-footer>
      <Footer />
    </el-footer>
  </el-container>
</template>

<script>
  import GlobalLayout from '@app/components/GlobalLayout.vue'
  import Header from '@theme/components/Header.vue'
  import Footer from '@theme/components/Footer.vue'
  export default {
    components: { 
      DefaultGlobalLayout: GlobalLayout,
      Header,
      Footer,
    },
    data(){
      return {
        script: Object,
      }
    },
    mounted() {
      this.script = require('busuanzi.pure.js');
    },
    watch: {
      $route(to, from) {
        if (to.path != from.path) {
          this.script.fetch();
        }
      }
    }
  }
</script>

<style lang="stylus">
</style>