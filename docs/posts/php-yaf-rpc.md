---
author: saltbo
categories: []
createat: "2022-04-15T03:08:00+07:00"
date: "2018-04-09T00:00:00+07:00"
lastupdated: "2022-04-15T10:17:00+07:00"
name: php-yaf-rpc
status: "Published \U0001F5A8"
tags: []
title: 把基于Yaf框架的接口改造成RPC服务
---

RPC（Remote Procedure Call Protocol）——远程过程调用协议，它是一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络技术的协议。RPC 协议假定某些传输协议的存在，如 TCP 或 UDP，为通信程序之间携带信息数据。在 OSI 网络通信模型中，RPC 跨越了传输层和应用层。RPC 使得开发包括网络分布式多程序在内的应用程序更加容易。
一直以来，我们都是采用 Restfull 的方式。
今天让我们来认识一种更高效的调用协议——RPC
PHP 的 RPC 框架并不少，比如鸟叔的 Yar，比如我们今天讲到的 Hprose。
鸟叔的 Yar 只支持 PHP，而 Hprose 提供了多种客户端。
![](/images/posts/php-yaf-rpc/static.saltbo.cn_1240-20200731233943992.png)
Hprose
这就为我们搭建一个跨语言的服务提供了可能。
另外一个很重要的是原因是 Hprose 不止可以搭建基于 HTTP 协议的 RPC 服务，还可以搭建基于 Socket 协议的 RPC 服务！
众所周知，HTTP 协议是应用层协议，而 HTTP 是基于 Socket 的。这就意味着更高效的 RPC 服务。
好了，废话不多说，现在我们直接来看 Hprose 官方给出的 demo。

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
何为远程过程调用协议，通过这个 demo 就可以很轻松的理解了。
简单来说，就是通过 RPC，你可以将你的一个方法发布出去对外提供服务。
而对于客户端来说，这就是一个方法，客户端可以像调用本地方法一样调用远程的方法。
是不是很酷！
那么我们该如何将 RPC 集成到 Yaf 中呢？
最理想的方式是将 RPC 服务封装成一个类，在我们的控制器里继承这个类就可以将我们的这个控制器变成一个 RPC 服务。
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

可以看到，Rpc 类就是我们的 Base 类。只不过在 init 方法中初始化了 RPC 服务。
这里有两个坑，一个是 PHP 不支持多重继承，一个是 Yaf 框架的控制器必须继承 Yaf_Controller_Abstract。
所以，这里只能采用 Trait 的方式继承 Hprose，然后在 Rpc 的构造函数中初始化 Hprose。

> 小知识：Trait  是 PHP5.4 中的新特性,是 PHP 多重继承的一种解决方案。

最后给大家来看下 Hprose 类

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

这个类里的代码其实大部分都是抄 TP 的，天下代码一大抄嘛。
哈哈哈~

## 后记

虽然实现了最初的目标，但是由于 Yaf 的特性，必须继承 Yaf\*Controller_Abstract。所以 get_class_methods 的时候会把 Yaf_Controller_Abstract 中的方法也变成 RPC 服务，这是唯一的一个缺憾。。。
\*\*\*我是闫大伯，一只求知欲旺盛的程序猿\_\*\*
