<template>
  <Card title="友情链接">
    <div class="flex flex-wrap justify-center md:justify-between lg:justify-between links">
      <Card class="w-64 my-2" shadow="never" :body-style="{padding: 0}" :style="`background-color: ${link.bgColor}; `" v-for="link in $frontmatter.meta">
        <a class="flex m-1" :href="link.link" target="_blank" rel="noopener" :style="`color: ${link.textColor}`">
          <div class="w-1/3">
            <img class="w-15 h-15 p-2 rounded-full" :src="link.avatar" alt />
          </div>
          <div class="w-2/3 text-left pl-5 pt-2">
            <h3 class="my-2">{{ link.name }}</h3>
            <div class="text-xs">{{ link.intro }}</div>
          </div>
        </a>
        <i></i>
      </Card>
    </div>
    <div>
      <TContent />
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

.links
  @extend $wrapper;
  @apply: pt-3;

.links:after
  @apply: w-64; // 这个宽度和子元素宽度一致
  content: ' ';
  display: block;
  height: 0;

.links .card
  @apply: w-64;
</style>