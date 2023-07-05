---
author: saltbo
categories:
    - SmartHome
createat: "2022-04-10T13:23:00+07:00"
date: "2022-04-10T00:00:00+07:00"
lastupdated: "2022-04-10T15:13:00+07:00"
name: desktop lighting automation by the API of home-assistant
status: "Published \U0001F5A8"
tags:
    - HomeAssistant
    - sleepwatcher
title: 基于HomeAssistant的API实现桌面灯光自动化
---

## 需求
每次坐到电脑前面都需要手动开灯，尝试过米家无线开关的按键开关灯和绿米魔方的摇一摇开关灯。前段时间又在B站看到陈抱一基于动静贴搞得敲一敲桌子开灯，我试了一段时间，敲的我手疼。。。

## 灵感
今天坐在桌边突然想到，我的智能设备都接了HomeAssistant，是不是有API可以让我调一下呢？因为我之前在公司的电脑上基于sleepwatcher和Bark实现了一个”电脑睡眠自动发送一条消息：下班了？别忘记打卡！！“的功能。然后sleepwatcher也能监听电脑的唤醒动作，当时我就在想有啥需求是需要唤醒的时候自动触发的呢？在公司暂时没有，在家里这不有了么。

## HomeAssistant文档
在官方文档上果然找到了能力的支持，接下来就简单啦~
![](/images/posts/nmg-desktop%20lighting%20automation%20by%20the%20API%20of%20home-assistant/s3.us-west-2.amazonaws.com_75e7a9a0-a363-4cb0-b76d-f2a3e503e07f.png)
[https://developers.home-assistant.io/docs/api/rest/](https://developers.home-assistant.io/docs/api/rest/)
## 实现
开关脚本
```bash
#!/bin/bash

# https://developers.home-assistant.io/docs/api/rest/

entity_id=$1
domain=${entity_id%.*}
service=$2

source ~/.env
export no_proxy=local
curl "http://ha.local/api/services/${domain}/${service}" \
  -H "Authorization: Bearer ${HA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "'"${entity_id}"'"}' > /dev/null 2>&1
```
.wakeup
```bash
#!/bin/bash

export PATH=$PATH:~/.local/bin
ha-service-do light.dn2grp_cloud_574208 turn_on
```
.sleep
```bash
#!/bin/bash

export PATH=$PATH:~/.local/bin
ha-service-do light.dn2grp_cloud_574208 turn_off
```

## 面向新手的提示
- 因为我的脚本都公开存放在Github，所以我在家目录的.env文件存储了HA_TOKEN
- HA_TOKEN可以在Profile创建，如果不知道在哪里可以点这里跳转[https://my.home-assistant.io/redirect/profile/](https://my.home-assistant.io/redirect/profile/)
- 可以通过调用http://ha.local/api/services查到支持哪些service
- ha.local是我自己本地的域名

## 疑问
是否还有另外一个方案：将自己的电脑以某种方式接入到HomeAssistant中，然后直接在HA里面设置自动化。这样就不用依赖sleepwatcher了。
