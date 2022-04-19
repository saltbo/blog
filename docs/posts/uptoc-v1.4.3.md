---
author: saltbo
categories:
  - 开源项目
createat: "2022-04-15T03:08:00+07:00"
date: "2020-06-29T00:00:00+07:00"
lastupdated: "2022-04-19T06:58:00+07:00"
name: uptoc-v1.4.3
status: "Published \U0001F5A8"
tags: []
title: Uptoc v1.4.3 版本发布，支持 Typora，支持配置上传目录。
---

经过一个端午节的迭代，v1.4.3 版本终于发布了。欢迎试用~

## 配置持久化

从 v1.4.3 开始我们支持将配置持久化的存储到本机了，效果如下
![](/images/posts/uptoc-v1.4.3/asciinema.org_343794.svg

## 支持 Typora

![](/images/posts/uptoc-v1.4.3/static.saltbo.cn_image-20200628214441740.png
image-20200628214441740

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
