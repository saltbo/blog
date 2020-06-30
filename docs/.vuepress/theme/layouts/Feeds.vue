<template>
  <div class="container">
    <div class="box with-padding">
       <div v-for="article in articles">
          <h3 v-if="!article.id">{{ article.title }}</h3>
          <router-link v-else class="post-link" :to="article.path">
            <span class="date">{{ dateFormat(article.frontmatter.date) }}</span>
            <span class="title">{{ article.title }}</span>
          </router-link>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
  },
  methods:{
    compareDate (a, b) {
      function getTimeNum (date) {
        return new Date(date.frontmatter.date).getTime()
      }
      return getTimeNum(b) - getTimeNum(a)
    },
    sortPostsByDate (posts) {
      posts.sort((prev, next) => {
        return this.compareDate(prev, next)
      })
    },
    dateFormat (date, type) {
      function renderTime (date) {
        var dateee = new Date(date).toJSON()
        return new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/-/g, '/')
      }
      date = renderTime(date)
      const dateObj = new Date(date)
      const year = dateObj.getFullYear()
      const mon = dateObj.getMonth() + 1
      const day = dateObj.getDate()
      if (type == 'year') return year
      else return `${mon}-${day}`
    }
  },
  computed: {
    articles(){
      let feeds = this.$site.pages.filter(item => {
        return item.id == 'feed'
      })
      this.sortPostsByDate(feeds)
      return feeds
    }
  },
  mounted(){
  }
}
</script>

<style lang="stylus" scoped>
.timeline-item
  padding-bottom 0
  h3
    margin-top 50px
    margin-bottom 0
  .post-link
    color #888
    font-size 14px
    font-weight 550
    cursor pointer
    text-decoration none
    .date
      display inline-block
      width 45px
    .title
      font-size 16px
      font-weight 600
  &:hover
    .timeline-circle
      color $accentColor !important
    .post-link 
      color $accentColor
</style>