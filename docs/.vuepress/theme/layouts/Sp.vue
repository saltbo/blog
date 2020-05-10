<template>

  <!-- content layout -->
  <div class="container" v-else>
      <article class="box">
        <Content />
      </article>

    <div class="box with-padding" v-if="$page.frontmatter.comment">
      <Comment />
    </div>
  </div>
</template>
<script>
import { Comment } from '@vuepress/plugin-blog/lib/client/components'
export default {
  components: {
    Comment,
  },
  mounted(){
  }
}
</script>