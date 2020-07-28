<template>
  <div class="px-10">
    <div class="flex my-8" v-for="page in pages">
      <router-link :to="page.path" class="cover w-1/4">
        <img :src="page.frontmatter.cover" alt />
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
      console.log(this.data);
      return this.data;
    },
  },
};
</script>

<style lang="stylus" scoped>
.cover {
  @apply: flex;
  box-shadow: 0 5px 11px 0 rgba(0, 0, 0, 0.18), 0 4px 15px 0 rgba(0, 0, 0, 0.15);

  & > img {
    @apply: block rounded mx-auto;
    width: 100%;
    height: 10rem;
    object-fit: fill;
    border: none;
  }
}

.title {
  flex: 0 0 auto;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.intro {
  flex: 1 0 auto;
  @apply: my-3;

  & >>> p {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3; // 控制多行的行数
    -webkit-box-orient: vertical;
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