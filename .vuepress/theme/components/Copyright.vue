<template>
  <ul class="copyright">
    <li>
      原文出处：
      <a :href="origin">{{origin}}</a>
    </li>
    <li>
      原文作者：
      <a href="https://github.com/saltbo">https://github.com/saltbo</a>
    </li>
    <li>
      原文链接：
      <a :href="link">{{link}}</a>
    </li>
    <li>版权声明：本文欢迎任何形式转载，转载时完整保留本声明信息（包含原文链接、原文出处、原文作者、版权声明）即可。本文后续所有修改都会第一时间在原始地址更新。</li>
  </ul>
</template>
<script>
export default {
  data() {
    return {
      location: {},
    };
  },
  computed: {
    origin() {
      return this.location.origin;
    },
    link() {
      return this.location.href;
    },
  },
  mounted() {
    this.location = window.location;
  },
};
</script>

<style lang="stylus" scoped>
.copyright
  background-color: #edf2f7;
  border-left: 4px solid #fc8181;
  color: #666;
  padding: 1rem 0.5rem 1rem 1rem;
  word-break: break-all;

  li
    line-height: 28px;
    list-style: none;

  @media (max-width: $MQMobile)
    margin: 1rem;
</style>