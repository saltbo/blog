<template>
  <footer>
    <div class="frow" v-if="$themeConfig.footer">
      {{copyright}} -
      <a class="beian" rel="noopener" href="http://beian.miit.gov.cn/" target="_blank" v-if="icp">{{icp}}</a>
    </div>
    <div class="frow">
      本站已稳定运行：
      <span>{{runtime.days}}</span>天
      <span>{{runtime.hours}}</span>时
      <span>{{runtime.minutes}}</span>分
      <span>{{runtime.seconds}}</span>秒
    </div>
    <div class="frow">
      Powered by
      <a rel="noopener" href="https://vuepress.vuejs.org/" target="_blank">Vuepress</a> &
      <a rel="noopener" href="https://github.com/saltbo/" target="_blank">Saltbo</a>
    </div>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      startAt: new Date("2018/02/25 21:09:09"),
      runtime: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
    };
  },
  computed: {
    copyright() {
      return (
        (this.$themeConfig.footer && this.$themeConfig.footer.copyright) || ""
      );
    },
    icp() {
      return (this.$themeConfig.footer && this.$themeConfig.footer.icp) || [];
    },
  },
  methods: {
    setRuntime() {
      let nowAt = new Date();
      let diffTs = parseInt(nowAt - this.startAt) / 1000;
      this.runtime.days = Math.floor(diffTs / 24 / 3600);

      diffTs %= 24 * 3600;
      this.runtime.hours = Math.floor(diffTs / 3600);

      diffTs %= 3600;
      this.runtime.minutes = Math.floor(diffTs / 60);

      diffTs %= 60;
      this.runtime.seconds = Math.floor(diffTs / 1);
    },
  },
  mounted() {
    if (this.$themeConfig.footer) {
      this.startAt = new Date(this.$themeConfig.footer.siteStartAt);
    }

    setInterval(() => {
      this.setRuntime();
    }, 1000);
  },
};
</script>

<style lang="stylus" scoped>
footer
  color: #666;
  font-size: 0.8em;
  margin: 0 auto;
  padding: 10px 0;
  text-align: center;

  a
    color: #666;
    font-weight: normal;
    text-decoration: none;

  .beian
    font-size: 0.7em;

.frow
  line-height: 26px;
</style>
