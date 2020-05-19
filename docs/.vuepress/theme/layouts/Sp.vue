<template>

  <!-- content layout -->
  <div class="container" v-else>
      <article class="box">
        <Content />
      </article>

    <div class="box with-padding" v-if="$page.frontmatter.comment">
      <Disqusjs />
    </div>
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