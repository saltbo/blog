<template>
  <div class="container">
      <el-card class="box-card">
        <article style="padding:0 10px;">
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
          <!-- 版权 -->
          <Copyright />
          <!-- 打赏 -->
        </article>
      </el-card>

      <el-card class="comment-card">
        <Comment />
      </el-card>
      <Toc />
  </div>
</template>

<script>
import Toc from '@theme/components/Toc.vue'
import PostMeta from '@theme/components/PostMeta.vue'
import Copyright from '@theme/components/Copyright.vue'
import { Comment } from '@vuepress/plugin-blog/lib/client/components'
export default {
  components: {
    Toc,
    Copyright,
    Comment,
    PostMeta,
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