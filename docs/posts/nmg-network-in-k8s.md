---
author: saltbo
categories:
    - Kubernetes
createat: "2021-11-22T06:46:00+07:00"
date: "2022-05-26T00:00:00+07:00"
lastupdated: "2022-10-19T15:29:00+07:00"
name: network in k8s
status: "Published \U0001F5A8"
tags: []
title: 在K8S中一个网络请求是如何到达应用的
---

# 一、介绍
网络是Kubernetes中比较复杂的一部分，本文希望通过一种实战的角度从宏观到微观的向读者展示一个网络请求是如何到达应用内部的。这里面又分为以下两种情况：
1. 集群外部的一个请求如何到达应用？
2. 集群内部的一个请求如何到达应用？
# 二、典型应用的网络请求链路
## 2.1 集群外部流量如何到达一个应用
![](/images/posts/nmg-network%20in%20k8s/s3.us-west-2.amazonaws.com_74256f48-d6e6-4515-9fa1-02c0f7693b43.png)
**2.1.1 通过NodePort类型的Service访问**
从根源上讲，这种方式是唯一的集群外部访问方式。
```bash
kubectl create deployment --image saltbo/hello-world hwa
kubectl expose deployment hwa --type NodePort --port 8000 --name hwa-np
```
**2.1.2 通过LoadBalancer类型的Service访问**
这种方式本质上还是使用的NodePort，只不过这种类型的Service是配合云厂商的`cloud-controller-manager`将NodePort挂载到云厂商的LB上面。
```bash
kubectl expose deployment hwa --type LoadBalancer --port 8000 --name hwa-lb
```
**2.1.3 通过Ingress访问**
这种方式实际上是通过一个反向代理转发了请求。而Ingress本身还是通过LB进行访问。
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hwa-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: "hwa.example.com"
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: hwa
            port:
              number: 8000
```
**2.1.4 是否还有别的方式进行访问**
1. hostNetwork
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  hostNetwork: true
  containers:
  - name: nginx
    image: nginx:1.14.2
    ports:
    - containerPort: 8000
```
1. hostPort
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.14.2
    ports:
    - containerPort: 80
      hostPort: 8000
```
## 2.2 集群内部流量如何到达一个应用
**2.2.1 通过Service访问**

![](/images/posts/nmg-network%20in%20k8s/s3.us-west-2.amazonaws.com_b9465a2a-d7af-410c-bc10-d00790ca9f78.png)
在 Kubernetes 集群中，每个 Node 运行一个 `kube-proxy` 进程。 `kube-proxy` 负责为 Service 实现了一种 VIP（虚拟 IP）的形式。
![](/images/posts/nmg-network%20in%20k8s/li.feishu.cn_)
当client访问clusterIP时，根据kube-proxy配置好的转发规则，请求会被转发到目标Pod上。
查看所有基于ipvs的ClusterIP
```bash
ip ad | grep ipvs
```
查看基于ipvs的ClusterIP到PodIP的转发规则
```bash
ipvsadm -Ln
```
**2.2.2 通过服务发现直接进行Pod间访问**
回顾下docker的网络的网络模式
| bridge模式 | （默认为该模式）此模式会为每一个容器分配、设置IP等，并将容器连接到一个docker0虚拟网桥，通过docker0网桥以及Iptables nat表配置与宿主机通信。 |
| :-----: | :-----: |
| host模式 | 容器和宿主机共享Network namespace。 |
| container模式 | 容器和另外一个容器共享Network namespace。 kubernetes中的pod就是多个容器共享一个Network namespace。 |
| none模式 | 该模式关闭了容器的网络功能。 |
![](/images/posts/nmg-network%20in%20k8s/li.feishu.cn_)
::: tip 💡
网络基础知识复习
:::
1. 相同网段的ip可以互相访问
2. 不同网段的ip如果想要互相访问，需要配置路由表
::: tip 👉
同一个节点上Pod间通信
:::
![](/images/posts/nmg-network%20in%20k8s/li.feishu.cn_)
在同一个节点上，实际上是在一个子网内部，所以在架构上看他们本身就是互通的。有点像家里的不同设备接到了同一个路由器上。
::: tip 👉
不同节点上的Pod间通信
:::
![](/images/posts/nmg-network%20in%20k8s/li.feishu.cn_)
不同节点时相当于是两个子网需要通信，所以需要在路由表上增加一条路由将两个子网进行关联。
![](/images/posts/nmg-network%20in%20k8s/li.feishu.cn_)
> **CNI，它的全称是 Container Network Interface，即容器网络的 ****API**** 接口**。kubernetes 网络的发展方向是希望通过插件的方式来集成不同的网络方案， CNI 就是这一努力的结果。CNI 只专注解决容器网络连接和容器销毁时的资源释放，提供一套框架，所以 CNI 可以支持大量不同的网络模式，并且容易实现。平时比较常用的 CNI 实现有 Flannel、Calico、Weave 等。CNI定义如下：

```go
type CNI interface {
        AddNetworkList(ctx context.Context, net *NetworkConfigList, rt *RuntimeConf) (types.Result, error)
        CheckNetworkList(ctx context.Context, net *NetworkConfigList, rt *RuntimeConf) error
        DelNetworkList(ctx context.Context, net *NetworkConfigList, rt *RuntimeConf) error
        GetNetworkListCachedResult(net *NetworkConfigList, rt *RuntimeConf) (types.Result, error)
        GetNetworkListCachedConfig(net *NetworkConfigList, rt *RuntimeConf) ([]byte, *RuntimeConf, error)
        AddNetwork(ctx context.Context, net *NetworkConfig, rt *RuntimeConf) (types.Result, error)
        CheckNetwork(ctx context.Context, net *NetworkConfig, rt *RuntimeConf) error
        DelNetwork(ctx context.Context, net *NetworkConfig, rt *RuntimeConf) error
        GetNetworkCachedResult(net *NetworkConfig, rt *RuntimeConf) (types.Result, error)
        GetNetworkCachedConfig(net *NetworkConfig, rt *RuntimeConf) ([]byte, *RuntimeConf, error)
        ValidateNetworkList(ctx context.Context, net *NetworkConfigList) ([]string, error)
        ValidateNetwork(ctx context.Context, net *NetworkConfig) ([]string, error)
}
```
源码：[cni/api.go at main · containernetworking/cni](https://github.com/containernetworking/cni/blob/main/libcni/api.go#L80)
::: tip 💡
Flannel Vxlan示意图
:::
![](/images/posts/nmg-network%20in%20k8s/li.feishu.cn_)
**Flannel主要工作内容**
1. 给Pod分配IP
2. 给每个Node创建一个子网
3. 维护所有子网的路由
**数据传递过程**
1. 源容器向目标容器发送数据，数据首先发送给docker0网桥
2. docker0网桥接受到数据后，将其转交给flannel.1虚拟网卡处理
3. flannel.1接受到数据后，对数据进行封装，并发给宿主机的eth0
4. 对在flannel路由节点封装后的数据，进行再封装后，转发给目标容器Node的eth0
5. 目标容器宿主机的eth0接收到数据后，对数据包进行拆封，并转发给flannel.1虚拟网卡；
6. flannel.1 虚拟网卡接受到数据，将数据发送给docker0网桥；
7. 最后，数据到达目标容器，完成容器之间的数据通信。
# 三、总结归纳
## 3.1 Kubernetes中向外暴露服务的方式
1. 通过NodePort类型的Service
2. 通过LoadBalancer的Service
3. 通过Ingress
4. 通过HostPort或HostNetwork
## 3.2 Service背后的kube-proxy的模式
1. userspace：用户态代理，性能差
2. iptables：内核态代理，无需在用户空间和内核空间之间切换，处理流量具有较低的系统开销
3. ipvs：类似iptables，但性能更好
## 3.3 CNI的一种实现，Flannel中的模式
1. udp：使用用户态udp封装，默认使用8285端口。由于是在用户态封装和解包，性能上有较大的损失
2. vxlan：vxlan封装，需要配置VNI，Port（默认8472）和[GBP](https://github.com/torvalds/linux/commit/3511494ce2f3d3b77544c79b87511a4ddb61dc89)
3. host-gw：直接路由的方式，将容器网络的路由信息直接更新到主机的路由表中，仅适用于二层直接可达的网络
4. aws-vpc：使用 Amazon VPC route table 创建路由，适用于AWS上运行的容器
5. gce：使用Google Compute Engine Network创建路由，所有instance需要开启IP forwarding，适用于GCE上运行的容器
6. ali-vpc：使用阿里云VPC route table 创建路由，适用于阿里云上运行的容器
# 四、参考文档
- [服务](https://kubernetes.io/zh/docs/concepts/services-networking/service/)
- [Kubernetes网络模型](https://kuboard.cn/learning/k8s-intermediate/service/network.html#kubernetes%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5)
- [循序渐进理解CNI机制与Flannel工作原理 :: Yingchi Blog](https://blog.yingchi.io/posts/2020/8/k8s-flannel.html)
- [Kubernetes网络之Flannel工作原理 - SSgeek - 博客园](https://www.cnblogs.com/ssgeek/p/11492150.html)
