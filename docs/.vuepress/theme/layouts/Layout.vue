<template>
  <!-- pages layout -->
  <div class="container" v-if="$pagination">
    <el-card class="box-card">
      <ul id="default-layout">
        <li v-for="page in $pagination.pages">
          <router-link class="page-link" :to="page.path">{{ page.title }}</router-link>
        </li>
      </ul>
      <div id="pagination">
        <router-link v-if="$pagination.hasPrev" :to="$pagination.prevLink">Prev</router-link>
        <router-link v-if="$pagination.hasNext" :to="$pagination.nextLink">Next</router-link>
      </div>
    </el-card>
  </div>

  <!-- content layout -->
  <div class="container" v-else>
    <el-card class="box-card">
      <article style="padding:0 20px;">
        <Content />
      </article>
    </el-card>

    <el-card class="box-card comment" v-if="$page.frontmatter.layout">
      <Comment />
    </el-card>
  </div>
</template>
<script>
import { Comment } from '@vuepress/plugin-blog/lib/client/components'
export default {
  components: {
    Comment
  },
  mounted(){
    console.log(this)
  }
}
</script>