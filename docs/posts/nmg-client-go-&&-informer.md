---
author: saltbo
categories:
    - Kubernetes
createat: "2022-02-10T10:44:00+07:00"
date: "2022-02-10T00:00:00+07:00"
lastupdated: "2022-03-29T08:52:00+07:00"
name: client-go && informer
status: "Published \U0001F5A8"
tags:
    - client-go
    - informer
title: K8S的client-go与informer机制
---

# 一、介绍
client-go是一个包含KubernetesAPI的SDK，它在整个k8s源码中发挥着不可或缺的作用。
# 二、KubernetesAPIs
## 2.1 规范
**2.1.1 RESTful**
REST，即Representational State Transfer的缩写。这个词组可以翻译为"表现层状态转化"。
1. 每一个URI代表一种资源；
2. 客户端和服务器之间，传递这种资源的某种表现层；
3. 客户端通过五个HTTP动词，对服务器端资源进行操作，实现"表现层状态转化"。
提问：注册登录场景的相关API如何用RESTful的方式设计？
**2.1.2 GVK(R)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin
  namespace: default
spec:
  replicas: 1
....
```
- apiVersion ≈ apiGroupVersion = Group/Version
- GVK = Group Version Kind
- GVR = Group Version Resources
提问：Resource和Kind有什么区别？
> 答：Resource是一个对象，Kind是一个对象的类型名称

提问：一个标准的K8S资源的API长什么样？
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_59f9c088-3594-4dc7-ba6f-9e0737d6bb22.png)
## 2.2 实战调用
**2.2.1 跳过鉴权**
因为本次分享的API只是个引子，我们就不讲鉴权了。kubectl有个proxy的子命令可以实现在本地搭建一个具备kubectl同等权限的代理。这里我们通过这种方式跳过鉴权。
`kubectl proxy --port=6443`
**2.2.2 几个例子**
- 获取当前版本信息
    - http://localhost:6443/version
- 获取APIServer支持的所有APIGroup
    - http://localhost:6443/apis
- 获取全部命名空间的Deployment列表
    - http://localhost:6443/apis/apps/v1/deployments
- 获取命名空间default下的Deployment列表
    - http://localhost:6443/apis/apps/v1/namespaces/default/deployments
- 获取命名空间default下的一个Deployment对象
    - http://localhost:6443/apis/apps/v1/namespaces/default/deployments/httpbin
- 获取Pod列表
    - http://localhost:6443/api/v1/namespaces/default/pods
提问：获取rollout列表的接口是什么样
http://localhost:6443/apis/argoproj.io/v1alpha1/rollouts
# 三、client-go源码
## 3.1 实战调用
> https://github.com/kubernetes/client-go/tree/master/examples

```go
# clientset
clientset.AppsV1().Deployments(apiv1.NamespaceDefault).Create(context.TODO(), deployment, metav1.CreateOptions{})
```
```go
# dynamic
deploymentRes := schema.GroupVersionResource{*Group*: "apps", *Version*: "v1", *Resource*: "deployments"}
dynamicClient.Resource(deploymentRes).Namespace(namespace).Create(context.TODO(), deployment, metav1.CreateOptions{})
```
```go
# restclient
c.client.Post().
   Namespace(c.ns).
   Resource("deployments").
   VersionedParams(&opts, scheme.*ParameterCodec*).
   Body(deployment).
   Do(ctx).
   Into(result)
```
## 3.2 Package介绍
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_94352c55-903a-45d4-a55b-c4ea1f47eb21.png)
**client-go源码目录结构**
- discovery：用于发现APIs的相关资源
- kubernetes(clientset)：基于rest封装的包含所有k8s内置资源的client集合
- informers：基于clientset实现了一个资源缓存池，封装了所有资源的list和get操作
- dynamic：基于rest实现了一个动态的client，支持所有类型的资源进行操作
- dynamic/dynamicinformer：为dynamic实现的informer
- tools/cache：informer的底层实现
- tools/watch：informer的watch实现，使用它可以watch到informer的资源变化
- transport：用作初始化一个http连接，AA也是在这里完成的
## 3.3 核心Package走读
3.3.1 kubernetes(clientset)
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_e00f4b01-ef65-4ec6-82f8-8cff8b85e06f.png)
3.3.2 dynamic
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_f911cd99-c8cc-4e6c-adeb-5beb00b31e5d.png)
3.3.3 transport
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_0b02563e-8df4-4e9e-9c2d-67edf9f6099e.png)
## 3.4 Informer
informer实际上是为controller服务的，所以这里我们先了解下k8s的controller的设计理念。
**3.4.1 控制循环**
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_267d8461-b62d-40b5-986a-8477029836c7.png)
控制论图解
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_bf1e5346-e0fe-4e49-89af-6a1d08051474.png)
Kubernetes中的控制循环

通常，控制环路如下所示：
1. 阅读资源的状态
2. 更改群集或群集外部世界中对象的状态
3. 通过etcd中的API服务器更新步骤1中的资源状态
4. 重复循环；返回步骤1。

提问：在控制循环中要求近乎实时的获取资源状态，如何实现？
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_622f66f6-46b8-4467-8c70-98ac34440441.png)
边沿触发与电平触发

提问：事件驱动如何保证不丢数据？
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_febf6daf-2d7e-4468-b2d7-b71d4e67d06a.png)
这张图里展示了三种策略:
1. edge-driven-only，错过了第二状态改变
2. edge-triggered，不依赖事件的数据而是自行获取数据
3. edge-triggered with resync，在上一个策略的基础上增加resync

**3.4.2 ListWatch**
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_c94f5927-75c5-46d0-87dd-6380f5e7d1de.png)
list-watch，顾名思义由list和watch组成。list调用资源的list API获取所有资源，watch调用资源的watch API监听资源变更事件。
提问：如何实现watch？
- 方案1：短轮训
- 方案2：长轮训
- 方案3：chunked
普通HTTP响应体
```plain text
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 25
Mozilla Developer Network         ——> body 数据内容，大小为25字节
```
chunked的HTTP响应体
```plain text
HTTP/1.1 206 OK
Content-Type: text/plain
Transfer-Encoding: chunked
7                            ——> 第一个chunk块，大小为7字节
Mozilla                      ——> 第一个chunk块内容
9                            ——> 第二个chunk块，大小为9字节
Developer                    ——> 第二个chunk块内容
7                            ——> 第三个chunk块，大小为7字节
Network                      ——> 第三个chunk块内容
0                            ——> 标记性终止块，大小为0字节
```
普通HTTP请求响应处理
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_bdfd75af-17d5-447e-8cfb-9543a843759a.png)
chunked的HTTP请求处理
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_da426cd8-5664-4afc-b28f-5a2506edf75b.png)
informer中的chunk
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_a08d5ac4-0c06-4a13-9830-93afb745a31c.png)
抓包观察watch机制
**3.4.3 核心代码走读**
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_9b57d3a9-4fba-4494-92b7-efbda35f69e3.png)
Informer组件：
- Controller
- Reflector：通过Kubernetes Watch API监听resource下的所有事件
- Lister：用来被调用List/Get方法
- Processor：记录并触发回调函数
- DeltaFIFO
- LocalStore
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_0bf58d4b-5199-42ea-9bf1-0ea4add15c21.png)
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_655b74d3-fd3c-4390-a120-9e8c224b6be6.png)
# 四、实现一个简单的Controller
![](/images/posts/nmg-client-go%20&&%20informer/prod-files-secure.s3.us-west-2.amazonaws.com_c8ba7cb2-245b-4717-a165-3392a84ad35e.png)
# 参考文档
- https://github.com/kubernetes/client-go
- https://qiankunli.github.io/2020/07/20/client_go.html
- [client-go的使用及源码分析 · Kubernetes 学习笔记](https://www.huweihuang.com/kubernetes-notes/develop/client-go.html)
- [edge and level triggered interrupts - L](http://liujunming.top/2020/03/14/edge-and-level-triggered-interrupts/)
- https://zh.wikipedia.org/wiki/%E6%8E%A7%E5%88%B6%E8%AE%BA
- [深入理解k8s中的list-watch机制](http://yost.top/2019/08/01/inside-list-watch-in-k8s/)
- [HTTP 协议中的 Transfer-Encoding | JerryQu 的小站](https://imququ.com/post/transfer-encoding-header-in-http.html)
