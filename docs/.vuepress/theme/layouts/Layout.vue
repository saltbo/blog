<template>
  <div class="container">
    <el-card class="box-card">
      <!-- pages layout -->
      <div v-if="$pagination">
        <ul id="default-layout">
          <li v-for="page in $pagination.pages">
            <router-link class="page-link" :to="page.path">{{ page.title }}</router-link>
          </li>
        </ul>
        <div id="pagination">
          <router-link v-if="$pagination.hasPrev" :to="$pagination.prevLink">Prev</router-link>
          <router-link v-if="$pagination.hasNext" :to="$pagination.nextLink">Next</router-link>
        </div>
      </div>
      
      <!-- content layout -->
      <article v-else style="padding:0 20px;">
        <Content />
      </article>
    </el-card>
  </div>
      
</template>
<script>
export default {
  components: {
  },
  mounted(){
  }
}
</script>