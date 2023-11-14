---
author: saltbo
categories:
    - ServiceMesh
createat: "2022-03-29T08:46:00+07:00"
date: "2022-03-29T00:00:00+07:00"
lastupdated: "2022-03-29T12:49:00+07:00"
name: envoy config in istio
status: "Published \U0001F5A8"
tags:
    - Istio
    - Envoy
title: Istio中的Envoy配置文件
---

## Envoy配置项
- Listener
- Route
- Cluster
- Endpoint
## 流量路线图
![](/images/posts/nmg-envoy%20config%20in%20istio/prod-files-secure.s3.us-west-2.amazonaws.com_688b59ac-53c3-48f2-a1be-7f89d9657acf.png)
这里有两个端口需要特别注意，即15001端口和15006端口。这两个端口引出两个概念：OutBound和Inbound。

我们需要知道，Istio做的流量拦截不止是入口方向的流量，还包括出口方向。所以在整个链路中就分为OutBound和InBound。OutBound负责接收Iptables拦截的所有出口流量，InBound负责接收Iptables拦截的入口方向的流量。
### Listener
当我们通过`istioctl pc listener productpage-v1-6b746f74dc-msp5x`查看某一个pod的Listener时会发现有非常多的Listener。这里需要注意的是：xxx
1. VirtualOutboundListener（端口15001）
这是一种特殊的Listener，它接收的流量并不直接转给某个Route，而是将流量转发给OutBoundListener，转发的原则就是根据端口。比如拦截了9080端口，那就会转发给9080的OutBoundListener。
2. OutboundListener（集群内服务的每一个端口一个，相同端口会使用一个）
这是出口方向的Listener，由于我们并不知道应用会请求哪些服务，所以OutBoundListener需要包含所有服务。因此OutBoundListener的数量是集群内所有服务端口的并集。当某一个端口的OutBoundListener收到流量后，即把它转发给以该端口命名的OutBoundRoute
3. VirtualInboundListener（端口15006）
和VirtualOutboundListener类似，但它是入口方向的VirtualListener。它会把接收到的流量转发给以pod端口命名的Cluster。
4. InboundListener
接收来自Iptables从127.0.0.6转发来的流量，将流量转发到”inbound|80||“
（猜测，需要看下具体代码确认下）
### Route
1. OutboundRoute
以端口命名的Route，和OutBoundListener一一对应，用于处理来自OutBoundListener的流量，将流量转发到OutboundCluster
2. InboundRoute
用于处理来自InboundListener的流量，将流量转发给OutboundCluster。
3. “inbound|80||”
接收来自InboundListener的流量，将其转发到InboundCluster
### Cluster
1. InboundCluster
以Pod的端口命名的一个Cluster，接收来自VirtualInBoundListener的流量；将流量转发到127.0.0.6
2. OutboundCluster
以集群内服务FQDN命名的Cluster，接收来自OutBoundRoute的流量；将流量转发到目标服务的Endpoint
### Endpoint
可以理解为K8S中的Endpoint

## 参考文章
[https://www.zhaohuabing.com/post/2018-09-25-istio-traffic-management-impl-intro/](https://www.zhaohuabing.com/post/2018-09-25-istio-traffic-management-impl-intro/)




