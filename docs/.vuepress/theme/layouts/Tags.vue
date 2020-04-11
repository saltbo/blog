<template>
  <div class="container">
    <el-card class="box-card">
      <h3>目前共计 {{$tag.list.length}} 个标签</h3>
      <ul class="tags">
        <li v-for="tag in $tag.list">
          <router-link class="page-link" :to="tag.path" style="">{{ tag.name }}</router-link>
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script>
export default {
  computed: {
    tagSize() {
      return (
        (this.$themeConfig.footer && this.$themeConfig.footer.copyright) || []
      )
    },
  },
}
</script>

<style lang="stylus" scoped>
.container
  text-align center

.tags
  li 
    display inline
    margin 0 20px
    line-height 50px
</style>