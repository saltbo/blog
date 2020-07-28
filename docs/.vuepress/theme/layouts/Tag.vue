<template>
  <Card :title="$frontmatter.title" class="pb-10">
    <Articles :data="$pagination.pages" />

    <div id="pagination">
      <router-link v-if="$pagination.hasPrev" :to="$pagination.prevLink">Prev</router-link>
      <router-link v-if="$pagination.hasNext" :to="$pagination.nextLink">Next</router-link>
    </div>
  </Card>
</template>

<script>
import Articles from "@theme/components/Articles.vue";
export default {
  components: {
    Articles,
  },
  mounted() {},
};
</script>

<style>
</style>