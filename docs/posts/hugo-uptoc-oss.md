---
title: "Uptoc - 将你的Hugo静态博客部署到阿里云OSS上"
author: "saltbo"
cover: /images/posts/uptoc.jpeg
date: 2019-10-27T12:20:43+08:00
tags: ["hugo", "阿里云", "OSS"] 
---

使用Hugo有一段时间了，和大家一样最开始是是部署在GithubPages上，后来觉得GithubPages在国内访问太慢了。搜寻一圈发现了Netlify，用了一段时间，但是速度还不是很满意。那么有没有办法将我们的博客部署到国内的云存储上呢？
<!-- more -->

### 1 起源

答案是肯定的，比如最近被封的GiteePages。但问题也很明显，它们只开放二级域名（这次的事儿之后二级域名估计也不开放了），自定义域名得用付费版。

国内有很多云储存，比如阿里云的OSS，七牛，又拍云等。

那么为什么不把我们的静态博客部署在这上面呢？

### 2 实践

经过我的实践，实际上我们只缺少一个部署到云储存的cli工具而已。

由此，Uptoc诞生了。https://github.com/saltbo/uptoc

uptoc，即upload to the cloud。它是一个用于将文件部署到云存储的命令行工具。

#### 2.1 Uptoc安装

```sh
curl -sSf http://uptoc.saltbo.cn/install.sh | sh
```

#### 2.2 Uptoc使用

```sh
uptoc --endpoint oss-cn-beijing.aliyuncs.com \
--access_key LTAI4FxxxxxxxBXmS3 \
--access_secret Vt1FZgxxxxxxxxxxxxKp380AI \
--bucket demo-bucket \
/opt/blog/public
```

只需要简单的参数就可以将目标文件自动同步到云端。当然为了安全考虑，access_key和access_secret支持系统变量，这样我们就可以通过Travis等集成工具的后台来配置它们。

![image-20191027142908681](https://static.saltbo.cn/images/image-20191027124716113.png)

现在只需要在你的.travis.yml中增加如下配置就完成了

```bash
after_success:
  - curl -sSf http://uptoc.saltbo.cn/install.sh | sh
  - uptoc --endpoint oss -cn-zhangjiakou.aliyuncs.com --bucket saltbo-blog public
```

完整配置详见https://github.com/saltbo/blog/blob/master/.travis.yml

### 3 阿里云OSS配置

![image-20191027135934555](https://static.saltbo.cn/images/image-20191027135934555.png)

创建好bucket，在bucket的基础设置里需要进行这两项配置。



### 4 hugo配置调整

```
uglyURLs = true
```

想要部署在oss上，hugo的uglyURLs选项必须打开。