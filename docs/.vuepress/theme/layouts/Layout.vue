<template>
  <div class="">
    <Sidebar
      :items="sidebarItems"
      @toggle-sidebar="toggleSidebar"
    >
      <template #top>
        <slot name="sidebar-top" />
      </template>
      <template #bottom>
        <slot name="sidebar-bottom" />
      </template>
    </Sidebar>
    <div style="padding-left: 20rem;">
      <article style="padding:0 10px;">
        <header>
          <h1 class="post-title" itemprop="name headline">{{ $frontmatter.title }}</h1>
        </header>
        <Content />
        <PageEdit />
      </article>

      <!-- <el-card class="box-card comment">
        <Comment />
      </el-card> -->
    </div>
  </div>
</template>

<script>
import Sidebar from '@parent-theme/components/Sidebar.vue'
import PageEdit from '@parent-theme/components/PageEdit.vue'
import PostMeta from '@theme/components/PostMeta.vue'
import Copyright from '@theme/components/Copyright.vue'
import { Comment } from '@vuepress/plugin-blog/lib/client/components'
import { resolveSidebarItems } from '@parent-theme/util'
export default {
  components: {
    Sidebar,
    Copyright,
    Comment,
    PostMeta,
    PageEdit,
  },
  computed:{
    sidebarItems () {
      return resolveSidebarItems(
        this.$page,
        this.$page.regularPath,
        this.$site,
        this.$localePath
      )
    },
  },
  methods:{
    toggleSidebar (to) {
      this.isSidebarOpen = typeof to === 'boolean' ? to : !this.isSidebarOpen
      this.$emit('toggle-sidebar', this.isSidebarOpen)
    },
  },
  mounted(){
    console.log(this);
  }
}
</script>

<style lang="stylus" scoped>
.post-title
  margin 20px 0
  word-break keep-all

</style>