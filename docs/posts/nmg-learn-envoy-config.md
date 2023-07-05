---
author: saltbo
categories:
    - ServiceMesh
createat: "2022-02-24T01:26:00+07:00"
date: "2022-02-24T00:00:00+07:00"
lastupdated: "2022-02-24T03:27:00+07:00"
name: learn envoy config
status: "Published \U0001F5A8"
tags:
    - Sidecar
    - Envoy
title: 一文了解Envoy配置文件
---

## 简介
Envoy是一个基于C++实现的云原生高性能代理服务器。

首先，我想要介绍的是：Envoy不是开箱即用的软件。它不是面向普通用户的，甚至不是面向运维人员的。所以它的配置文件相对Nginx来说会复杂很多。实际上我认为它就是面向开发人员的。
## 配置
Envoy配置的基本逻辑是
1. Listener定义监听地址和端口
2. Listener附加filter_chains实现具体需求
### 一个最小配置
这时它就是一个开启了8081端口的TCP服务器，但没有任何功能
```yaml
admin:
  address:
    socket_address:
      protocol: TCP
      address: 0.0.0.0
      port_value: 9901

static_resources:
  listeners:
  - name: listener_0
    address:
      socket_address:
        protocol: TCP
        address: 0.0.0.0
        port_value: 8081
    filter_chains: [{}]
```
### 一个HTTP反向代理配置
1. 在Listener的filter_chains里面添加一个http_connection_manager的filter
2. 配置http_connection_manager的route_config
3. route_config里配置一个目标cluster
4. Clusters里定义一个Cluster（类似Nginx的upstream）
5. 每个Cluster包含一组Endpoints，支持负载均衡
```yaml
admin:
  address:
    socket_address:
      protocol: TCP
      address: 0.0.0.0
      port_value: 9901

static_resources:
  listeners:
  - name: listener_0
    address:
      socket_address:
        protocol: TCP
        address: 0.0.0.0
        port_value: 8081
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          stat_prefix: saltbo
          http_filters:
          - name: envoy.filters.http.router
          route_config:
            name: saltbo
            virtual_hosts:
            - name: saltbo
              domains: ["*"]
              routes:
              - match:
                  prefix: "/"
                route:
                  host_rewrite_literal: saltbo.cn
                  cluster: saltbo
  
  clusters:
  - name: saltbo
    connect_timeout: 0.3s
    type: STRICT_DNS
    dns_lookup_family: V4_ONLY
    load_assignment:
      cluster_name: saltbo
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: saltbo.cn
                port_value: 80
```

### 给反向代理加个访问日志
> 为方便理解，已去除无关配置

```yaml
static_resources:
  listeners:
  - name: listener_0
    address:
      socket_address:
        protocol: TCP
        address: 0.0.0.0
        port_value: 8081
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          stat_prefix: saltbo
          access_log:
          - name: envoy.access_loggers.stdout
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.access_loggers.stream.v3.StdoutAccessLog
          - name: envoy.access_loggers.file
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
              path: "/tmp/access.log"
          http_filters:
          - name: envoy.filters.http.router
```
可以看到，新增了一个access_log字段，这个字段的配置仔细观察的话会发现跟filter的配置很像。
从这里可以了解到，Envoy是通过protobuf来管理api的，filter的配置基本都是通过@type指定一个protobuf的地址。

## 动态配置
上面讲的都是静态配置。实际上在Envoy中只会用到少量的静态配置，因为它的配置太复杂了，如果全部用静态配置会很麻烦。所以它还有一个动态配置，然后它定义了一个xDS协议，通过这个协议可以实现动态的对配置进行变更。下面就是一个简单的动态配置例子：
envoy.yaml
```yaml
dynamic_resources:
  lds_config:
    path: /etc/envoy/lds.yaml
  cds_config:
    path: /etc/envoy/cds.yaml
```
/etc/envoy/lds.yaml
```yaml
resources:
- "@type": type.googleapis.com/envoy.config.listener.v3.Listener
  name: listener_0
  address:
    socket_address:
      address: 0.0.0.0
      port_value: 10000
  filter_chains:
  - filters:
      name: envoy.filters.network.http_connection_manager
      typed_config:
        "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
        stat_prefix: ingress_http
        http_filters:
        - name: envoy.filters.http.router
        route_config:
          name: local_route
          virtual_hosts:
          - name: local_service
            domains:
            - "*"
            routes:
            - match:
                prefix: "/"
              route:
                cluster: example_proxy_cluster
```
/etc/envoy/cds.yaml
```yaml
resources:
- "@type": type.googleapis.com/envoy.config.cluster.v3.Cluster
  name: example_proxy_cluster
  type: STRICT_DNS
  load_assignment:
    cluster_name: example_proxy_cluster
    endpoints:
    - lb_endpoints:
      - endpoint:
          address:
            socket_address:
              address: service1
              port_value: 8080
```
可以看到，这是一个基于文件的xds例子，这只是为了方便测试与理解。

实际使用中，我们是使用如下配置：
```yaml
dynamic_resources:
  ads_config:
    api_type: GRPC
    transport_api_version: V3
    grpc_services:
    - envoy_grpc:
        cluster_name: xds_cluster
  cds_config:
    resource_api_version: V3
    ads: {}
  lds_config:
    resource_api_version: V3
    ads: {}

static_resources:
  clusters:
  - type: STRICT_DNS
    typed_extension_protocol_options:
      envoy.extensions.upstreams.http.v3.HttpProtocolOptions:
        "@type": type.googleapis.com/envoy.extensions.upstreams.http.v3.HttpProtocolOptions
        explicit_http_config:
          http2_protocol_options: {}
    name: xds_cluster
    load_assignment:
      cluster_name: xds_cluster
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: go-control-plane
                port_value: 18000
```
这种方式就是真实场景了，我们需要自行开发一个服务来管理xds，详见：[官方文档](https://www.envoyproxy.io/docs/envoy/v1.21.1/start/sandboxes/dynamic-configuration-control-plane.html)

### xDS对应关系
- LDS：Listener
- RDS：Route
- EDS：Endpoint
- CDS：Cluster
- ADS：Aggreate
- SDS：Secret
- HDS：Health

