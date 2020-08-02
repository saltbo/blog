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
      {
        id: 'note',
        dirname: 'notes',
        path: '/notes/',
        layout: 'Notes',
        itemLayout: 'Note',
        itemPermalink: '/:regular',
        frontmatter: { title: 'Notes' },
      },
    ],
    frontmatters: [
      {
        id: "tag",
        keys: ['tag', 'tags'],
        path: '/tags/',
        layout: 'Tags',
        scopeLayout: 'Tag',
        frontmatter: { title: 'Tags' },
      },
    ],
    globalPagination: {
      lengthPerPage: 10,
    },
  }

  const properties = [
    'directories',
    'frontmatters',
    'globalPagination',
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
    additionalPages: [
      {
        path: '/archives/',
        frontmatter: {
          layout: 'Archives'
        }
      }
    ],
    plugins: [
      // official plugins
      ['@vuepress/blog', blogPluginOptions],
      ['@vuepress/google-analytics', { 'ga': themeConfig.googleAnalytics }],
      ['@vuepress/pwa', {
        serviceWorker: true,
        updatePopup: true
      }],
      ['@vuepress/medium-zoom'],
      ['@vuepress/last-updated', {
        transformer: (timestamp, lang) => {
          return moment(timestamp).format('Y-M-D H:m:s')
        }
      }],

      // community plugins
      ['reading-time'],
      ['disqusjs', themeConfig.disqusjs],
      [require('../plugins/vuepress-plugin-sign')],
    ],
  }
}
