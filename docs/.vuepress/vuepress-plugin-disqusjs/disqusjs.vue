<template>
  <div id="disqus_thread"></div>
</template>

<script>
import DisqusJS from 'disqusjs'
import 'disqusjs/dist/disqusjs.css'
export default {
    name: 'disqusjs',
    props: {
     shortname: {
        type: String,
        required: true
      },
      siteName: {
        type: String,
        required: false
      },
      identifier: {
        type: String,
        required: false
      },
      url: {
        type: String,
        required: false
      },
      title: {
       type: String,
       required: false
      },
      api: {
       type: String,
       required: false
      },
      apikey: {
       type: String,
       required: true
      },
      nesting: {
       type: Number,
       required: false
      },
      admin: {
        type: Object,
        required: false
      },
      adminLabel: {
        type: String,
        required: false
      }
    },
    data(){
        return {
        }
    },
    mounted(){
        var dsqjs = new DisqusJS(this.$options.propsData);
    }
}
</script>

<style>

</style>