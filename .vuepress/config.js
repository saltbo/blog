// .vuepress/config.js
const path = require('path')

module.exports = {
  lang: 'zh-CN',
  title: "Saltbo",
  description: 'A laboratory of saltbo',
  dest: 'public',
  head: [
    ['script', { type: 'text/javascript' }, `
      var targetProtocol = "https:";
      if (window.location.hostname != 'localhost' && window.location.protocol != targetProtocol)
        window.location.href = targetProtocol + window.location.href.substring(window.location.protocol.length);`]
  ],
  markdown: {
    // lineNumbers: true
  },
  postcss: {
    plugins: [
      require('autoprefixer'),
    ]
  },
  // theme: '@vuepress/theme-blog',
  themeConfig: {
    nav: [
      { text: '主页', link: '/' },
      // { text: '分享', link: '/shares/' },
      // { text: '笔记', link: '/posts/' },
      { text: '文章', link: '/categories/' },
      { text: '小册', link: '/booklets.html' },
      { text: '友链', link: '/links.html' },
      // { text: '赞助', link: '/sponsor.html' },
      { text: '关于', link: '/about.html' },
      // { text: '实验室', link: 'https://labs.saltbo.cn/' },
    ],
    sidebar: 'auto',
    search: true,
    smoothScroll: true,
    dateFormat: 'YYYY-MM-DD',
    searchMaxSuggestions: 10,
    repo: 'saltbo/blog',
    repos: [
      'saltbo/zpan',
      'saltbo/uptoc',
      'bonaysoft/notion-md-gen'
    ],
    docsDir: 'docs',
    editLinks: true,
    editLinkText: '发现错误了？去修改!',
    lastUpdated: '最近更新', // string | boolean
    googleAnalytics: 'UA-133655531-1',
    disqusjs: {
      shortname: 'saltbo',
      api: 'https://disqus.saltbo.cn/',
      apikey: 'gioBErFEknLy1N9x4vhz8cPY46yXTmJXUIZWbSvADryC6QcbDyCnC76mvypN1dtT',
    },
    sitemap: {
      hostname: 'https://saltbo.cn',
    },
    feed: {
      canonical_base: 'https://saltbo.cn'
    },
    footer: {
      copyright: "© 2020 - Saltbo's Blog",
      icp: '冀ICP备13004362号-5',
      siteStartAt: '2019/03/21 22:03:04'
    },
  }
}
