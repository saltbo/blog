import DisqusJS from './disqusjs.vue'

export default ({ Vue }) => {
    const options = JSON.parse(DISQUSJS_OPTIONS);
  
    const name = options.name || "Disqusjs"
  
    // options will be pass down as props to the components later
    delete options.name
  
    Vue.component(name, {
      functional: true,
      render(h, { parent, props }) {

        // SSR-friendly
        if (parent._isMounted) {
          console.log(options)

          return h(DisqusJS, {
            props: Object.assign(options, props)
          });
        } else {
          parent.$once("hook:mounted", () => {
            parent.$forceUpdate();
          });
        }
      }
    });

  };