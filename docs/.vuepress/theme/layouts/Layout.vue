<template>
  <div id="default-layout">
    <Card :title="$page.title">
      <Content class="custom" />
    </Card>

    <Card class="mt-5 px-10" v-if="$page.frontmatter.comment">
      <Disqusjs />
    </Card>
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