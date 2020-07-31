---
title: "基于Swoole和RabbitMQ实现的一个完整的异步任务系统"
author: "saltbo"
cover: /images/posts/rabbitmq.png
date: 2016-12-13T22:25:37+08:00
tags: ["php", "swoole", "RabbitMQ"] 
pinned: true
---

从最开始的使用redis实现的单进程消费的异步任务系统到加入swoole的多进程消费模式，现在，我们的异步任务系统终于又能迈进一步。
<!-- more -->


因为有了前面两个简单系统的经验，这回基于RabbitMQ的异步任务系统设计的的更加完善，包括多进程消费，异常重试等。

## 系统介绍 ##
![消费端架构图](https://static.saltbo.cn/images/1240-20200731234430392.png)

从图中可以看到，我们这个系统是一个基于事件的异步任务系统。就是说当一个事件产生时，生产者将事件抛给调度器，调度器负责查询事件下有哪些任务，然后将这些任务丢到相应的队列中，最后由消费者消费任务队列中的任务。

在整个系统中主要分为三大部分

1. 事件生产者（Producer），即产生消息事件的一方。
2. 任务调度器(Scheduler)，负责注册事件并调度任务。
3. 消费者(Worker)，负责消费任务队列中的任务。

## 事件生产者  ##

事件生产者很简单，在业务系统中直接调用即可，代码如下。
```php
<?php
require_once __DIR__.'/../autoload.php';
use Asynclib\Ebats\Event;
try{
    $event = new Event('order_paied');  //定义事件
    $event->setOptions(['order_id' => 'FB138020392193312']); //事件产生的参数
    $event->publish();
}catch (Exception $exc){
    echo $exc->getMessage();
}
```

## 任务调度器 ##

调度器主要做两件事，一是注册事件，另一个是调度任务。

注册事件代码如下：

```php
<?php
//注册事件
EventManager::register('order_create', 'closeOrder', 'demo', 10);//关闭未付款订单(延迟任务)
EventManager::register('order_paied', 'virtualShipping', 'demo'); //虚拟商品自动发货
```
这样就注册了两个事件，事件下各有一个任务。

具体调度部分代码很简单，就不多赘述，有兴趣的可以去看代码。

## 消费者 ##

重头戏来了，一个异步任务系统最重要的就是消费端了，现在让我们来看下Worker的流程图。

![一个完整的消费进程](https://static.saltbo.cn/images/1240-20200731234439162.png)

可以看到，在这里我们采用了两个交换器和两个队列，一个负责处理正常的任务即ntask，另一个负责处理需要延迟执行的任务即dtask。简单描述下一个任务的生命周期。

##### 正常任务
1. task产生，进入正常任务的交换器Exchange[ebats_core_ntask]
2. 交换器根据topic将任务分发到对应的队列中
3. 子进程ntask阻塞等待成功获取到task，并执行该任务
4. 执行失败，需要重试时抛出RetryException，不需要重试时抛出TaskException
5. 子进程ntask捕获到重试异常将任务抛给延迟任务的交换器Exchange[ebats_core_dtask]
6. 将任务执行信息回调给上层开发者以便保存查看

##### 延迟任务
1. 子进程dtask阻塞等待成功获取到task，并执行该任务
2. 执行失败，需要重试时抛出RetryException，不需要重试时抛出TaskException
3. 子进程dtask捕获到重试异常将任务抛给延迟任务的交换器Exchange[ebats_core_dtask]
4. 将任务执行信息回调给上层开发者以便保存查看

消费者代码如下：

```php
<?php
require_once __DIR__.'/../autoload.php';
require_once __DIR__.'/task/TaskDemoModel.php';
use Asynclib\Ebats\Worker;

//执行结果回调函数
$callback = function ($topic, $taskid, $taskname, $params, $timeuse, $message){

};
$worker = new Worker($callback);  //支持多进程消费默认为1
$worker->setQueue('demo');  //队列名和事件的topic一一对应
$worker->run();
```

## 自定义调度器 ##

一般来说这是一个基于事件的任务系统，那么能不能直接产生任务呢。答案是肯定的。

只需要创建一个自定义调度器，由您自行实现调度逻辑，最终生成一个任务即可。代码如下：

```php
<?php
require_once __DIR__.'/../autoload.php';
use Asynclib\Ebats\Task;
use Asynclib\Core\Consumer;
use Asynclib\Amq\ExchangeTypes;
use Asynclib\Exception\ExceptionInterface;

/** 
 * 本示例演示了如何创建一个自定义调度器,开发者可以根据自身需求开发自己的任务调度器
 */
try{
    $worker = new Consumer();
    $worker->setExchange('order_fanout', ExchangeTypes::TOPIC);
    $worker->setQueue('shzf_order_paied', ['*.*.WAIT_SELLER_SEND_GOODS']);
    $worker->run(function($key, $msg){
        $order_data = json_encode($msg);
        echo " [$key] $order_data \n";
        Task::create('demo', 'orderAsync', $msg);//创建任务,之后消息将作为参数由任务接管处理
    });
}catch (ExceptionInterface $exc){
    echo $exc->getMessage();
}
```
这样，当接收到消息时就会产生一个orderAsync的任务，您只需要启动一个用来消费这个Topic的Worker即可。

也许你会觉得这里直接写业务逻辑的代码就可以了，实际上也确实可以。当你可以忍受一个进程慢慢消费的时候是可以这样做的。但大多数情况下我们还是希望它能够尽快的消费掉，所以建议这里只负责创建任务，具体任务的业务逻辑由worker去执行。


## 广告 ##

https://github.com/luojilab/async-task-lib 第一次开源，未来的路还很长，请大家多多关照。


***我是闫大伯，一只刚刚走上开源之路的程序猿***


