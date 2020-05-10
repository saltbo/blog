<template>
  <div id="app__global-layout">
    <header>
      <Header />
    </header>

    <main>
      <DefaultGlobalLayout />
    </main>
    
    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script>
  import GlobalLayout from '@app/components/GlobalLayout.vue'
  import Header from '@parent-theme/components/Navbar.vue'
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
        isMobileHeaderOpen: false,
      }
    },
    mounted() {
      this.script = require('busuanzi.pure.js');
      this.$router.afterEach(() => {
        this.isMobileHeaderOpen = false
      })
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
#app__global-layout
  word-wrap break-word

// .container
//   padding 120px 10px 30px 10px
//   min-height calc(100vh - 30px - 120px - 100px)
//   max-width $contentWidth
//   margin 0 auto

//   @media (max-width: $MQMobile)
//     &
//       padding 70px 10px 20px 10px
//       min-height calc(100vh - 20px - 70px - 100px)
</style>