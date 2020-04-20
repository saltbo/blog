## 介绍

`uptoc` 是一个用于将静态文件部署到云存储的命令行工具，它通常配合持续集成平台使用。当然你也可以安装在你的本地使用。


## 安装

```bash
curl -sSf http://uptoc.saltbo.cn/install.sh | sh
```

## 使用

### 基本操作
```bash
uptoc --endpoint oss-cn-beijing.aliyuncs.com --access_key LTAI4FxxxxxxxBXmS3 --access_secret Vt1FZgxxxxxxxxxxxxKp380AI --bucket demo-bucket /opt/blog/public
```

为了安全考虑，access_key和access_secret支持通过环境变量进行配置
```bash
export UPTOC_UPLOADER_KEYID=LTAI4FxxxxxxxBXmS3
export UPTOC_UPLOADER_KEYSECRET=Vt1FZgxxxxxxxxxxxxKp380AI

uptoc --endpoint oss-cn-beijing.aliyuncs.com --bucket blog-bucket /opt/blog/public
```

### Github Actions
```yml
steps:
  - name: Deploy
    uses: saltbo/uptoc@master
    with:
      driver: oss
      endpoint: oss-cn-zhangjiakou.aliyuncs.com
      bucket: saltbo-blog
      dist: public
    env:
      UPTOC_UPLOADER_KEYID: ${{ secrets.UPTOC_UPLOADER_KEYID }}
      UPTOC_UPLOADER_KEYSECRET: ${{ secrets.UPTOC_UPLOADER_KEYSECRET }}
```
###  Travis 
```yaml
after_success:
  - curl -sSf http://uptoc.saltbo.cn/install.sh | sh
  - uptoc --endpoint uploader-cn-zhangjiakou.aliyuncs.com --bucket blog-bucket public
```


