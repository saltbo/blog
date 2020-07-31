---
title: "基于Swoole和Redis实现的并发队列处理系统"
author: "saltbo"
cover: /images/posts/swoole.png
date: 2016-04-24T22:57:46+08:00
tags: ["php", "swoole", "redis"] 
pinned: true
---

由于PHP不支持多线程，但是作为一个完善的系统，有很多操作都是需要异步完成的。为了完成这些异步操作，我们做了一个基于Redis队列任务系统
<!-- more -->

## 背景

由于PHP不支持多线程，但是作为一个完善的系统，有很多操作都是需要异步完成的。为了完成这些异步操作，我们做了一个基于Redis队列任务系统。

大家知道，一个消息队列处理系统主要分为两大部分：消费者和生产者。

在我们的系统中，主系统作为生产者，任务系统作为消费者。

具体的工作流程如下：
1. 主系统将需要需要处理的任务名称+任务参数push到队列中。
2. 任务系统实时的对任务队列进行pop，pop出来一个任务就fork一个子进程，由子进程完成具体的任务逻辑。

具体代码如下：
```php
<?
/**
 * 启动守护进程
 */
public function runAction() {
    Tools::log_message('ERROR', 'daemon/run' . ' | action: restart', 'daemon-');
    while (true) {
        $this->fork_process();
    }
    exit;
}

/**
 * 创建子进程
 */
private function fork_process() {
    $ppid = getmypid();
    $pid = pcntl_fork();
    if ($pid == 0) {//子进程
        $pid = posix_getpid();
        //echo "* Process {$pid} was created \n\n";
        $this->mq_process();
        exit;
    } else {//主进程
        $pid = pcntl_wait($status, WUNTRACED); //取得子进程结束状态
        if (pcntl_wifexited($status)) {
            //echo "\n\n* Sub process: {$pid} exited with {$status}";
            //Tools::log_message('INFO', 'daemon/run succ' . '|status:' . $status . '|pid:' . $ppid . '|childpid:' . $pid );
        } else {
            Tools::log_message('ERROR', 'daemon/run fail' . '|status:' . $status . '|pid:' . $ppid . '|childpid:' . $pid, 'daemon-');
        }
    }
}

/**
 * 业务任务队列处理
 */
private function mq_process() {
    $data_pop = $this->masterRedis->rPop($this->redis_list_key);
    $data = json_decode($data_pop, 1);
    if (!$data) {
        return FALSE;
    }
    $worker = '_task_' . $data['worker'];
    $class_name = isset($data['class']) ? $data['class'] : 'TaskproModel';
    $params = $data['params'];
    $class = new $class_name();
    $class->$worker($params);
    return TRUE;
}
```

这是一个简单的任务处理系统。

通过这个任务系统帮助我们实现了异步，到目前为止已经稳定运行了将近一年。

但很可惜，它是一个单进程的系统。它是一直在不断的fork，如果有任务就处理，没有任务就跳过。

这样很稳定。

但问题有两个：一是不断地fork、pop会浪费服务器资源，二是不支持并发！

第一个问题还好，但第二个问题就很严重。

当主系统 **同时** 抛过来大量的任务时，任务的处理时间就会无限的拉长。

## 新的设计

为了解决并发的问题，我们计划做一个更加高效强壮的队里处理系统。

因为在PHP7之前不支持多线程，所以我们采用多进程。

从网上找了不少资料，大多所谓的多进程都是N个进程同时在后台运行。

显然这是不合适的。

我的预想是：**每pop出一个任务就fork一个任务，任务执行完成后子进程结束。**

## 遇到的问题

### 如何控制最大进程数

这个问题很简单，那就是每fork一个子进程就自增一次。而当子进程执行完成就自减一次。

自增没有问题，我们就在主进程中操作就完了。那么该如何自减呢？

可能你会说，当然是在子进程中啊。但这里你需要注意：当fork的时候是从主进程复制了一份资源给子进程，这就意味着你无法在子进程中操作主进程中的计数器！

所以，这里就需要了解一个知识点：信号。

具体的可以自行Google，这里直接看代码。

```php
<?
// install signal handler for dead kids
pcntl_signal(SIGCHLD, array($this, "sig_handler"));
```
这就安装了一个信号处理器。当然还缺少一点。
```php
<?
declare(ticks = 1);
```
declare是一个控制结构语句，具体的用法也请去Google。

这句代码的意思就是每执行一条低级语句就调用一次信号处理器。

这样，每当子进程结束的时候就会调用信号处理器，我们就可以在信号处理器中进行自减。


### 如何解决进程残留

在多进程开发中，如果处理不当就会导致进程残留。

为了解决进程残留，必须得将子进程回收。

那么如何对子进程进行回收就是一个技术点了。

在pcntl的demo中，包括很多博文中都是说在主进程中回收子进程。

但我们是基于Redis的brpop的，而brpop是阻塞的。

这就导致一个问题：当执行N个任务之后，任务系统空闲的时候主进程是阻塞的，而在发生阻塞的时候子进程还在执行，所以就无法完成最后几个子进程的进程回收。。。

这里本来一直很纠结，但当我将信号处理器搞定之后就也很简单了。

进程回收也放到信号处理器中去。


## 新系统的评估

pcntl是一个进程处理的扩展，但很可惜它对多进程的支持非常乏力。

所以这里采用Swoole扩展中的Process。

具体代码如下：

```php
<?
declare(ticks = 1);
class JobDaemonController extends Yaf_Controller_Abstract{

    use Trait_Redis;

    private $maxProcesses = 800;
    private $child;
    private $masterRedis;
    private $redis_task_wing = 'task:wing'; //待处理队列

    public function init(){
        // install signal handler for dead kids
        pcntl_signal(SIGCHLD, array($this, "sig_handler"));
        set_time_limit(0);
        ini_set('default_socket_timeout', -1); //队列处理不超时,解决redis报错:read error on connection
    }

    private function redis_client(){
        $rds = new Redis();
        $rds->connect('redis.master.host',6379);
        return $rds;
    }

    public function process(swoole_process $worker){// 第一个处理
        $GLOBALS['worker'] = $worker;
        swoole_event_add($worker->pipe, function($pipe) {
            $worker = $GLOBALS['worker'];
            $recv = $worker->read();            //send data to master

            sleep(rand(1, 3));
            echo "From Master: $recv\n";
            $worker->exit(0);
        });
        exit;
    }

    public function testAction(){
        for ($i = 0; $i < 10000; $i++){
            $data = [
                'abc' => $i,
                'timestamp' => time().rand(100,999)
            ];
            $this->masterRedis->lpush($this->redis_task_wing, json_encode($data));
        }
        exit;
    }

    public function runAction(){
        while (1){
//            echo "\t now we de have $this->child child processes\n";
            if ($this->child < $this->maxProcesses){
                $rds = $this->redis_client();
                $data_pop = $rds->brpop($this->redis_task_wing, 3);//无任务时,阻塞等待
                if (!$data_pop){
                    continue;
                }
                echo "\t Starting new child | now we de have $this->child child processes\n";
                $this->child++;
                $process = new swoole_process([$this, 'process']);
                $process->write(json_encode($data_pop));
                $pid = $process->start();
            }
        }
    }

    private function sig_handler($signo) {
//        echo "Recive: $signo \r\n";
        switch ($signo) {
            case SIGCHLD:
                while($ret = swoole_process::wait(false)) {
//                    echo "PID={$ret['pid']}\n";
                    $this->child--;
                }
        }
    }
}
```

最终，经过测试，单核1G的服务器执行1到3秒的任务可以做到800的并发。

ps:欢迎各位大神与我交流，不知能否做到更好~

***我是闫大伯，一只奋战了两个周末的野生程序猿***
