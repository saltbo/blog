---
title: "把基于Yaf框架的接口改造成RPC服务"
author: "saltbo"
cover: /images/posts/hprose.jpeg
date: 2018-04-09T00:00:57+08:00
tags: ["php", "Yaf", "RPC"] 
---

RPC（Remote Procedure Call Protocol）——远程过程调用协议，它是一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络技术的协议。RPC协议假定某些传输协议的存在，如TCP或UDP，为通信程序之间携带信息数据。在OSI网络通信模型中，RPC跨越了传输层和应用层。RPC使得开发包括网络分布式多程序在内的应用程序更加容易。
<!-- more -->

一直以来，我们都是采用Restfull的方式。

今天让我们来认识一种更高效的调用协议——RPC

PHP的RPC框架并不少，比如鸟叔的Yar，比如我们今天讲到的Hprose。

鸟叔的Yar只支持PHP，而Hprose提供了多种客户端。

![Hprose](https://static.saltbo.cn/images/1240-20200731233943992.png)

这就为我们搭建一个跨语言的服务提供了可能。

另外一个很重要的是原因是Hprose不止可以搭建基于HTTP协议的RPC服务，还可以搭建基于Socket协议的RPC服务！

众所周知，HTTP协议是应用层协议，而HTTP是基于Socket的。这就意味着更高效的RPC服务。

好了，废话不多说，现在我们直接来看Hprose官方给出的demo。

## Server
```php
<?php
    require_once('Hprose.php');

    function hello($name) {
        return 'Hello ' . $name;
    }

    $server = new HproseHttpServer();
    $server->addFunction('hello');
    $server->start();
```

## Client
```php
<?php
    require_once("Hprose.php");
    $client = new HproseHttpClient('http://127.0.0.1/server.php');
    echo $client->hello('World');
```

RPC，远程过程调用协议

何为远程过程调用协议，通过这个demo就可以很轻松的理解了。

简单来说，就是通过RPC，你可以将你的一个方法发布出去对外提供服务。

而对于客户端来说，这就是一个方法，客户端可以像调用本地方法一样调用远程的方法。

是不是很酷！

那么我们该如何将RPC集成到Yaf中呢？

最理想的方式是将RPC服务封装成一个类，在我们的控制器里继承这个类就可以将我们的这个控制器变成一个RPC服务。

那么该如何来实现呢？

直接来看代码

```php
<?php

/**
 * Created by PhpStorm.
 * User: yanbo
 * Date: 16/4/7
 * Time: 下午1:21
 */
class TestController extends Rpc
{

    public function test()
    {
        return 'This is a rpc function.';
    }
}
```

```php
<?php

/**
 * @author yanbo
 * @desc 基础控制器
 */

class Rpc extends Yaf_Controller_Abstract {

    use Trait_Hprose;

    public function init() {

        $this->initRpc();
    }
```

可以看到，Rpc类就是我们的Base类。只不过在init方法中初始化了RPC服务。

这里有两个坑，一个是PHP不支持多重继承，一个是Yaf框架的控制器必须继承Yaf_Controller_Abstract。

所以，这里只能采用Trait的方式继承Hprose，然后在Rpc的构造函数中初始化Hprose。

>小知识：Trait 是 PHP5.4 中的新特性,是 PHP 多重继承的一种解决方案。

最后给大家来看下Hprose类
```php
<?php

/**
 * Created by PhpStorm.
 * User: yanbo
 * Date: 16/4/7
 * Time: 下午1:32
 */
Trait Trait_Hprose
{
    protected $allowMethodList  =   '';
    protected $crossDomain      =   false;
    protected $P3P              =   false;
    protected $get              =   true;
    protected $debug            =   false;

    /**
     * 架构函数
     * @access public
     */
    public function initRpc() {
        //控制器初始化
        if(method_exists($this,'_initialize'))
            $this->_initialize();
        //导入类库
        Yaf_Loader::import('Rpc/Hprose.php');

        //实例化HproseHttpServer
        $server     =   new \HproseHttpServer();
        if($this->allowMethodList){
            $methods    =   $this->allowMethodList;
        }else{
            $methods    =   get_class_methods($this);
            $methods    =   array_diff($methods, array('__construct','__call','_initialize', '__destruct', 'init', 'indexAction'));
        }

        $server->addMethods($methods,$this);
        if($this->debug) {
            $server->setDebugEnabled(true);
        }
        // Hprose设置
        $server->setCrossDomainEnabled($this->crossDomain);
        $server->setP3PEnabled($this->P3P);
        $server->setGetEnabled($this->get);
        // 启动server
        $server->start();

        exit;
    }

    /**
     * 魔术方法 有不存在的操作的时候执行
     * @access public
     * @param string $method 方法名
     * @param array $args 参数
     * @return mixed
     */
    public function __call($method,$args){}
}
```

这个类里的代码其实大部分都是抄TP的，天下代码一大抄嘛。

哈哈哈~

## 后记
虽然实现了最初的目标，但是由于Yaf的特性，必须继承Yaf_Controller_Abstract。所以get_class_methods的时候会把Yaf_Controller_Abstract中的方法也变成RPC服务，这是唯一的一个缺憾。。。

***我是闫大伯，一只求知欲旺盛的程序猿***
