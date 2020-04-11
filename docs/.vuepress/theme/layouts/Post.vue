<template>
  <div class="container">
      <el-card class="box-card">
        <article style="padding:0 20px;">
          <header>
            <h1 style="margin: 0">{{ $frontmatter.title }}</h1>
            <PostMeta
              :tags="$frontmatter.tags"
              :author="$frontmatter.author"
              :date="$frontmatter.date"
              :location="$frontmatter.location"
            />
          </header>

          <Content />
          <Copyright />
          <!-- 版权 -->
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
</style>