<template>
  <div class="container" v-if="$pagination">
    <div class="box with-padding">
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
  </div>

  <DefaultThemeLayout v-else></DefaultThemeLayout>
</template>

<script>
import DefaultThemeLayout from '@parent-theme/layouts/Layout.vue'
export default {
  components: {
    DefaultThemeLayout,
  },
  computed:{
  },
  methods:{
  },
  mounted(){
    console.log(this);
  }
}
</script>

<style lang="stylus" scoped>

</style>