<template>
  <div class="px-10">
    <div class="flex my-3" v-for="page in pages">
      <router-link :to="page.path" class="w-1/4">
        <img class="rounded" src="https://static.zkqiang.cn/images/20200323131541.png-cover" alt />
      </router-link>
      <div class="flex flex-col w-4/5 px-4 py-1">
        <h1 class="title">
          <router-link :to="page.path">{{ page.title }}</router-link>
        </h1>
        <div class="intro" v-html="page.excerpt"></div>
        <div class="meta">
          <div class="meta-item">
            <CalendarIcon class="icon" />
            <p>{{ page.frontmatter.date | moment('YYYY-MM-DD') }}</p>
          </div>
          <div class="meta-item">
            <ClockIcon class="icon" />
            <p>阅读约10分钟</p>
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
.title {
  flex: 0 0 auto;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.intro {
  flex: 1 0 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; // 控制多行的行数
  -webkit-box-orient: vertical;
  @apply: my-2;

  & >>> p {
    line-height: 1.4rem;
  }
}

.meta {
  flex: 0 0 auto;
  @apply: flex bottom-0;

  & > .meta-item {
    @apply: flex flex-row items-center mr-4 text-gray-600;

    & > .icon {
      @apply: w-5 h-5 flex justify-center mr-1;
    }
  }
}
</style>

// &:first-child {
//   @apply: ml-0;
// }