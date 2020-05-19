<template>
  <div class="container">
      <div class="box">
        <article>
          <header class="post-header">
            <h1 class="title" itemprop="name headline">{{ $frontmatter.title }}</h1>
            <PostMeta
              :tags="$frontmatter.tags"
              :author="$frontmatter.author"
              :date="$frontmatter.date"
              :location="$frontmatter.location"
            />
          </header>
          <Content />
          <PageEdit />
          <!-- 版权 -->
          <Copyright />
          <!-- 打赏 -->
        </article>
      </div>

      <div class="box with-padding">
        <Disqusjs />
      </div>
      <Toc />
  </div>
</template>

<script>
import PageEdit from '@parent-theme/components/PageEdit.vue'
import Toc from '@theme/components/Toc.vue'
import PostMeta from '@theme/components/PostMeta.vue'
import Copyright from '@theme/components/Copyright.vue'
export default {
  components: {
    Toc,
    Copyright,
    PostMeta,
    PageEdit
  },
  mounted(){
    console.log(this);
  }
}
</script>

<style lang="stylus" scoped>
.post-header
  padding 2rem 2.5rem 0 2.5rem;
  & > .title
    margin 20px 0
    word-break break-word
  @media (max-width: $MQMobile)
    padding 1rem 2.5rem 0 1.5rem;
</style>