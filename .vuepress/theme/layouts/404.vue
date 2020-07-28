<template>
  <div class="box">
    <section class="theme-container">
        <article class="content">
            <h1>404</h1>
            <blockquote>{{ getMsg() }}</blockquote>
            <router-link to="/">Take me home.</router-link>
        </article>
    </section>
  </div>
</template>

<script>
const msgs = [
  `There's nothing here.`,
  `How did we get here?`,
  `That's a Four-Oh-Four.`,
  `Looks like we've got some broken links.`
]

export default {
  computed: {
  },
  mounted () {
  },
  methods: {
    getMsg () {
      return msgs[Math.floor(Math.random() * msgs.length)]
    }
  }
}
</script>


<style lang="stylus">
.content
  margin 4rem auto 0
  max-width 800px
  padding 0 2rem
.mod_404
  .desc
    .desc_link
      display: inline-block
      // margin: 20px 0
      background: #424242!important
      color: #ffffff
      padding: 6px 20px!important
      text-decoration: none!important
      border-radius: 4px

@media screen and (max-width: 720px)
  .mod_404
    .desc
      margin: 50px 0
    .wrapper
      margin 0!important
      padding-top 20px
</style>

