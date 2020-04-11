// .vuepress/config.js
module.exports = {
  title: "Saltbo's Blog", 
  description: 'A Blog of saltbo',
  dest: 'public',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }],
    ['script', { type: 'text/javascript' }, `
      var targetProtocol = "https:";
      if (window.location.host != localhost && window.location.protocol != targetProtocol)
        window.location.href = targetProtocol + window.location.href.substring(window.location.protocol.length);`]
  ],
  // theme: '@vuepress/theme-blog',
  themeConfig: {
    nav: [
      {
        text: '主页',
        link: '/',
      },
      {
        text: '文章',
        link: '/posts/',
      },
      {
        text: '标签',
        link: '/tags/',
      },
      {
        text: '关于',
        link: '/about',
      },
    ],
    smoothScroll: true,
    search: true,
    searchMaxSuggestions: 10,
    comment:{
      service: "disqus",
      shortname: "saltbo",
    },
    footer: {
      copyright: "© 2020 - Saltbo's Blog",
      icp: '冀ICP备13004362号-5',
      siteStartAt: '2019/03/21 22:03:04'
    },
  }
}
