<template>
  <Card class="py-10">
    <Content class="custom activity" />
  </Card>
</template>

<script>
import axios from "axios";
export default {
  components: {},
  computed: {},
  methods: {},
  mounted() {},
};
</script>

<style lang="stylus" scoped>
.activity {
  & >>> pre, pre[class*='language-'] {
    @apply: bg-gray-300;

    code {
      color: #000;
    }
  }

  & >>> div[class*='language-'] {
    @apply: bg-gray-300;
  }
}
</style>