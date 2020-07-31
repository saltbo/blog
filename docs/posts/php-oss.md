---
title: "阿里云OSS上传服务的搭建"
author: "saltbo"
cover: /images/posts/oss.jpeg
date: 2016-04-04T13:18:35+08:00
tags: ["阿里云", "OSS"] 
---

很多项目经常会用到阿里云的OSS，每次都需要集成一遍oss的sdk。那么有没有一劳永逸的方法呢。答案当然是yes！
<!-- more -->

很多项目经常会用到阿里云的OSS，每次都需要集成一遍oss的sdk。

那么有没有一劳永逸的方法呢。答案当然是yes！

我们可以将oss上传做成一个可以对外提供的服务，以后再需要使用的时候就直接调用就好了。

本服务采用RESTFull接口设计。

提供两个方法：upload，urlsign

upload为统一上传接口，通过这个接口可以上传任意文件到OSS。

urlsign为url签名接口，通过这个接口可以拿到私有bucket的签名地址。

下面直接来看代码
```php
<?
/** 
  * 验证来源ID 
  */
private function checkSource() {
    if (empty($GLOBALS['sources']) || empty($this->_sourceid)) {        
        Output::jsonStr(Error::ERROR_AUTH_SOURCE_FAIL);
    }
    foreach($GLOBALS['sources'] as $key => $value) {
        if ($value['sourceid'] == $this->_sourceid) {
            $this->_bucket = $value['bucket'];
            $this->_domain = $value['domain'];
            $this->_project = $key;
        }
    }
    if (empty($this->_bucket)) {
        Output::jsonStr(Error::ERROR_AUTH_SOURCE_FAIL);
    }
}
```
这样可能看不懂，再来看下配置
![配置](https://static.saltbo.cn/images/1240-20200801000327526.png)

这回是不是理解了呢。
通过这段代码可以实现在配置里指定单独的Bucket和绑定的域名。

但是，实际情况是如果绑定的域名是CDN域名，那么就无法操作oss了，那么有什么解决办法呢。

答案就是：所有的上传操作都走oss的内网域名，上传成功之后返回的地址走绑定域名。

代码如下：
```php
<?
/**
 * 初始化ossClient
 * @param type $useDomain
 * @return OssClient
 */
public function ossClient($useDomain = 0) {
    $endpoint = self::endPoint;
    $isCName = 0;
    if($useDomain && $this->_domain){
        $endpoint = $this->_domain;
        $isCName = 1;
    }
    try {
        return new OssClient(self::accessKeyId, self::accessKeySecret, $endpoint,  $isCName);
    } catch (OssException $e) {
        Output::jsonStr(Error::ERROR_SYSTEM_FAIL, $e->getMessage());
    }
}
```
因为同一个方法中不一定使用绑定的域名还是原始域名，所以这里封装了一个方法，目的就是可以指定使用绑定的域名或者不使用。

下面就是具体的接口代码
```php
<?
/**
 * 统一上传服务
 * @param type $file_content
 * @param type $save_name
 * @param type $save_path
 */
public function _upload($file_content, $save_name, $save_path) {
     //获取文件类型
    $type = Tools::getFileType($file_content);
    if(!$type){
        Output::jsonStr(Error::ERROR_PARAM_INVALID, 'unknow type.');
    }
    //获取目标文件名
    $filename = $this->_getSaveName($save_name, $type);
    $object = ($save_path) ? "$this->_project/$save_path/$filename" : "$this->_project/$filename";
    try {
        $this->ossClient()->putObject($this->_bucket, $object, $file_content);
    } catch (Exception $exc) {
        Output::jsonStr(Error::ERROR_SYSTEM_FAIL, $exc->getMessage());
    }
    $data = ['object' => $object, 'url' => $this->_getUrl($object)];
    $img_info = OssPictureModel::info($this->url);
    Output::jsonStr(Error::SUCCESS, $img_info ? array_merge($data, $img_info) : $data);
}

/**
 * API:获取私有Bucket中Object的signUrl
 */
public function urlSignAction() {
    $object = $this->input_post_param('object');
    $timeout = $this->input_post_param('timeout', 60);
    if(!$object){
        Output::jsonStr(Error::ERROR_PARAM_MISS);
    }
    try {
        $this->ossClient()->doesObjectExist($this->_bucket, $object);
    } catch (Exception $exc) {
        Output::jsonStr(Error::ERROR_PARAM_INVALID, $exc->getMessage());
    }
    try {
        $sign_url = $this->ossClient(1)->signUrl($this->_bucket, $object, $timeout);
    } catch (Exception $exc) {
        Output::jsonStr(Error::ERROR_PARAM_INVALID, $exc->getMessage());
    }
    Output::jsonStr(Error::SUCCESS, $sign_url);}
```

到这里，我们就搭建好了一个基本的服务，以后有需要用到oss上传的项目，只要在本服务配置文件的sources数组中新增一个成员，然后就可以通过接口直接调用了。

***我是闫大伯，一只永不停歇的野生程序猿***
