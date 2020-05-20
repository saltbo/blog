const removeMd = require('remove-markdown')
const path = require('path')
const pick = require('lodash/pick')
const moment = require('moment')

module.exports = themeConfig => {
  /**
   * Default theme configuration
   */
  themeConfig = Object.assign(themeConfig, {
    nav: themeConfig.nav || [
      {
        text: 'Home',
        link: '/',
      },
      {
        text: 'Posts',
        link: '/posts/',
      },
      {
        text: 'Tags',
        link: '/tags/',
      },
    ],
  })

  /**
   * Configure blog plugin
   */
  const defaultBlogPluginOptions = {
    directories: [
      {
        id: 'post',
        dirname: 'posts',
        path: '/posts/',
        layout: 'Posts',
        itemLayout: 'Post',
        itemPermalink: '/:regular',
        frontmatter: { title: 'Posts' },
      },
    ],
    frontmatters: [
      {
        id: "tag",
        keys: ['tag', 'tags'],
        path: '/tags/',
        layout: 'Tags',
        // scopeLayout: 'Tags',
        frontmatter: { title: 'Tags' },
      },
    ],
    globalPagination: {
      lengthPerPage: 10,
    },
  }

  const properties = [
    // 'directories',
    // 'frontmatters',
    // 'globalPagination',
    'sitemap',
    'comment',
    // 'newsletter',
    'feed',
  ]
  const themeConfigPluginOptions = {
    ...pick(themeConfig, properties),
  }

  const blogPluginOptions = Object.assign(
    {},
    defaultBlogPluginOptions,
    themeConfigPluginOptions
  )

  return {
    extend: '@vuepress/theme-default',  // Theme Inheritance => https://vuepress.vuejs.org/theme/inheritance.html
    plugins: [
      // official plugins
      ['@vuepress/blog', blogPluginOptions],
      ['@vuepress/medium-zoom', true],
      ['@vuepress/last-updated', {
        transformer: (timestamp, lang) => {
          return moment(timestamp).format('Y-M-D H:m:s')
        }
      }],

      // community plugins
      ['disqusjs', themeConfig.disqusjs],
      [require('../vuepress-plugin-sign')],
    ]
  }
}
