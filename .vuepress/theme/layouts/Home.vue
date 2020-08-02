<template>
  <Card class="py-10">
    <TContent />
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
@require '../styles/wrapper.styl';

.activity
  @extend $wrapper;

  & >>> pre, pre[class*='language-']
    @apply: bg-gray-300;

    code
      color: #000;

  & >>> div[class*='language-']
    @apply: bg-gray-300;
</style>