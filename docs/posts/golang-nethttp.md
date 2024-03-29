---
author: saltbo
categories: []
createat: "2022-04-15T03:07:00+07:00"
date: "2018-04-22T00:00:00+07:00"
lastupdated: "2022-04-15T10:17:00+07:00"
name: golang-nethttp
status: "Published \U0001F5A8"
tags:
  - golang
title: net.http三个坑的总结
---

最近在做一个 API 网关项目，其中最核心的一部分是代理服务器的功能。在实现代理转发的过程中踩了 golang 的 net.http 这个包的三个坑，记录总结一下。

### 0x00 | Host

当你发送一个请求给下游服务的时候，如果你发送请求的时候是 IP，这个时候你想要通过 Header 里传递 Host。但是，如果你只是在 header 头里设置 Host: www.baidu.com，你会发现下游服务收到的Host还是IP。解决方案如下：

```go
req, _ := http.NewRequest(method, url, bodyReader)

// https://github.com/golang/go/issues/7682
req.Host = req.Header.Get("Host")
```

我们跟踪到 req.Host 处也可以看到它的注释

```go
// For client requests Host optionally overrides the Host
// header to send. If empty, the Request.Write method uses
// the value of URL.Host. Host may contain an international
// domain name.
Host string
```

### 0x01 | Content-Length

这个和上一个问题类似，区别是上一个问题导致 Host 错误，这个问题可能会导致丢失 Content-Length 从而变成 chunked。
这个问题很蛋疼，因为明明我在 header 里设置了 Content-Length，但是实际却变成了 chunked。经过反复的测试都没有重现，直到在 github 上找到了这个https://github.com/golang/go/issues/16264
后来我又查到了这段代码。

```go
func NewRequest(method, url string, body io.Reader) (*Request, error) {
	if method == "" {
		// We document that "" means "GET" for Request.Method, and people have
		// relied on that from NewRequest, so keep that working.
		// We still enforce validMethod for non-empty methods.
		method = "GET"
	}
	if !validMethod(method) {
		return nil, fmt.Errorf("net/http: invalid method %q", method)
	}
	u, err := parseURL(url) // Just url.Parse (url is shadowed for godoc).
	if err != nil {
		return nil, err
	}
	rc, ok := body.(io.ReadCloser)
	if !ok && body != nil {
		rc = ioutil.NopCloser(body)
	}
	// The host's colon:port should be normalized. See Issue 14836.
	u.Host = removeEmptyPort(u.Host)
	req := &Request{
		Method:     method,
		URL:        u,
		Proto:      "HTTP/1.1",
		ProtoMajor: 1,
		ProtoMinor: 1,
		Header:     make(Header),
		Body:       rc,
		Host:       u.Host,
	}
	if body != nil {
		switch v := body.(type) {
		case *bytes.Buffer:
			req.ContentLength = int64(v.Len())
			buf := v.Bytes()
			req.GetBody = func() (io.ReadCloser, error) {
				r := bytes.NewReader(buf)
				return ioutil.NopCloser(r), nil
			}
		case *bytes.Reader:
			req.ContentLength = int64(v.Len())
			snapshot := *v
			req.GetBody = func() (io.ReadCloser, error) {
				r := snapshot
				return ioutil.NopCloser(&r), nil
			}
		case *strings.Reader:
			req.ContentLength = int64(v.Len())
			snapshot := *v
			req.GetBody = func() (io.ReadCloser, error) {
				r := snapshot
				return ioutil.NopCloser(&r), nil
			}
		default:
			// This is where we'd set it to -1 (at least
			// if body != NoBody) to mean unknown, but
			// that broke people during the Go 1.8 testing
			// period. People depend on it being 0 I
			// guess. Maybe retry later. See Issue 18117.
		}
		// For client requests, Request.ContentLength of 0
		// means either actually 0, or unknown. The only way
		// to explicitly say that the ContentLength is zero is
		// to set the Body to nil. But turns out too much code
		// depends on NewRequest returning a non-nil Body,
		// so we use a well-known ReadCloser variable instead
		// and have the http package also treat that sentinel
		// variable to mean explicitly zero.
		if req.GetBody != nil && req.ContentLength == 0 {
			req.Body = NoBody
			req.GetBody = func() (io.ReadCloser, error) { return NoBody, nil }
		}
	}

	return req, nil
}
```

可以看到，这里面居然有个 switch，当你使用 bytes.Buffer,bytes.Reader 或者 strings.Reader 作为 Body 的时候，它会自动给你设置 req.ContentLength…
所以，问题不是当你 Post 一个 ReadCloser 的时候，就会变成 chunked，而是你 Post 非这三种类型的 body 进来的时候都没有 Content-Length，需要自己显式设置。代码如下：

```go
req, _ := http.NewRequest(method, url, bodyReader)
req.ContentLength = req.Header.Get("Content-Length")
```

### 0x02 | WriteHeader

这个问题就更蛋疼了。先看注释

```go
// WriteHeader sends an HTTP response header with status code.
// If WriteHeader is not called explicitly, the first call to Write
// will trigger an implicit WriteHeader(http.StatusOK).
// Thus explicit calls to WriteHeader are mainly used to
// send error codes.
WriteHeader(int)
```

注解只说了显式调用一般是发送错误码，一般不用调用，当调用 Write 的时候默认会设置 http.StatusOK。但是这里却没有告诉我们在 WriteHeader 之后进行的任何 Header 操作都是不生效的！
这简直就是个坑。因为我们经常会根据不同的情况 Write 不同的 Body，一般在 Write body 的时候才知道是不是需要进行一些特殊的 header 操作。本来想着，要不把 WriteHeader 放到最后去，但是发现最后设置的 StatusCode 压根不生效。翻了下源码才明白

```go
func (w *response) WriteHeader(code int) {
	if w.conn.hijacked() {
		w.conn.server.logf("http: response.WriteHeader on hijacked connection")
		return
	}
	if w.wroteHeader {
		w.conn.server.logf("http: multiple response.WriteHeader calls")
		return
	}
	w.wroteHeader = true
	w.status = code

	if w.calledHeader && w.cw.header == nil {
		w.cw.header = w.handlerHeader.clone()
	}

	if cl := w.handlerHeader.get("Content-Length"); cl != "" {
		v, err := strconv.ParseInt(cl, 10, 64)
		if err == nil && v >= 0 {
			w.contentLength = v
		} else {
			w.conn.server.logf("http: invalid Content-Length of %q", cl)
			w.handlerHeader.Del("Content-Length")
		}
	}
}

// either dataB or dataS is non-zero.
func (w *response) write(lenData int, dataB []byte, dataS string) (n int, err error) {
	if w.conn.hijacked() {
		if lenData > 0 {
			w.conn.server.logf("http: response.Write on hijacked connection")
		}
		return 0, ErrHijacked
	}
	if !w.wroteHeader {
		w.WriteHeader(StatusOK)
	}
	if lenData == 0 {
		return 0, nil
	}
	if !w.bodyAllowed() {
		return 0, ErrBodyNotAllowed
	}

	w.written += int64(lenData) // ignoring errors, for errorKludge
	if w.contentLength != -1 && w.written > w.contentLength {
		return 0, ErrContentLength
	}
	if dataB != nil {
		return w.w.Write(dataB)
	} else {
		return w.w.WriteString(dataS)
	}
}
```

其实就是注解中那句话，如果没有显式调用 WriteHeader，当第一次调用 Write 的时候就会自动进行一次 WriteHeader，所以，后续就不能再显式调用 WriteHeader 了。。
这个坑逆天就逆天在你必须先 Header.Set 然后才能 WriteHeader，最后才能 Write。这个顺序如果乱了，要不就是丢失 StatusCode，要不就是丢失 Header.
最终无奈之下我们只能遵循规则，在不同的判定条件里分别 WriteHeader。。
