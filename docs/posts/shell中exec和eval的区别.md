---
title: "Shell中exec和eval的区别"
description: ""
image: ""
date: 2021-06-09T08:56:00+07:00
lastmod: 2022-01-10T08:54:00+07:00
author: "闫勃"
tags:
  - "Shell"
categories:
draft: false
---

默认情况下，如果直接执行 bash -c command，command 会以子进程方式运行，执行完成后返回父进程继续执行。

## exec

使用 exec bash -c command，父进程的 pid 会转移给 command，这时实际上父级 shell 已经退出，所以无法执行 exec 后面的脚本。

## eval

假设 command 中包含 export 之类的命令，如果采用 bash -c 的方式，export 的变量是无法在父级 shell 中获取到的。这时采用 eval 就可以了。和 exec 相同的是：进程 pid 没有变。但它没有替换老的 shell，而是在老的 shell 里执行新的命令。

## bash -l

login: 加载 bashrc 和 profile 等文件
