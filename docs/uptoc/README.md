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

**homebrew** (可能不是最新版本):

```bash
brew install uptoc
```

**homebrew tap**:

```bash
brew install saltbo/bin/uptoc
```

**Shell script**:

```bash
curl -sSf https://uptoc.saltbo.cn/install.sh | sh
```

**deb/rpm**:

从[Release页面](https://github.com/saltbo/uptoc/releases)下载`.deb`或`.rpm`，然后分别使用`dpkg -i`和`rpm -i`安装。

**manually**:

从[Release页面](https://github.com/saltbo/uptoc/releases)下载预编译的二进制文件，然后复制到所需位置。

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
      exclude: .cache,test
      dist: public
    env:
      UPTOC_UPLOADER_AK: ${{ secrets.UPTOC_UPLOADER_KEYID }}
      UPTOC_UPLOADER_SK: ${{ secrets.UPTOC_UPLOADER_KEYSECRET }}
```

### Typora编辑器
**在本地配置相关信息： [live](https://asciinema.org/a/343794)**
```bash
uptoc config
```

**在Typora中配置自定义命令：**
![image-20200628214441740](https://static.saltbo.cn/images/image-20200628214441740.png)

## 驱动配置

| driver | bucket | region | region enum |
| -----  | --------- | ------ | ---- |
| oss    | ut-uptoc  | cn-hangzhou | [Regions](https://help.aliyun.com/document_detail/31837.html?spm=a2c4g.11186623.2.12.5fdb25b7xyEcuF#concept-zt4-cvy-5db)  |
| cos    | ut-uptoc-1255970412 | ap-shanghai  |  [Regions](https://cloud.tencent.com/document/product/436/6224)  |
| qiniu  | ut-uptoc  | cn-east-1 |  [Regions](https://developer.qiniu.com/kodo/manual/4088/s3-access-domainname)  |
| google | ut-uptoc  | auto  | - |
| s3     | ut-uptoc  | ap-northeast-1  |  [Regions](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints)  |
