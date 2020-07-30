<template>
  <div class="post-meta">
    <!-- author -->
    <div v-if="author" class="post-meta-author" itemprop="publisher author" itemtype="http://schema.org/Person" itemscope>
      <NavigationIcon />
      <span itemprop="name">{{ author }}</span>
      <span v-if="location" itemprop="address">&nbsp; in {{ location }}</span>
    </div>

    <!-- date -->
    <div v-if="date" class="post-meta-date">
      <ClockIcon />
      <time pubdate itemprop="datePublished" :datetime="date">{{ resolvedDate }}</time>
    </div>

    <!-- pv -->
    <div class="post-meta-pv">
      <EyeIcon />
      <span id="busuanzi_value_page_pv"></span>
    </div>

    <!-- tags -->
    <div class="post-meta-tags" itemprop="keywords" v-if="tags">
      <TagIcon />
      <div class="tag-item" v-for="tag in resolvedTags" :key="tag">
        <router-link :to="'/tags/'+tag">{{tag}}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { NavigationIcon, ClockIcon, EyeIcon, TagIcon } from "vue-feather-icons";
export default {
  name: "PostMeta",
  components: { NavigationIcon, ClockIcon, EyeIcon, TagIcon },
  props: {
    tags: {
      type: [Array, String],
    },
    author: {
      type: String,
    },
    date: {
      type: String,
    },
    location: {
      type: String,
    },
  },
  computed: {
    resolvedDate() {
      return dayjs(this.date).format(
        this.$themeConfig.dateFormat || "ddd MMM DD YYYY"
      );
    },
    resolvedTags() {
      if (!this.tags || Array.isArray(this.tags)) return this.tags;
      return [this.tags];
    },
  },
};
</script>

<style lang="stylus">
.post-meta {
  border-top: 1px solid #DCDFE6;
  padding-top: 8px;

  > div {
    display: inline-flex;
    line-height: 12px;
    font-size: 15px;
    margin-right: 20px;
  }

  @media (max-width: $MQMobile) {
    &-tags {
      margin-top: 20px;
    }

    & > div {
      margin-right: 10px;
    }
  }

  svg {
    margin-right: 5px;
    width: 16px;
    height: 14px;
  }
}

.tag-item {
  margin-right: 10px;
}
</style>