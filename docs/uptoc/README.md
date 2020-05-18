---
sidebar: 'auto'
---

# Uptoc

> [uptoc](https://github.com/saltbo/uptoc) 是一个用于将静态文件部署到云存储的命令行工具，它通常配合持续集成平台使用。当然你也可以安装在你的本地使用。

## 驱动
- 阿里云Oss
- 腾讯云Cos
- 七牛云Kodo
- AWS S3
- Google Storage

## 安装

从[Releases](https://github.com/saltbo/uptoc/releases)页面下载您所需平台的二进制文件，或者直接使用下面的安装脚本

```bash
curl -sSf http://uptoc.saltbo.cn/install.sh | sh
```

## 使用

### 基本使用

```bash
uptoc --region cn-beijing --access_key LTAI4FxxxxxxxBXmS3 --access_secret Vt1FZgxxxxxxxxxxxxKp380AI --bucket demo-bucket /opt/blog/public
```

其中，access_key和access_secret支持环境变量

```bash
export UPTOC_UPLOADER_AK=LTAI4FxxxxxxxBXmS3
export UPTOC_UPLOADER_SK=Vt1FZgxxxxxxxxxxxxKp380AI

uptoc --region cn-beijing --bucket blog-bucket /opt/blog/public
```

### Github Actions

同时，uptoc也是一个GitHub Actions。所以你可以直接在你的actions里使用它。

```yml
steps:
  - name: Deploy
    uses: saltbo/uptoc@master
    with:
      driver: oss
      region: cn-zhangjiakou
      bucket: saltbo-blog
      dist: public
    env:
      UPTOC_UPLOADER_AK: ${{ secrets.UPTOC_UPLOADER_KEYID }}
      UPTOC_UPLOADER_SK: ${{ secrets.UPTOC_UPLOADER_KEYSECRET }}
```

### 其他类似Travis的平台

如果你使用的是其他CI平台，那么可以使用下面的方式进行使用。

为了安全考虑，请务必在CI平台上添加上UPTOC_UPLOADER_AK和UPTOC_UPLOADER_SK而非直接写死在yaml里。

```yaml
after_success:
  - curl -sSf http://uptoc.saltbo.cn/install.sh | sh
  - uptoc --region cn-zhangjiakou --bucket blog-bucket public
```

## 驱动配置

| driver | bucket | region | region enum |
| -----  | --------- | ------ | ---- |
| oss    | ut-uptoc  | cn-hangzhou | [Regions](https://help.aliyun.com/document_detail/31837.html?spm=a2c4g.11186623.2.12.5fdb25b7xyEcuF#concept-zt4-cvy-5db)  |
| cos    | ut-uptoc-1255970412 | ap-shanghai  |  [Regions](https://cloud.tencent.com/document/product/436/6224)  |
| qiniu  | ut-uptoc  | cn-east-1 |  [Regions](https://developer.qiniu.com/kodo/manual/4088/s3-access-domainname)  |
| google | ut-uptoc  | auto  | - |
| s3     | ut-uptoc  | ap-northeast-1  |  [Regions](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints)  |
