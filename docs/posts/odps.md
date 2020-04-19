---
title: "阿里云数加平台尝试之简单数据统计"
author: "saltbo"
date: 2016-08-14
tags: ["阿里云", "大数据"] 

---
> 我们的电商平台每天都会产生一些访问及销售数据，最开始的时候仅仅需要统计各店铺的数据。有一天，产品妹子说：“我们现在还需要渠道的数据，
>     你给搞一下吧。”
> <!--more-->

#####遇到的问题

我们的电商平台每天都会产生一些访问及销售数据，最开始的时候仅仅需要统计各店铺的数据。有一天，产品妹子说：“我们现在还需要渠道的数据，你给搞一下吧。”

由于以前并没有做过数据统计相关的工作，所以最开始的数据统计系统是这样设计的。

写一个脚本，每天凌晨执行一次。脚本的任务就是从业务库拉去前一天的数据，然后进行相应的计算，最后写到统计结果表中。

这次产品妹子来新需求了，我就得苦逼的再写这么一个脚本。一次无所谓，但是如果以后再来新需求呢？

作为一只聪明的猿，肯定得想办法摆脱这个坑！


####数加之初步了解
大概半年前初步了解过阿里云的数加平台。数加是阿里云依托DataIDE、ODPS、机器学习等等建立起来的一个庞大的大数据系统。如下图，这是今年8月9日阿里云全面升级 DT NEXT极致未来新品发布会后官网的变化。与原先相比，产品线更加一目了然。原先我们经常用到的ECS、RDS、OSS等都归属为云计算基础服务，新增了大数据（数加）栏目。其中就有我们今天要讲到的大数据开发套件（DataIDE）和大数据计算服务（MaxCompute），其中MaxCompute原名ODPS，所以现在很多地方还叫ODPS,这里需要稍微注意一下。
![8月9日阿里云官方升级之后](http://upload-images.jianshu.io/upload_images/1846751-79fa2ce6d4f0b0c8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

####数加之DataIDE

DataIDE即所谓的大数据开发套件。如下图：
![数加控制台首页](http://upload-images.jianshu.io/upload_images/1846751-f70352fa6c816073.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![数据开发工作台](http://upload-images.jianshu.io/upload_images/1846751-dbba215ff0f6a46a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

DataIDE的功能主要分为三部分，即ODPS_SQL、数据同步、机器学习。由于对机器学习并不了解所以并没有深入学习，我们的数据统计仅需要数据同步和ODPS_SQL即可。

数据同步就是将业务数据库中的数据同步到ODPS中。
ODPS_SQL的作用就是你可以根据你的统计需求像写普通SQL一样完成统计。

####数加之ODPS

ODPS，全称Open Data Processing Service。即开放数据处理服务，是一个海量数据处理平台。

我其实是对大数据的了解很有限，所以对这种高大上的东西很是向往，同时对它也没有一个明确的认识。那么索性我们就先简单的把它理解成一种**离线的可以提供海量数据计算的数据库**。

####如何利用DataIDE和ODPS进行简单的数据统计

上面我们初步了解了DataIDE和ODPS，下面我们来看下如何通过DataIDE和ODPS来解决产品妹子给我提的新需求。

先看下产品妹子需要的渠道数据都有哪些。
![渠道数据概况](http://upload-images.jianshu.io/upload_images/1846751-635bf5dc00e38b7e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![渠道数据历史趋势](http://upload-images.jianshu.io/upload_images/1846751-5eb2a0136fdf7932.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


嗯，从原型上来看主要需要两部分数据，即销售数据和访问数据。

再来看下我们的业务数据是什么样子的。

我们有一张订单表，销售数据可以通过订单表计算出来。
我们还有一个用户访问记录表，那么访问数据也就有了。

####DataIDE之数据同步节点

有了上面的两张表，我们需要做的工作就很简单了。

首先，我们在DataIDE的控制台新建一个任务。然后在任务面板新建一个数据同步节点。如下图中的订单表和访问记录表就是两个数据同步节点
![数据同步节点](http://upload-images.jianshu.io/upload_images/1846751-7c67e01466de14fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
双击同步节点对齐进行相应配置。
![数据同步节点配置](http://upload-images.jianshu.io/upload_images/1846751-6f34cbdf8f4835b8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
如上图。首先选择数据来源，选择源数据中的数据表，选择完毕后系统会自动拉去源数据的数据表结构显示在下方。然后选择数据流向和ODPS中的表。*需要注意的是初次使用时，需要自行创建ODPS中的表*。

最后需要设置数据过滤规则。如下图：
![数据抽取和加载控制](http://upload-images.jianshu.io/upload_images/1846751-c1e230c043b73b2c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这里需要注意的是数据过滤中的语句是普通的SQL不是ODPS_SQL。

####DataIDE之ODPS_SQL节点

因为大同小异，所以这里我们仅以销售数据的统计节点为例进行讲解。如下图：
![渠道销售数据统计节点](http://upload-images.jianshu.io/upload_images/1846751-672c9de080e93765.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到，基本语法上来说和普通SQL差别不大。我们需要统计渠道的付款订单数量和订单金额，所以我们直接COUNT(id),SUM(payment_fee)并GROUP BY spm。这都是基本的SQL用法这里就不多说了，不了解的朋友可以自行搜索学习。需要注意的是TO_DATE是ODPS_SQL内置的函数，ODPS_SQL有很多内置函数，大家可以自行查阅手册。

另外就是**${bdp.system.bizdate}**和**${bdp.system.cyctime}**是DataIDE的两个系统参数。它们分别代表**日常调度实例定时时间的前一天**和**日常调度实例定时时间**。

####最终

最终节点任务执行完成就会生成以下数据
![渠道销售数据](http://upload-images.jianshu.io/upload_images/1846751-a07903ac52899ab8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![渠道访问数据](http://upload-images.jianshu.io/upload_images/1846751-caab3c6c57df34ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

那么，结束了么？

如果你以为结束了，那么只能说明你跟我一样很天真！

还记得我们最初给ODPS的理解么？一个**离线的可以提供海量数据计算的数据库**！注意**离线**二字。由于离线，所以实际过程中是你提交一条ODPS_SQL上去，然后得等一会儿才会有结果返回来。这就是跟普通数据库的一个很重要的差别。

所以注定ODPS无法为业务系统提供查询服务。

所以，我们还需要将统计结果数据从ODPS拉去到统计中心的的普通数据库中去。那么该如何操作呢？

ODPS提供了SDK，通过SDK可以很方便的拉去ODPS中的数据，但是。。。

What？没有PHP版本的SDK？只有Java版本和Python版本的？

妈哒，说好的PHP是最好的语言呢？

还好，本猿对Python也略有涉猎(傲娇脸)

最终将结果数据汇总到RDS中。

![最终统计出来的渠道数据](http://upload-images.jianshu.io/upload_images/1846751-91ef35b6daae812b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


####结尾

搞定！有了DataIDE和ODPS，再也不怕产品妹子给我提数据统计的需求咯~

对了，有同样正在玩数加的欢迎留言交流。没有人交流全靠自己摸索太痛苦了~

***
*我是闫大伯，一只对一切不了解事物充满探索欲的野生程序猿*。