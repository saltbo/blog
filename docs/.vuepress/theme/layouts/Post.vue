<template>
  <div class="container">
      <el-card class="box-card">
        <article style="padding:0 10px;">
          <header>
            <h1 class="post-title" itemprop="name headline">{{ $frontmatter.title }}</h1>
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

      <el-card class="box-card comment">
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
.post-title
  margin 20px 0
</style>