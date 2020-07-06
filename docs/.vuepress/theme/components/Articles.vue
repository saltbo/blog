<template>
  <div>
    <div class="flex my-3" v-for="page in pages">
      <router-link :to="page.path" class="w-1/3">
        <img class="rounded" src="https://static.zkqiang.cn/images/20200323131541.png-cover" alt />
      </router-link>
      <div class="w-2/3 px-4 py-1">
        <h3 class="title">
          <router-link :to="page.path">{{ page.title }}</router-link>
        </h3>
        <div class="intro" v-html="page.excerpt"></div>
        <div class="meta">
          <CalendarIcon class="icon" />
          <div class="py-2">{{ page.frontmatter.date | moment('YYYY-MM-DD') }}</div>
          <ClockIcon class="icon" />
          <div class="py-2">阅读约10分钟</div>
          <TagIcon class="icon" v-if="page.frontmatter.tags" />
          <div class="py-2">
            <div class="tag-item" v-for="tag in page.frontmatter.tags" :key="tag">
              <router-link :to="'/tags/'+tag">{{tag}}</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CalendarIcon, ClockIcon, TagIcon } from "vue-feather-icons";
export default {
  props: {
    data: Array
  },
  components: { CalendarIcon, ClockIcon, TagIcon },
  computed: {
    pages() {
      return this.data.slice(0, 5);
    }
  }
};
</script>

<style lang="stylus" scoped>
.title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.intro {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; // 控制多行的行数
  -webkit-box-orient: vertical;
  @apply: mt-2 text-gray-600;
}

.meta {
  @apply: flex flex-row items-center text-gray-600;

  & > .icon {
    @apply: w-5 h-5 flex justify-center mx-2;

    &:first-child {
      @apply: ml-0;
    }
  }
}
</style>