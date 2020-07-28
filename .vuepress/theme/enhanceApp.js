import Vue from 'vue'
import moment from 'moment';
import postMixin from '@theme/mixins/posts'

const momentfun = function (value, formatString) {
  formatString = formatString || 'YYYY-MM-DD HH:mm:ss';
  return moment(value).format(formatString);
}

export default ({
  Vue,
  options,
  router
}) => {
  Vue.mixin(postMixin)

  Vue.prototype.$moment = moment;
  Vue.filter('moment', momentfun);
  if (!String.prototype.moment) {
    String.prototype.moment = momentfun;
  }
}