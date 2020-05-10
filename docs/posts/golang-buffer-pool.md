---
title: "使用buffer对象池（sync.Pool）需要着重关注引用问题"
author: "saltbo"
date: 2020-05-10T20:12:41+08:00
---

> sync.Pool可以在高并发场景下提高吞吐能力，但是如果使用不当会导致严重的问题。这里详细梳理一下这次遇到的问题。
<!--more-->


## 前言
之前测试仿真环境总是发生丢body的问题，经过长时间的排查，终于发现了原因。我们网关的Client用的是fasthttp，测试仿真环境是使用nginx自建的LB。当业务发版的时候nginx会reload配置文件，本来这个过程是没有问题的。但是，由于fasthttp实现的原因无法感知到server端的连接断开，从而导致client丢失了body。具体的详情可见这个[issue](https://github.com/valyala/fasthttp/issues/766)

## 原始代码
为了解决丢body的问题，我们只能改为使用buffer。具体的实现如下：
```go
func (c *Context) BodyBuffer() (*bytes.Buffer, error) {
   if v, ok := c.Get("BB"); ok {
      return v.(*bytes.Buffer), nil
   }
 
   buff := initvar.BufPool.Get().(*[]byte)
   buffer := initvar.BufferPool.Get().(*bytes.Buffer)
   buffer.Reset()
 
   _, err := io.CopyBuffer(buffer, c.Request.Body, *buff)
   if err != nil {
      return nil, err
   }
 
   initvar.BufPool.Put(buff)
   initvar.BufferPool.Put(buffer)
   c.Set("BB", buffer)
   return buffer, nil
}
```

## 第一次修正
```go
func (c *Context) BodyBytes() ([]byte, error) {
   if v, ok := c.Get("BB"); ok {
      return v.([]byte), nil
   }
 
   buff := initvar.BufPool.Get().(*[]byte)
   buffer := initvar.BufferPool.Get().(*bytes.Buffer)
   defer initvar.BufPool.Put(buff)
   defer initvar.BufferPool.Put(buffer)
 
   buffer.Reset()
   _, err := io.CopyBuffer(buffer, c.Request.Body, *buff)
   if err != nil {
      return nil, err
   }
 
   c.Set("BB", buffer.Bytes())
   return buffer.Bytes(), nil
}
```

## 第二次修正
```go
func (c *Context) ReadBodyBytes() ([]byte, error) {
   if c.bodyBuffer.Len() > 0 {
      return c.bodyBuffer.Bytes(), nil
   }
 
   written, err := io.Copy(&c.bodyBuffer, c.Request.Body)
   if err != nil {
      return nil, fmt.Errorf("read body error: %s, written: %d, buffer: %s", err, written, c.bodyBuffer.String())
   }
 
   return c.bodyBuffer.Bytes(), nil
}
```

## 重现

## 解决