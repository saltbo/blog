const path = require('path')

module.exports = (options) => ({
  name: "disqusjs",

  enhanceAppFiles: [path.resolve(__dirname, "enhanceAppFile.js")],

  define: {
    DISQUSJS_OPTIONS: JSON.stringify(options)
  }
})