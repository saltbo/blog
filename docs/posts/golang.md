---
title: 写在学习golang一个月后
author: saltbo
cover: /images/posts/golang.jpg
date: 2017-04-23T22:16:37+08:00
tags: ["golang"]
pinned: true
---

由于PHP没有连接池，当高并发时就会有大量的数据库连接直接冲击到MySQL上，最终导致数据库挂掉。虽然Swoole有连接池，但是Swoole只是PHP的一个扩展，之前使用Swoole过程中就踩过很多的坑。经过我们的讨论还是觉得使用Golang更加可控一些。
<!-- more -->

### 遇到的问题

连接池。由于PHP没有连接池，当高并发时就会有大量的数据库连接直接冲击到MySQL上，最终导致数据库挂掉。虽然Swoole有连接池，但是Swoole只是PHP的一个扩展，之前使用Swoole过程中就踩过很多的坑。经过我们的讨论还是觉得使用Golang更加可控一些。

### 框架的选择
在PHP中一直用的是Yaf，所以在Go中自然而言就选择了Gin。因为我们一直以来的原则是：尽量接近底层代码。

封装过于完善的框架不利于对整个系统的掌控及理解。我不需要你告诉我这个目录是干嘛的，这个配置怎么写，这个函数怎么用等等。

Gin是一个轻路由框架，很符合我们的需求。为了更好地开发，我们也做了几个中间件。
### 中间件——input

每个接口都需要获取GET或POST的参数，但是gin自带的方法只能返回string，所以我们进行了简单的封装。封装过后我们就可以根据所需直接转换成想要的数据类型。
```go
package input

import (
	"strconv"
)

type I struct {
	body string
}

func (input *I) get(p string) *I {
	d, e := Context.GetQuery(p)
	input.body = d
	if e == false {
		return input
	}

	return input
}

func (input *I) post(p string) *I {
	d, e := Context.GetPostForm(p)
	input.body = d
	if e == false {
		return input
	}

	return input
}

func (input *I) String() string {
	return input.body
}

func (input *I) Atoi() int {
	body, _ := strconv.Atoi(input.body)
	return body
}

```
```go
package input

//获取GET参数
func Get(p string) *I {
	i := new(I)
	return i.get(p)
}

//获取POST参数
func Post(p string) *I {
	i := new(I)
	return i.get(p)
}

```

封装之前
```go
pid, _ := strconv.Atoi(c.Query("product_id"))
alias := c.Query("product_alias")
```
封装之后
```go
  pid := input.Get("product_id").Atoi()
  alias := input.Get("product_alias").String()
```



### 中间件——logger

gin自身的logger比较简单，一般我们都需要将日志按日期分文件写到某个目录下。所以我们自己重写了一个logger，这个logger可以实现将日志按日期分文件并将错误信息发送给Sentry。

```go
package ginx

import (
	"fmt"
	"io"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"sao.cn/configs"
)

var (
	logPath string
	lastDay int
)

func init() {
	logPath = configs.Load().Get("SYS_LOG_PATH").(string)
	_, err := os.Stat(logPath)
	if err != nil {
		os.Mkdir(logPath, 0755)
	}
}

func defaultWriter() io.Writer {
	writerCheck()
	return gin.DefaultWriter
}

func defaultErrorWriter() io.Writer {
	writerCheck()
	return gin.DefaultErrorWriter
}

func writerCheck() {
	nowDay := time.Now().Day()
	if nowDay != lastDay {
		var file *os.File
		filename := time.Now().Format("2006-01-02")
		logFile := fmt.Sprintf("%s/%s-%s.log", logPath, "gosapi", filename)

		file, _ = os.Create(logFile)
		if file != nil {
			gin.DefaultWriter = file
			gin.DefaultErrorWriter = file
		}
	}

	lastDay = nowDay
}

```

```go
package ginx

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
	"gosapi/application/library/output"
	"sao.cn/sentry"
)

func Logger() gin.HandlerFunc {
	return LoggerWithWriter(defaultWriter())
}

func LoggerWithWriter(outWrite io.Writer) gin.HandlerFunc {
	return func(c *gin.Context) {
		NewLog(c).CaptureOutput().Write(outWrite).Report()
	}
}

const (
	LEVEL_INFO  = "info"
	LEVEL_WARN  = "warning"
	LEVEL_ERROR = "error"
	LEVEL_FATAL = "fatal"
)

type Log struct {
	startAt time.Time
	conText *gin.Context
	writer  responseWriter
	error   error

	Level     string
	Time      string
	ClientIp  string
	Uri       string
	ParamGet  url.Values `json:"pGet"`
	ParamPost url.Values `json:"pPost"`
	RespBody  string
	TimeUse   string
}

func NewLog(c *gin.Context) *Log {
	bw := responseWriter{buffer: bytes.NewBufferString(""), ResponseWriter: c.Writer}
	c.Writer = &bw

	clientIP := c.ClientIP()
	path := c.Request.URL.Path
	method := c.Request.Method
	pGet := c.Request.URL.Query()
	var pPost url.Values
	if method == "POST" {
		c.Request.ParseForm()
		pPost = c.Request.PostForm
	}
	return &Log{startAt: time.Now(), conText: c, writer: bw, Time: time.Now().Format(time.RFC850), ClientIp: clientIP, Uri: path, ParamGet: pGet, ParamPost: pPost}
}

func (l *Log) CaptureOutput() *Log {
	l.conText.Next()
	o := new(output.O)
	json.Unmarshal(l.writer.buffer.Bytes(), o)
	switch {
	case o.Status_code != 0 && o.Status_code < 20000:
		l.Level = LEVEL_ERROR
		break
	case o.Status_code > 20000:
		l.Level = LEVEL_WARN
		break
	default:
		l.Level = LEVEL_INFO
		break
	}

	l.RespBody = l.writer.buffer.String()
	return l
}

func (l *Log) CaptureError(err interface{}) *Log {
	l.Level = LEVEL_FATAL
	switch rVal := err.(type) {
	case error:
		l.RespBody = rVal.Error()
		l.error = rVal
		break
	default:
		l.RespBody = fmt.Sprint(rVal)
		l.error = errors.New(l.RespBody)
		break
	}

	return l
}

func (l *Log) Write(outWriter io.Writer) *Log {
	l.TimeUse = time.Now().Sub(l.startAt).String()
	oJson, _ := json.Marshal(l)
	fmt.Fprintln(outWriter, string(oJson))
	return l
}

func (l *Log) Report() {
	if l.Level == LEVEL_INFO || l.Level == LEVEL_WARN {
		return
	}

	client := sentry.Client()
	client.SetHttpContext(l.conText.Request)
	client.SetExtraContext(map[string]interface{}{"timeuse": l.TimeUse})
	switch {
	case l.Level == LEVEL_FATAL:
		client.CaptureError(l.Level, l.error)
		break
	case l.Level == LEVEL_ERROR:
		client.CaptureMessage(l.Level, l.RespBody)
		break
	}
}

```

由于Gin是一个轻路由框架，所以类似数据库操作和Redis操作并没有相应的包。这就需要我们自己去选择好用的包。

### Package - 数据库操作
最初学习阶段使用了datbase/sql，但是这个包有个用起来很不爽的问题。
```go
pid := 10021
rows, err := db.Query("SELECT title FROM `product` WHERE id=?", pid)
if err != nil {
    log.Fatal(err)
}
defer rows.Close()
for rows.Next() {
    var title string
    if err := rows.Scan(&title); err != nil {
        log.Fatal(err)
    }
    fmt.Printf("%s is %d\n", title, pid)
}
if err := rows.Err(); err != nil {
    log.Fatal(err)
}
```
上述代码，如果select的不是title，而是*，这时就需要提前把表结构中的所有字段都定义成一个变量，然后传给Scan方法。

这样，如果一张表中有十个以上字段的话，开发过程就会异常麻烦。那么我们期望的是什么呢。提前定义字段是必须的，但是正常来说应该是定义成一个结构体吧？ 我们期望的是查询后可以直接将查询结果转换成结构化数据。

花了点时间寻找，终于找到了这么一个包——github.com/jmoiron/sqlx。

```go
    // You can also get a single result, a la QueryRow
    jason = Person{}
    err = db.Get(&jason, "SELECT * FROM person WHERE first_name=$1", "Jason")
    fmt.Printf("%#v\n", jason)
    // Person{FirstName:"Jason", LastName:"Moiron", Email:"jmoiron@jmoiron.net"}

    // if you have null fields and use SELECT *, you must use sql.Null* in your struct
    places := []Place{}
    err = db.Select(&places, "SELECT * FROM place ORDER BY telcode ASC")
    if err != nil {
        fmt.Println(err)
        return
    }
```
sqlx其实是对database/sql的扩展，这样一来开发起来是不是就爽多了，嘎嘎~

为什么不用ORM? 还是上一节说过的，尽量不用过度封装的包。


### Package - Redis操作
最初我们使用了redigo【github.com/garyburd/redigo/redis】，使用上倒是没有什么不爽的，但是在压测的时候发现一个问题，即连接池的使用。

```go
func factory(name string) *redis.Pool {
	conf := config.Get("redis." + name).(*toml.TomlTree)
	host := conf.Get("host").(string)
	port := conf.Get("port").(string)
	password := conf.GetDefault("passwd", "").(string)
	fmt.Printf("conf-redis: %s:%s - %s\r\n", host, port, password)

	pool := &redis.Pool{
		IdleTimeout: idleTimeout,
		MaxIdle:     maxIdle,
		MaxActive:   maxActive,
		Dial: func() (redis.Conn, error) {
			address := fmt.Sprintf("%s:%s", host, port)
			c, err := redis.Dial("tcp", address,
				redis.DialPassword(password),
			)
			if err != nil {
				exception.Catch(err)
				return nil, err
			}

			return c, nil
		},
	}
	return pool
}

/**
 * 获取连接
 */
func getRedis(name string) redis.Conn {
	return redisPool[name].Get()
}

/**
 * 获取master连接
 */
func Master(db int) RedisClient {
	client := RedisClient{"master", db}
	return client
}

/**
 * 获取slave连接
 */
func Slave(db int) RedisClient {
	client := RedisClient{"slave", db}
	return client
}
```
以上是定义了一个连接池，这里就产生了一个问题，在redigo中执行redis命令时是需要自行从连接池中获取连接，而在使用后还需要自己将连接放回连接池。最初我们就是没有将连接放回去，导致压测的时候一直压不上去。

那么有没有更好的包呢，答案当然是肯定的 —— gopkg.in/redis.v5
```go
func factory(name string) *redis.Client {
	conf := config.Get("redis." + name).(*toml.TomlTree)
	host := conf.Get("host").(string)
	port := conf.Get("port").(string)
	password := conf.GetDefault("passwd", "").(string)
	fmt.Printf("conf-redis: %s:%s - %s\r\n", host, port, password)

	address := fmt.Sprintf("%s:%s", host, port)
	return redis.NewClient(&redis.Options{
		Addr:        address,
		Password:    password,
		DB:          0,
		PoolSize:    maxActive,
	})
}

/**
 * 获取连接
 */
func getRedis(name string) *redis.Client {
	return factory(name)
}

/**
 * 获取master连接
 */
func Master() *redis.Client {
	return getRedis("master")
}

/**
 * 获取slave连接
 */
func Slave() *redis.Client {
	return getRedis("slave")
}
```
可以看到，这个包就是直接返回需要的连接了。

那么我们去看一下他的源码，连接有没有放回去呢。
```go
func (c *baseClient) conn() (*pool.Conn, bool, error) {
	cn, isNew, err := c.connPool.Get()
	if err != nil {
		return nil, false, err
	}
	if !cn.Inited {
		if err := c.initConn(cn); err != nil {
			_ = c.connPool.Remove(cn, err)
			return nil, false, err
		}
	}
	return cn, isNew, nil
}

func (c *baseClient) putConn(cn *pool.Conn, err error, allowTimeout bool) bool {
	if internal.IsBadConn(err, allowTimeout) {
		_ = c.connPool.Remove(cn, err)
		return false
	}

	_ = c.connPool.Put(cn)
	return true
}

func (c *baseClient) defaultProcess(cmd Cmder) error {
	for i := 0; i <= c.opt.MaxRetries; i++ {
		cn, _, err := c.conn()
		if err != nil {
			cmd.setErr(err)
			return err
		}

		cn.SetWriteTimeout(c.opt.WriteTimeout)
		if err := writeCmd(cn, cmd); err != nil {
			c.putConn(cn, err, false)
			cmd.setErr(err)
			if err != nil && internal.IsRetryableError(err) {
				continue
			}
			return err
		}

		cn.SetReadTimeout(c.cmdTimeout(cmd))
		err = cmd.readReply(cn)
		c.putConn(cn, err, false)
		if err != nil && internal.IsRetryableError(err) {
			continue
		}

		return err
	}

	return cmd.Err()
}
```
可以看到，在这个包中的底层操作会先去connPool中Get一个连接，用完之后又执行了putConn方法将连接放回connPool。

### 结束语
```go
package main

import (
	"github.com/gin-gonic/gin"

	"gosapi/application/library/initd"
	"gosapi/application/routers"
)

func main() {
	env := initd.ConfTree.Get("ENVIRONMENT").(string)
	gin.SetMode(env)

	router := gin.New()
	routers.Register(router)

	router.Run(":7321") // listen and serve on 0.0.0.0:7321
}

```
3月21日开始写main，现在已经上线一个星期了，暂时还没发现什么问题。

经过压测对比，在性能上提升了大概四倍左右。原先响应时间在70毫秒左右，现在是10毫秒左右。原先的吞吐量大概在1200左右，现在是3300左右。

虽然Go很棒，但是我还是想说：PHP是最好的语言！
