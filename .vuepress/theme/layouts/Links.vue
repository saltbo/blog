<template>
  <Card title="友情链接">
    <div class="grid grid-cols-3 gap-2 links">
      <Card shadow="never" :body-style="{padding: 0}" :style="`background-color: ${link.bgColor}; color: ${link.textColor}`" v-for="link in $frontmatter.meta">
        <a class="flex m-1" :href="link.link" target="_blank">
          <div class="w-1/3">
            <img class="w-15 h-15 p-2 rounded-full" :src="link.avatar" alt />
          </div>
          <div class="w-2/3 text-center">
            <h3 class="my-2">{{ link.name }}</h3>
            <div class="text-xs">{{ link.intro }}</div>
          </div>
        </a>
      </Card>
    </div>
    <div>
      <Content class="custom theme-content" />
      <PageEdit />
    </div>
  </Card>
</template>

<script>
import PageEdit from "@parent-theme/components/PageEdit.vue";
export default {
  components: {
    PageEdit,
  },
  computed: {},
};
</script>

<style lang="stylus" scoped>
@require '../styles/wrapper.styl';

.links {
  @extend $wrapper;
  @apply: pt-3;
}
</style>