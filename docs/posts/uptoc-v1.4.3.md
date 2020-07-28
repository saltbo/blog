---
title: "Uptoc v1.4.3 版本发布，支持 Typora，支持配置上传目录。"
author: "saltbo"
cover: /images/posts/uptoc.jpeg
date: 2020-06-29T01:10:41+08:00
pinned: true
---

经过一个端午节的迭代，v1.4.3版本终于发布了。欢迎试用~
<!-- more -->

## 配置持久化

从v1.4.3开始我们支持将配置持久化的存储到本机了，效果如下

[![asciicast](https://asciinema.org/a/343794.svg)](https://asciinema.org/a/343794)

## 支持Typora

![image-20200628214441740](https://static.saltbo.cn/images/image-20200628214441740.png)

## 支持发布静态资源

```yaml
name: build
on:
  push:
    branches:
      - master
  pull_request:

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Build
        run: yarn && yarn build
      - name: Publish
        uses: saltbo/uptoc@v1.4.3
        with:
          driver: oss
          region: cn-zhangjiakou
          bucket: saltbo-static
          saveroot: tampermonkey
          dist: dist
        env:
          UPTOC_UPLOADER_AK: ${{ secrets.UPTOC_UPLOADER_KEYID }}
          UPTOC_UPLOADER_SK: ${{ secrets.UPTOC_UPLOADER_KEYSECRET }}

```



## 更多配置
详见 [中文文档](/uptoc)