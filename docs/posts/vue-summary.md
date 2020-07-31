---
title: "后端开发写Vue（iView使用总结）"
author: "saltbo"
cover: /images/posts/iview.jpeg
date: 2018-04-20T00:46:52+08:00
tags: ["Vue", "iView"] 
pinned: true
---

作为一个正正经经的后端开发，虽然早年自称过全栈，但是随着前端技术发展的越来越快，技术栈越来越多，现在已经不敢自称全栈。早年搭建管理后台都是采用bootstrap，由后端渲染页面。但是有很多东西是后端渲染无法做到的。偶然发现一个组件库——[iView](https://www.iviewui.com/)，这是一个高质量的vue组件库，涵盖了你可以想象到的任何组件。但是因为之前没有vue基础，所以踩了很多坑，这里总结一下。
<!-- more -->

> 本文适用有前端基础但没有Vue基础的读者。

## 0x00如何跳转页面
由这个问题就引出了vue-router。它是一个前端路由，也就是说，通过它进行的跳转操作是并没有经过后端的。

```js
<router-link to="/foo">Go to Foo</router-link>
```

```js
this.$router.push({ path: '/user', params: { userId: 123 }})
```
上面是两种页面跳转方式，其中push的方式最常见，这里为了方便理解使用了path，在实际应用中路由表会给每个路由分配一个name，在push的时候就可以直接push name进去了。

参考文档：https://router.vuejs.org/

## 0x01如何获取参数
上面说了跳转，如果跳转的时候带了参数，那么如何获取到传递过来的参数呢？

```js
this.$route.params['id']
```
```js
this.$route.query.id
```

## 0x02如何变更数据
这里就要了解双向绑定这个东西了。何为双向绑定？

其实简单来说就是在vue中也会有model和view的概念。双向绑定就是针对他们来说，当我们用JavaScript代码更新Model时，View就会自动更新。当用户变更了View，Model的数据也自动被更新了，这种情况就是双向绑定。

举个例子就是，当用户填写表单数据的时候，表单数据变更了，这个时候model里的数据也同步变更了，这种方式就避免了早期原生js代码中那种还得通过dom结构自行去获取form表单的数据再拼接数据。

同样，在表格中，如果你要删除一行表格需要如何操作呢？在没有双向绑定之前你需要分别去删除dom结构中的dom和数据中相应的行数据。而现在，你只需要删除掉数据中的行数据，dom结构压根不需要你关心。当然这个只是例子，实际应用中一般都是重新调用接口刷新全部数据，表格dom也会全部重新刷新。


## 0x03如何在表格中渲染自定义内容
在一个表格中我们经常需要渲染一些复杂的内容，这里就需要用到reader函数。
```js
{
  columns: [
    {
        title: 'Type',
        key: 'type',
        width: 160
    },
    {
        title: '操作',
        key: 'action',
        width: 100,
        render: (h, params) => {
            return h('div', [
                h('Button', {
                    props: {
                        type: 'primary',
                        size: 'small'
                    },
                    style: {
                        marginRight: '5px'
                    },
                    on: {
                        click: () => {
                            this.show(params.index)
                        }
                    }
                }, '查看')
            ]);
        }
    }
  ]
}
```
上面的代码是一个表格的columns，这里可以看到在操作这一列中我们渲染了一个按钮，重点在h函数，他的第一个参数是标签名，最后一个参数是标签中间的Text，中间的参数是标签的属性和事件之类。需要注意的是，中间的参数是可以省略的，也就是只有两个参数。基本属性可以写在props里；css可以写在style里，注意采用驼峰写法；事件写在on里。

还有需要注意的是：h函数是可以互相嵌套的，就是通过这种嵌套组合不同的dom结构。当然这种方式其实并不友好，还有更方便的方式是jsx，通过jsx你可以直接在render函数里返回一个dom，这里就不展开讲了。

## 0x04如何格式化日期
实际开发中后端接口有时候会返回UTC时间，那么如何优雅的对其进行格式化呢。答案是moment。`npm install moment` 然后在main.js里添加如下代码即可

```js
Vue.prototype.$moment = moment;
Vue.filter('moment', function(value, formatString) {
    formatString = formatString || 'YYYY-MM-DD HH:mm:ss';
    return moment(value).format(formatString)
})

if (!String.prototype.moment) {
    String.prototype.moment = function(formatString) {
        formatString = formatString || 'YYYY-MM-DD HH:mm:ss';
        return moment(this).format(formatString)
    };
}
```
::: v-pre
在使用的时候，如果是在dom结构中，用法是`{{ data.time | moment }}`。
:::
如果是在js中，用法是`params.row.create_time.moment()`

## 0x05如何提交数据

原先vue官方推荐的网络库是vue-resource，现在已经改成axios了。一样`npm install axios`，然后再main.js中加入如下代码

```js
Vue.prototype.$http = axios;
```
这样，你就可以在任意vue文件中通过下面这种方式使用了
```js
this.$http.get('/api/stacks/').then((response) => {
    console.log(response.data)
})

this.$http.post('/api/stacks/').then((response) => {
    console.log(response.data)
}).catch((e) => {
    console.log(e)
})
```

当然，这真是基本用法，在复杂应用中，为了方便后期维护最好还是封装一下。

 参考文档：https://github.com/axios/axios

## 0x06箭头函数
通过上面的几段代码不知道你有没有发现一个东西
```js
render: (h, params) => {
},
click: () => {
   this.show(params.index)
}
```
这个其实也是一种函数的形式，一般情况下你可能更习惯用传统的function，但是你没有想过为什么很多示例中都用箭头函数？
```js
<script>
    export default {
        data () {
            return {
                stacks: []
            }
        },
        methods: {
            envList: function (groupID) {
                this.$http.get('/api/stacks/').then((response) => {
                    this.stacks = response.data
                    console.log(this.stacks)
                })
            },
        }
    }
</script>
```
就像上面的代码，如果不用箭头函数会怎样？
```js
<script>
    export default {
        data () {
            return {
                stacks: []
            }
        },
        methods: {
            envList: function (groupID) {
                this.$http.get('/api/stacks/').then(function(response) {
                    this.stacks = response.data
                    console.log(this.stacks)
                })
            },
        }
    }
</script>
```
如果你运行上面这段代码你就会发现报错了。在传统的function中this是访问不到data中return的数据的。

## 0x07如何组件化
组件化有两个好处，一是代码复用，二是解耦。
最常见的需求是把模态框组件化，这样就可以避免模态框的代码耦合在页面的代码中。
```js
<script>
    export default {
        props: {
            title: ''
        },
        data() {
            return {
                show: false,
                loading: false,
            }
        },
        methods: {
            open: function (id) {
                this.show = true;

                if (id !== undefined) {
                    group.getById(id, (body) => {
                        this.formValidate = body.data;
                    })
                }
            },
            submit: function (name) {
            },
        }
    }
</script>
```
组件的代码其实跟普通页面的代码差别不大。就是多了一个props，里面包含了这个组件的属性。比如这里定义了一个title，那么在使用的时候你就可以传一个title进来。
```js
<ModalCreation ref="modalCreation" @on-success="refreshList" title="创建服务"></ModalCreation>
```
可以看到，这个组件还提供了一个on-success的事件，那么这是怎么做到的呢？

其实也很简单，只需要在组件内执行`this.$emit('on-success', body.data.id);`即可发送一个事件出来。

那么如何优雅的调起组件呢？
```js
$refs.modalCreation.open()
```


## 0x08Vue到底是什么

官方的介绍是：**它是一套用于构建用户界面的渐进式框架。** 但是对于初学者来说还是云里雾里。这里的重点其实是构建，简单来说就是你按照vue的方式写html、css和js，然后它会帮你编译成浏览器可以运行的js文件。从本质上说，前端技术还是html、css和js这三大件，早期前端开发是直接写原生js代码，现在是用vue或者react的方式。其实跟后端常见的MVC结构类似，早期PHP也是直接写原生PHP，每个php文件里各种include、require，后来才有的各种框架，像Yaf、TP等。

## 0x09如何部署

这个问题的答案其实有很多种。它是由你的系统架构决定的。但是在将如何部署之前需要先讲一个概念——SPA(单页面应用)。

SPA即一个html，全站只有一个html，内容如下
```html
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <title>Chons</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <link rel="stylesheet" href="/dist/main.css">
</head>

<body>
    <div id="app"></div>
    <script type="text/javascript" src="/dist/vendors.js"></script>
    <script type="text/javascript" src="/dist/main.js"></script>
</body>
</html>
```

Vue编译出来的文件其实初始的html就只有上面这一点。也就是说，服务端只需要渲染这一个html文件，其他所有的事儿都交给js去处理了。

说回如何部署，实际上要做的事就是在服务端输出这个html文件和css、js。

一般来说，在前后端分离的架构中，这部分代码是属于前端的工作，那么前端工程师们通常会用node来渲染html。

而如果你是前后端自己一个人开发，你可以直接使用后端服务来输出这个html。

这里有一个坑是前后端路由问题。前端路由实际上有三种模式，具体解释如下：

```js
### mode

*   类型: `string`

*   默认值: `"hash" (浏览器环境) | "abstract" (Node.js 环境)`

*   可选值: `"hash" | "history" | "abstract"`

    配置路由模式:

    *   `hash`: 使用 URL hash 值来作路由。支持所有浏览器，包括不支持 HTML5 History Api 的浏览器。

    *   `history`: 依赖 HTML5 History API 和服务器配置。查看 [HTML5 History 模式](https://router.vuejs.org/zh-cn/essentials/history-mode.html)。

    *   `abstract`: 支持所有 JavaScript 运行环境，如 Node.js 服务器端。**如果发现没有浏览器的 API，路由会自动强制进入这个模式。**
```

hash模式实际上是采用锚的方式，也就是你见过的一些后台网站的网址是`http://www.ybc.com/#/user/home`

这种模式的路由你可以只在服务端配置根路径`/`的路由输出html就可以了，因为不论#号后面输入什么都会打到后端路由的根路径下。

但是，如果你想去掉#号呢，那就需要使用history模式，这种模式就要求服务端所有的路由全部输出那个html。


## 0x0A开发环境下如何访问静态文件

如果你是采用后端渲染的方式，那么为了统一流程，在开发环境下也是需要由后端代理前端路由。那么问题就来了，线上环境时`npm run build`打包出来的静态文件，直接挂载静态文件所在目录就行了。那在开发环境还没有打包，如何访问到正在开发的静态文件呢？这里就有一个webpack-dev-server的坑。

在开发环境下当你执行`npm run dev`的时候实际上是启动了webpack提供的一个简易web-server，即webpack-dev-server。它的作用是就是把编译好的静态文件挂载起来让你能够访问。所以你会发现你无论如何也找不到开发过程中生成的静态文件，因为它根本就没有输出出来，而是在内存中。

好在webpack-dev-server还是提供了一个方式可以让我们看到这些文件 `http://localhost:8080/webpack-dev-server` 如下图：
![image.png](https://static.saltbo.cn/images/1240-20200731233230518.png)

找到这些静态文件就好办了，既然没有生成文件，那我们只能在后端服务中代理这些静态文件
```go
func main() {
	app := neo.App()
	app.Conf.Parse("conf/local.toml")
	api.Register(app)

	indexTpl := "index.html"
	if conf.Tree.GetEnv() == ENV {
		app.Get("/static/*", func(ctx *neo.Ctx) (int, error) {
			resp, err := http.Get("http://localhost:8080" + ctx.Req.URL.String())
			if err != nil {
				log.Println(err.Error())
			}
			respBody, err := ioutil.ReadAll(resp.Body)
			ctx.Res.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
			return resp.StatusCode, ctx.Res.Raw(respBody)
		})
	} else {
		indexTpl = "index_prod.html"
		app.Serve("/static", "./assets/dist/static")
	}

	app.Templates("./assets/dist/*")
	app.Region().Get("*", func(ctx *neo.Ctx) (int, error) {
		return 200, ctx.Res.Tpl(indexTpl, nil)
	})

	app.Start()
}
```

## 0x0B结语
前端的技术栈实在是太零散了，几乎每走一步都是坑。越来越佩服前端大牛们了~


***我是闫大伯，一直在踩坑，踩完后端踩前端***
