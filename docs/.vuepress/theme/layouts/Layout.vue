<template>
  <div id="default-layout">
    <div v-if="!$pagination">
      <Card :title="$page.title">
        <Content />
      </Card>

      <Card class="p-10" v-if="$page.frontmatter.comment">
        <Disqusjs />
      </Card>
    </div>
    <div v-else>
      <ul>
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
</template>

<script>
export default {
  components: {},
  computed: {},
  methods: {},
  mounted() {
    console.log(this);
  }
};
</script>

<style lang="stylus" scoped></style>