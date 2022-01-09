---
title: "构建Web版性能分析面板"
description: ""
image: ""
date: 2021-03-23T11:20:00+07:00
lastmod: 2022-01-09T03:06:00+07:00
author: "闫勃"
tags:
categories:
draft: false
---

## 方案一 — Job

分为两端：执行器和 API

- 执行器通过 Job 的方式运行，执行完即销毁；
- 在 chons 中提供相关 api 来创建 Job、从 Job-pod 运行日志中获取执行结果、销毁 Job

### 执行器

基于 kubectl-flame 中的 agent 镜像来实现 go/java/python/nodejs(需要使用 pprof 制作一个镜像）

### API 接口：

1. 创建任务
1. 删除任务
1. 获取任务结果

异步任务，去 chons-monitor 去实现

## 方案二

采用 Daemon 的方式运行，直接提供 API 接口，与方案一的区别是这里的 API 直接去执行相应的命令。

### API 接口：

1. 创建任务
1. 删除任务
1. 获取任务结果

## 表设计

- id：主键 ID
- pod-name：Pod 名称
- component_uid:
- pgrep：进程名称
- status：状态
- url：分析结果查看地址，可能是 svg 文件，也可能是一个可视化网页
- creator:
- created：创建时间
- updated：更新时间
- deleted：删除时间

弹性伸缩、HPA VPA、
