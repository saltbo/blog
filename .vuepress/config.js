// .vuepress/config.js
const path = require('path')

module.exports = {
  lang: 'zh-CN',
  title: "Saltbo",
  description: 'A laboratory of saltbo',
  dest: 'public',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['link', { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon-152x152.png' }],
    ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
    ['link', { rel: 'stylesheet', href: 'https://unpkg.com/bulma@0.9.3/css/bulma.min.css' }],
    ['link', { rel: 'stylesheet', href: 'https://unpkg.com/@fortawesome/fontawesome-free@5.15.4/css/all.min.css' }],
    ['link', { rel: 'stylesheet', href: 'https://unpkg.com/github-markdown-css@5.1.0/github-markdown-light.css' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }],
    ['meta', { name: 'referrer', content: 'no-referrer-when-downgrade' }],
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
      { text: '维基', link: '/wiki/' },
      { text: '分类', link: '/categories/' },
      { text: '友链', link: '/links.html' },
      // { text: '赞助', link: '/sponsor.html' },
      { text: '关于', link: '/about.html' },
      // { text: '实验室', link: 'https://labs.saltbo.cn/' },
    ],
    directories: [
      {
        id: 'post',
        dirname: 'posts',
        path: '/',
        layout: 'Posts',
        itemPermalink: '/:regular',
        frontmatter: { title: '首页' },
      },
    ],
    sidebar: 'auto',
    search: true,
    smoothScroll: true,
    dateFormat: 'YYYY-MM-DD',
    searchMaxSuggestions: 10,
    repo: 'saltbo/blog',
    repos: [
      'saltbo/rslocal',
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
