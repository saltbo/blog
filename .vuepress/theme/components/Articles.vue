<template>
  <div class="px-2 lg:px-10">
    <div class="py-3 md:flex" v-for="page in pages">
      <router-link class="md:flex-none" :to="page.path">
        <img class="rounded-md w-full md:w-56 h-40 mx-auto shadow" :src="page.frontmatter.cover" alt />
      </router-link>
      <div class="flex flex-col md:ml-5">
        <router-link :to="page.path">
          <h1 class="break-all md:max-w-sm lg:max-w-lg xl:max-w-2xl md:truncate my-3">{{ page.title }}</h1>
        </router-link>
        <div class="intro md:flex-grow break-all" v-html="page.excerpt"></div>
        <div class="flex flex-wrap mt-2">
          <div class="meta-item">
            <CalendarIcon class="icon" />
            <p>{{ page.frontmatter.date | moment('YYYY-MM-DD') }}</p>
          </div>
          <div class="meta-item">
            <ClockIcon class="icon" />
            <p>{{ page.readingTime.text }}</p>
          </div>
          <div class="meta-item">
            <TagIcon class="icon" v-if="page.frontmatter.tags" />
            <div class="mr-1" v-for="tag in page.frontmatter.tags" :key="tag">
              <router-link :to="'/tags/'+tag">{{tag}}</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- pagination -->
    <div class="mt-10 text-center">
      <Pagination />
    </div>
  </div>
</template>

<script>
import { CalendarIcon, ClockIcon, TagIcon } from "vue-feather-icons";
import { Pagination } from "@vuepress/plugin-blog/lib/client/components";
export default {
  props: {
    data: Array,
  },
  components: {
    CalendarIcon,
    ClockIcon,
    TagIcon,
    Pagination,
  },
  computed: {
    pages() {
      return this.data;
    },
  },
};
</script>

<style lang="stylus" scoped>
.icon
  @apply: flex w-5 h-5 justify-center mr-1;

.intro
  & >>> p
    display: -webkit-box;
    line-height: 1.4rem;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3; // 控制多行的行数

.meta-item
  @apply: flex items-center mr-2 mb-2;
</style>
