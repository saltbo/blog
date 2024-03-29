---
author: saltbo
categories: []
createat: "2022-04-15T03:07:00+07:00"
date: "2017-07-15T00:00:00+07:00"
lastupdated: "2023-01-11T13:57:00+07:00"
name: docker-net-cache
status: "Published \U0001F5A8"
tags:
  - docker
title: 基于Docker搭建开发测试环境--网络·缓存
---

Docker 网络类型 docker 有三种网络类型 bridge、host、none，默认 bridge。bridge 的意思是容器拥有独立的网络环境通…

## Docker 网络类型

```shell
[www@BJ-TEST-SHZF ~]$ ifconfig
 docker0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.0.1  netmask 255.255.240.0  broadcast 0.0.0.0
        ether 02:42:0d:31:29:64  txqueuelen 0  (Ethernet)
        RX packets 774354  bytes 122153704 (116.4 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 823043  bytes 271440422 (258.8 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`

[www@BJ-TEST-SHZF ~]$ sudo docker network ls
 NETWORK ID          NAME                DRIVER              SCOPE
 0d8ae0f3d65c        bridge              bridge              local
 3f9b0cbe5c53        host                host                local
 8de6293034ce        none                null                local
```

docker 有三种网络类型 bridge、host、none，默认 bridge。bridge 的意思是容器拥有独立的网络环境通过 docker0 进行通信，host 的意思是容器跟宿主机共用同一个网络，none 即无网络环境。
docker0 是 Docker 服务默认会创建的一个网桥（其上有一个 docker0 内部接口），它在内核层连通了其他的物理或虚拟网卡，这就将所有容器和本地主机都放到同一个物理网络。

## 搭建开发环境

先说一下背景。我们之前有大量的未 docker 化的项目，现在有一小部分项目开始 docker 化，但是又不想维护两台服务器（因为之前的服务器是 cenos6，docker 要求最低 cenos7）。因此想要搭建一个共用的 php 环境，这样我们就可以把未 docker 化的项目统一在这个环境运行。如下图：
![](/images/posts/docker-net-cache/static.saltbo.cn_1240.png)
开发环境
如图，Project-1 和 Project-2 是 docker 化后的项目，即采用独立容器的方式。project-a,project-b,project-c 等项目是通过挂载的方式挂到一个共用的开发环境 store-dev。

### Dockerfile

```plain text
FROM registry.cn-beijing.aliyuncs.com/xxxx/php:5.6-onbuild

#启动时将项目根目录挂载到/data/web
ENV APP_PATH /data/web
WORKDIR $APP_PATH

RUN ln -s $APP_PATH/docker $APP_HOME/docker

EXPOSE 80

CMD ["supervisord"]
```

基础镜像包含了 nginx、php 及项目所用到的一些扩展，因此 Dockerfile 文件基本没什么内容，主要是做一个软链，将 docker 目录链到*A**P**P**H**O**M**E**下**的**d**o**c**k**e**r**目**录*。APP_HOME 是基础镜像定义的，因为 nginx.conf 里的 include 是$APP_HOME/docker/nginx/\*.conf

### Nginx 配置

```plain text
server{
    listen       80;
    server_name  sapi.dev.com;

    if (!-e $request_filename) {
        rewrite ^/(.*)  /index.php?$1 last;
    }

    root /data/web/sapi;
    location / {
        index index.html index.php;
    }

    location ~ \.php$ {
        fastcgi_pass   unix:/dev/shm/php.sock;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }

}
```

这里的话主要就是修改下 server_name 和 root 即可，注意 Dockerfile 里提到了，我们是挂载到/data/web 下，所以如图的路径就是/data/web/project-x

### 部署 Shell

```shell
#!/bin/bash

appname="store-dev"
logpath="/opt/ljgit/logs/php5"         #修改成自己的日志目录
apppath="/opt/ljgit/store"             #修改成自己项目的上级目录

cd $apppath/docker
docker build -t $name -f Dockerfile .
docker kill $name
docker rm $name
docker run -v $logpath:/data/logs -v $apppath:/data/web/ -p 80:80 --name $name -d $name
```

其实最重要的是这个脚本，我们通过它来挂载目录及暴露端口。
这样，基本上只要修改下 logpath 和 apppath，然后执行这个脚本，就可以一键部署好我们的开发环境了。

> Tips: 电脑重启后并不用重新执行这个脚本，直接执行 docker start store-dev 即可。

### Mac 没有 docker0

在开发环境中，如果我们想要调用宿主机本身的一个地址该如何调用呢。前面提到了，docker 默认采用的是 bridge 模式，也就是网桥 docker0。所以理论上说也很简单啦，直接调用 docker0 的 ip 即可。但是，很可悲的是 mac 下并没有 docker0…
![](/images/posts/docker-net-cache/static.saltbo.cn_1240-20200731232214068.png)
ifconfig-mac
这就尴尬了。那么如何调用宿主机呢？
通过 Google 大法查了下，给 lo0 设置一个别名就可以了。注意看上图的 lo0 与你的 lo0 有什么区别！
方法如下： `ifconfig lo0 alias 10.10.10.1`

> Tips: Docker 的核心技术是基于 Linux 的虚拟化，Mac 之所以能用 Docker 其实是在 Mac 上装了个小型 Linux，然后再这个 Linux 上实现的 Docker。所以在 Mac 上找不到 docker0。

## 搭建测试环境

测试环境其实跟开发环境是一样的，不一样的就是监听的域名不同，那么我们就只需要改一下 nginx 的 server_name 即可。
这里主要说下 docker 化后的项目如何部署。

### deploy.sh

```shell
#!/bin/bash

port=""
if [ $appport ] ; then
    randport=$RANDOM
    port='-p '$randport':'$appport
    echo $port
fi

logpath=$(dirname $apppath)/logs

# 更新代码并拉取配置文件
cd $apppath/$appname
git checkout $branch && git pull
git clone -b $branch $(cat docker/CONF_REPO) docker/configs

# 打包并重启
sudo docker build -t image-$appname -f docker/Dockerfile --network host .
sudo docker kill $appname
sudo docker rm $appname
sudo docker run -v /etc/hosts:/etc/hosts -v $logpath/$appname:/data/logs -e RUN_ENV=$env $port --name $appname -d image-$appname
rm -rf docker/configs

# 加入代理并重启
if [ $appport ] ; then
    echo $appport

    cd /data/nginx/
    sed 's/appname/'$appname'/g;s/appport/'$randport'/g' testing.com/app.tpl > didatrip.com/$appname.testing.com.conf
    sh restart.sh
fi
```

### project-a.sh

```shell
#!/bin/bash

export env="testing"
export branch="release"
export appname="project-a"
export appport=7321
export apppath="/data/didatrip/alone"      #修改成自己项目的上级目录

sh deploy.sh
```

我们提供了一个通用的脚本，通过它可以实现更新代码、拉取配置文件、打包、重启、加入代理。因为我们的配置文件是通过一个 git 库来维护，所以每个项目的 docker 目录下都会有 CONF_REPO 文件，里面记录了配置文件的 git 库地址。

### 打包无法请求内网资源

这里简单说一下 docker build 的实质。
在 build 的时候会依据 Dockerfile 中的指令执行相应的操作，其中的 RUN、COPY、ADD 等命令其实都是在一个容器内执行，并不是直接在宿主机执行！
因为在打包过程中会拉取 gitlab 中的一些代码，然后就发现无法请求到 gitlab。。。
因为我们的 gitlab 是私有的，外网禁止访问。。。
但是 docker 的网络默认的是 bridge 模式，所以在 build 过程中肯定是无法请求宿主机的内网资源的。。。
我们都知道 docker run 是可以通过–net 参数来指定网络类型，但是 build 如何指定呢？
还是通过 Google 大法，终于查到 build 可以用–network 来制定，即 `sudo docker build -t image-$appname -f docker/Dockerfile --network host .`

## 另一个开发环境

可以看到上面的 deploy.sh 的最后一步有个代理，那么这是个什么鬼呢？
这就要说到另外一个开发环境。因为前后端分离的原因，我们一直有一个供前端同学调用的开发环境。
现在问题就来了，大家都把项目 docker 化后，前端同学去调谁呢？显然调谁都是不合适的。
因为不想浪费服务器资源，所以我们决定在这台测试服务器上再搭一个开发环境。
因为有了 docker，复制一份环境出来变得异常简单。
但是也是存在一个问题，一个服务器只有一个 80 端口。新的开发环境怎么办呢？
由此我们引入了一个 nginx 代理，通过它做了一个泛解析，将不同域名的请求转发给不同的容器。如下图：
![](/images/posts/docker-net-cache/static.saltbo.cn_1240-20200731231934099.png)

### 泛解析

```plain text
server{
    listen      80;
    server_name ~^(?<subdomain>.+)\.testing\.com$;
    access_log /data/logs/testing.com.log;

    location / {
       proxy_pass http://192.168.0.1:8080;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
    }
}
```

可以看到，这里的 192.168.0.1 就是 docker0 的 ip。

### 独立容器 Nginx 模板

其实每个独立容器所需要的代理文件都是一样的，但是这一步又不可或缺，那么我们就可以把它做成自动化。

```plain text
server{
    listen      80;
    server_name appname.testing.com;
    access_log /data/logs/appname.testing.com.log;

    location / {
       proxy_pass http://192.168.0.1:appport;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
    }
}
```

```shell
# 加入代理并重启
if [ $appport ] ; then
    echo $appport

    cd /data/nginx/
    sed 's/appname/'$appname'/g;s/appport/'$randport'/g' testing.com/app.tpl > didatrip.com/$appname.testing.com.conf
    sh restart.sh
fi
```

这样你就可以理解这段脚本了吧？
部署独立容器的时候会随机分配一个端口号，然后自动将之加入到 Nginx 的代理中。

### 打包过程缓存不生效

一切都很完美，但是每次打包都很慢，这令我很痛苦。前面提到打包的过程中会到 gitlab 上拉取一些代码，这里的代码其实指的是我们自己的一些包。另外还有一些第三方的包在 github 上，每次都拉取代码实在是不能忍。
前面说过了，docker build 过程是在独立的容器内执行，并不是在宿主机本身。其实这里的独立容器并不是一个而是多个，在打包过程中其实会生成多个独立的临时容器（具体可以自行 Google）。
由于这个问题，其实 Dockerfile 的书写是可以做很大的文章的。下面我们就来看一下。

```plain text
FROM registry-internal.cn-beijing.aliyuncs.com/xxxx/golang:1.7-govendor AS build-env
ADD . /go/src/gitlab.xxxx.com/shzf/goscron
WORKDIR /go/src/gitlab.xxxx.com/shzf/goscron
RUN govendor sync -v
RUN go build -v -o /build/server


FROM registry-internal.cn-beijing.aliyuncs.com/xxxx/alpine:3.4

ENV APP_HOME /data/src
WORKDIR $APP_HOME

COPY docker $APP_HOME/docker
RUN cp -r docker/configs $APP_HOME/conf

COPY --from=build-env /build/server /data/src/goscron


EXPOSE 8080

ENTRYPOINT ["docker/entrypoint.sh"]
CMD ["supervisord"]
```

```plain text
FROM registry-internal.cn-beijing.aliyuncs.com/xxxx/golang:1.7-govendor AS build-env

ENV ROOT_PATH /go/src/gitlab.xxxx.com/shzf/goscron
WORKDIR $ROOT_PATH

ADD vendor $ROOT_PATH/vendor
RUN govendor sync -v

ADD . $ROOT_PATH
RUN go build -v -o /build/server


FROM registry-internal.cn-beijing.aliyuncs.com/xxxx/alpine:3.4

ENV APP_HOME /data/src
WORKDIR $APP_HOME

COPY docker $APP_HOME/docker
RUN cp -r docker/configs $APP_HOME/conf

COPY --from=build-env /build/server /data/src/goscron

ENTRYPOINT ["docker/entrypoint.sh"]
CMD ["supervisord"]
```

第一个是优化之前，第二个是优化之后。
拉取代码是`RUN govendor sync -v`这句。
是否使用缓存是由打包的文件内容是否和缓存的文件内容一致决定的，而每次部署之前的 git pull 会导致.git 目录下的文件发生改变，所以就会导致缓存不生效。
由此，我们可以把 vendor 目录拎出来单独 ADD，然后执行`RUN govendor sync -v`。
这样成功命中缓存~

## 特别鸣谢

感谢**第一貂蝉@青云**在我掉坑里的时候递的梯子
