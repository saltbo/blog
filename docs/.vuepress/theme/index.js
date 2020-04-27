const removeMd = require('remove-markdown')
const path = require('path')
const pick = require('lodash/pick')

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
    // 'sitemap',
    'comment',
    // 'newsletter',
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
      ['@vuepress/blog', blogPluginOptions],
      ['@vuepress/medium-zoom', true],
    ]
  }
}
