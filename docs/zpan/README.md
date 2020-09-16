## ZPan

项目刚开始，文档尚不完善，有兴趣欢迎帮忙PR



## 介绍

ZPan是一款基于云存储的网盘系统，使用它您可以很方便的连接阿里云OSS，腾讯COS，七牛云KODO等对象存储系统来启动一个完整的私有网盘系统。



## 为什么是ZPan？

传统网盘系统都是基于本地文件系统，这种网盘最大的缺点就是上传下载速度受系统所在服务器的带宽影响。比如您使用NextCloud在一台1兆带宽的服务器上搭建一个网盘，那么网盘的上传下载速度上限就只有一兆，如果您想提升速度就只能给服务器升级带宽，这将是很大的成本。



ZPan基于云存储来实现底层文件系统，就是看中了云存储的不限速。我们采用客户端直连的方式进行上传下载，也就是说不管您上传还是下载都不受ZPan运行服务器的带宽限制，您本地有多大的带宽就能跑多快。



## 快速开始

### Linux
```bash
# 安装服务
curl -sSf https://dl.saltbo.cn/install.sh | sh -s zpan

# 启动服务
systemctl start zpan

# 查看服务状态
systemctl status zpan

# 设置开机启动
systemctl enable zpan
```

### Docker
```bash
docker run -p 80:8222 -v /etc/zpan:/zpan -it saltbo/zpan:latest
```


## 配置文件(/etc/zpan/zpan.yml)

```yaml
debug: false
invitation: false  # 邀请注册是否开启，开启后只允许邀请注册，默认关闭
storage: 104857600 # 给每个用户分配的初始空间，单位：字节

database:
  driver: mysql
  dsn: root:admin@tcp(127.0.0.1:3306)/zpan?charset=utf8&parseTime=True&loc=Local

provider:
  name: oss
  bucket: saltbo-zpan-test
  endpoint: https://oss-cn-zhangjiakou.aliyuncs.com
  customHost: http://dl-test.saltbo.cn
  accessKey: LTAIxxxxxxxxxxxxxxx7YoV
  accessSecret: PFGVwxxxxxxxxxxxxxxxxRd09u

#配置发信邮箱即可开启账号注册的邮箱验证
#email:
#  host: smtpdm.aliyun.com:25
#  sender: no-reply@saltbo.fun
#  username: Zpan
#  password: mGxxxxxxxxh9
```

### Database

我们采用GORM进行数据库操作，因此我们支持MySQL, PostgreSQL, SQlite, SQL Server四种数据库驱动。在默认配置中我们使用SQlite作为数据库，如果您想使用其他数据库，只需要将driver改为相应驱动名称即可。

#### driver & dsn

- sqlite3: zpan.db
- mysql: user:pass@tcp(127.0.0.1:3306)/zpan?charset=utf8mb4&parseTime=True&loc=Local
- postgres: user=zpan password=zpan dbname=zpan port=9920 sslmode=disable TimeZone=Asia/Shanghai
- mssql: sqlserver://zpan:LoremIpsum86@localhost:9930?database=zpan


### Provider

目前我们支持所有基于S3的云存储平台，比如阿里云OSS、腾讯云COS、七牛云KODO。

因此，Provider的name可配置为下面这些选项：

- oss
- cos
- kodo

其他参数当您在对应平台上创建完bucket就可以拿到了，配置到响应位置即可。



## 项目地址

- GitHub：[https://github.com/saltbo/zpan](https://github.com/saltbo/zpan)
- 演示地址：[http://zpan.saltbo.cn](http://zpan.saltbo.cn)（账号密码都是demo）
- 文档地址： [https://saltbo.cn/zpan](https://saltbo.cn/zpan)



## 用户反馈

<img src="https://static.saltbo.cn/images/image-20200907222028162.png" alt="image-20200907222028162" style="zoom: 25%;" />

扫码进群，和我一起完善这个产品。
