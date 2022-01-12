---
title: "Isti - 如何自定义Sidecar及设置Sidecar的日志"
description: "如何自定义Sidecar及设置Sidecar的日志"
image: ""
date: 2022-01-07T15:19:00+07:00
lastmod: 2022-01-12T15:24:00+07:00
author: "闫勃"
tags:
  - "Istio"
  - "Sidecar"
categories:
  - "ServiceMesh"
draft: false
---

### 场景

想要收集 Envoy 的 Accesslog，希望把日志打到 Node 上，让 Node 上的采集程序能采集到

### 步骤

1. 挂载一个日志卷进去
1. 修改 istio 的配置文件

问题 1：如何自定义 sidecar 的配置？

答案：直接在 containers 下面新建一个容器，name 为 istio-proxy，image 为 auto。然后根据我们的需求设置 volumeMounts 即可

```yaml
template:
  metadata:
    labels:
      app: httpbin
      version: v1
  spec:
    serviceAccountName: httpbin
    containers:
      - image: docker.io/kennethreitz/httpbin
        imagePullPolicy: IfNotPresent
        name: httpbin
        ports:
          - containerPort: 80
      - image: auto
        name: istio-proxy
        volumeMounts:
          - mountPath: /data/logs
            name: logs
    volumes:
      - name: logs
        emptyDir: {}
```

问题 2：如何修改 Envoy 的 Accesslog 输出地址？

- 全局的方式可以直接改 istio 的 meshConfig，修改 accessLogFile 即可
- 修改 sidecar 级别的需要利用 Telemetry 来配置
  - 第一步在 meshConfig 里增加一个 provider
  - 第二步增加一个 Telemetry 使用这个 provider

meshConfig: @`kubectl istio-system configmap istio`

```yaml
accessLogFile: /dev/stdout
defaultConfig:
  discoveryAddress: istiod.istio-system.svc:15012
  proxyMetadata: {}
  tracing:
    zipkin:
      address: zipkin.istio-system:9411
extensionProviders:
  - name: logfile
    envoyFileAccessLog:
      path: "/data/logs/istio.log"
enablePrometheusMerge: true
rootNamespace: istio-system
trustDomain: cluster.local
```

Telemetry 如下：

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: frontend-logging
spec:
  selector:
    matchLabels:
      app: httpbin
  accessLogging:
    - providers:
        - name: logfile
```

注：改完 meshConfig 需要重启 sidecar 才能生效

### 参考文档

- [https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#customizing-injection](https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#customizing-injection)
- [https://github.com/istio/istio.io/issues/7613#issuecomment-1009553832](https://github.com/istio/istio.io/issues/7613#issuecomment-1009553832)
- [https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-EnvoyFileAccessLogProvider](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-EnvoyFileAccessLogProvider)
