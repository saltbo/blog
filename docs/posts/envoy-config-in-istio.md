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

## Envoy 配置项

- Listener
- Route
- Cluster
- Endpoint

## 流量路线图

![](/images/notes/envoy%20config%20in%20istio/s3.us-west-2.amazonaws.com_688b59ac-53c3-48f2-a1be-7f89d9657acf.png)
这里有两个端口需要特别注意，即 15001 端口和 15006 端口。这两个端口引出两个概念：OutBound 和 Inbound。

我们需要知道，Istio 做的流量拦截不止是入口方向的流量，还包括出口方向。所以在整个链路中就分为 OutBound 和 InBound。OutBound 负责接收 Iptables 拦截的所有出口流量，InBound 负责接收 Iptables 拦截的入口方向的流量。

### Listener

当我们通过`istioctl pc listener productpage-v1-6b746f74dc-msp5x`查看某一个 pod 的 Listener 时会发现有非常多的 Listener。这里需要注意的是：xxx

1. VirtualOutboundListener（端口 15001）
   这是一种特殊的 Listener，它接收的流量并不直接转给某个 Route，而是将流量转发给 OutBoundListener，转发的原则就是根据端口。比如拦截了 9080 端口，那就会转发给 9080 的 OutBoundListener。
2. OutboundListener（集群内服务的每一个端口一个，相同端口会使用一个）
   这是出口方向的 Listener，由于我们并不知道应用会请求哪些服务，所以 OutBoundListener 需要包含所有服务。因此 OutBoundListener 的数量是集群内所有服务端口的并集。当某一个端口的 OutBoundListener 收到流量后，即把它转发给以该端口命名的 OutBoundRoute
3. VirtualInboundListener（端口 15006）
   和 VirtualOutboundListener 类似，但它是入口方向的 VirtualListener。它会把接收到的流量转发给以 pod 端口命名的 Cluster。
4. InboundListener
   接收来自 Iptables 从 127.0.0.6 转发来的流量，将流量转发到”inbound|80||“
   （猜测，需要看下具体代码确认下）

### Route

1. OutboundRoute
   以端口命名的 Route，和 OutBoundListener 一一对应，用于处理来自 OutBoundListener 的流量，将流量转发到 OutboundCluster
2. InboundRoute
   用于处理来自 InboundListener 的流量，将流量转发给 OutboundCluster。
3. “inbound|80||”
   接收来自 InboundListener 的流量，将其转发到 InboundCluster

### Cluster

1. InboundCluster
   以 Pod 的端口命名的一个 Cluster，接收来自 VirtualInBoundListener 的流量；将流量转发到 127.0.0.6
2. OutboundCluster
   以集群内服务 FQDN 命名的 Cluster，接收来自 OutBoundRoute 的流量；将流量转发到目标服务的 Endpoint

### Endpoint

可以理解为 K8S 中的 Endpoint

## 参考文章

[https://www.zhaohuabing.com/post/2018-09-25-istio-traffic-management-impl-intro/](https://www.zhaohuabing.com/post/2018-09-25-istio-traffic-management-impl-intro/)
