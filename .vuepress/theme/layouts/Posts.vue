<template>
  <el-card class="box-card">
    <timeline>
      <timeline-title>太棒了! 目前共计 {{articles.length}} 篇日志。 继续努力。</timeline-title>
      <timeline-item v-for="article in articles">
        <h3 v-if="!article.id">{{ article.title }}</h3>
        <router-link v-else class="post-link" :to="article.path">
          <span class="date">{{dateFormat(article.frontmatter.date)}}</span>
          <span class="title">{{ article.title }}</span>
        </router-link>
      </timeline-item>
    </timeline>
  </el-card>
</template>

<script>
import { Timeline, TimelineItem, TimelineTitle } from 'vue-cute-timeline'
export default {
  components: {
    Timeline,
    TimelineItem,
    TimelineTitle
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
      let posts = this.$site.pages.filter(item => {
        return item.id == 'post'
      })
      this.sortPostsByDate(posts)
      
      // insert the year item into the posts array.
      let lastPostYear;
      for (let i = 0; i < posts.length; i++) {
        if(!posts[i].frontmatter) continue;

        const postYear = this.dateFormat(posts[i].frontmatter.date, 'year');
        if(postYear!=lastPostYear){
          posts.splice(i, 0, {title: postYear})
        }

        lastPostYear = postYear
      }
      
      return posts
    }
  },
  mounted(){
  }
}
</script>

<style lang="stylus" scoped>
.post-link
  line-height 30px
  color #888
  font-size 16px
  cursor pointer
  text-decoration none
  .title
    font-weight 600
  :hover
    color $accentColor
</style>