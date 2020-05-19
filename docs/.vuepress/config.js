// .vuepress/config.js
module.exports = {
  lang: 'zh-CN',
  title: "Boblab", 
  description: 'A laboratory of saltbo',
  dest: 'public',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }],
    ['script', { type: 'text/javascript' }, `
      var targetProtocol = "https:";
      if (window.location.hostname != 'localhost' && window.location.protocol != targetProtocol)
        window.location.href = targetProtocol + window.location.href.substring(window.location.protocol.length);`]
  ],
  markdown: {
    lineNumbers: true
  },
  // theme: '@vuepress/theme-blog',
  themeConfig: {
    nav: [
      { text: '主页', link: '/'},
      { text: '专栏', link: '/books/'},
      { text: '文章', link: '/posts/'},
      { text: '标签', link: '/tags/' },
      { text: '关于', link: '/about' },
    ],
    sidebar: {
      '/books/': getBooks(),
    },
    search: true,
    smoothScroll: true,
    dateFormat: 'YYYY-MM-DD',
    searchMaxSuggestions: 10,
    repo: 'saltbo/blog',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: '发现错误了？去修改!',
    lastUpdated: '最近更新', // string | boolean
    disqusjs: {
      shortname: 'saltbo',
      api: 'https://disqus.skk.moe/disqus/',
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

function getBooks(){
  return [
    {
      title: 'DevHowTo',
      collapsable: false, 
      sidebarDepth: 2,
      children: [
        '',
        'go',
        'rust',
        'python',
      ]
    }
  ]
}