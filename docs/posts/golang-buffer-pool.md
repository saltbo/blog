---
title: "使用buffer对象池（sync.Pool）需要着重关注引用问题"
author: "saltbo"
cover: /images/posts/syncpool.jpg
date: 2020-05-10T20:12:41+08:00
tags: ["golang"]
---

sync.Pool可以在高并发场景下提高吞吐能力，但是如果使用不当会导致严重的问题。这里详细梳理一下这次遇到的问题。
<!-- more -->


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

结果，在线上有一个服务反馈他们有一个接口收到的RequestBody中混入了其他的数据。收到反馈后我们重新Review这段代码，迅速想到这里sync.Pool的使用存在问题。

这里我们在Put后又返回了buffer的指针，就造成多个Request公用一个buffer，自然就会导致某个Request中混入其他Request的Body。

## 修正

定位到问题后，我们迅速的进行了修改。 但是，万万没想到，又大意了！
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

可以看到，我们为了解决原始代码的问题，想着在Put之前取出Bytes返回。但是，这里的Bytes函数读取的是Buffer中的属性里的一个[]byte，所以就导致仍然存在问题。

## 重现

为了验证我们的猜想，我们写了下面的代码进行验证，最终的输出确实可以看到Body里混入了其他数据。

```go
func main() {
	pool := sync.Pool{New: func() interface{} {
		return new(bytes.Buffer)
	}}

	readBytes := func(src io.Reader) []byte {
		buffer := pool.Get().(*bytes.Buffer)
		defer pool.Put(buffer)

		buffer.Reset()
		_, err := io.Copy(buffer, src)
		if err != nil {
			fmt.Println(err)
		}

		return buffer.Bytes()
	}

	aaa := []string{
		"{\"data\":{\"pri\":\"IwtsnydXLqUzECkCxfi5WmQxQMoVSHiCT0NIOmkqPO\\/vhwb9uez0kkFlKuCRTvdeNpM\\/LE0tOCYxEB9DBVGqj4MZi2QRJuy0wQq75637cX9fUe69zyzS0dFZGcG6robTXMhBqykgbCn+aEa7wfuxJ1HEb7SZZyaJpZv8D4ztKC4\\/Yblr0xBVLl0Ltw5UJ9aGHg7JpSWZvmLuFTQ8\\/GwAdjBX4yznE8GzutTLWQrETLHdBRkx9y3Vq8Kauvq8QsXbVSsXqcX2nMn6r8I\\/TOHtAQRQwDSTfoZ5TOkz9ZckxPCgku8b2yhgQcALs8VkfYN0iZPA4L8m+Ed2WJsAtare6A==\",\"fingerprint\":\"8WX9JP9l1ZIVwUNgTPCu1\\/tKUTOGn02BVtE+cSDB8Me2plhZVS6PG+0WcZDY3D9jFxXvTFjWqavqjSP52QkHld1mQd+ywA0q9ZO\\/+6rq4Qu4GO\\/yW5sZbIZns5WWGo1+O3ubmIPK4Rv3bjxZ4Sz61UVtq17KWog1IOgz7lzy3DvamnqyC+ayr39v30EOj2xAOMjS7M20jU7psfgeoBrWAYKkGdS7D9FCcDtoDXZa5KW7aQxZm2pH6d4z4e66ag7F9FzrCptXbty6ZkUvWJ7OC0+JcTtzaZy5z6ftQBd1nR6XaZWAnzaa5jmaJtAfdQfN+CwS8l7w9ZtiBu82PA2lC9EyZZO\\/HdUmOtarNOFRs9S2O3vRorv96za+laEHBZwUIXvMQ1YTQ44cK9jFoLQQohWpnXG9wIGKWhf+N1P2p\\/KVbREkgWp+R6d4fPpHZ8pY2S63\\/15brcgtrN0bGiLFlJe\\/tOnwXJTAKvm42LfTnEwfjdoynkBXvDmoP0hKcFCqUN45\\/torKKx7KQgvROrxQgQs4DhR7paZ1235qJ5q1HHBoMqlqCmQO21kg+P5sLs3pT6WOTTWB+YFq2JAgvuBZmSDiM0O5e1BbjS+O+XybsdVm89pH2wRkL4CWe+zAoI4yoCfrQdnGk8l254QxBXMwN1vj\\/zezxj7Q3g7riiMDdTw0jeMs37pnLdGLutYabzY\\/LqrCkDxc71t5+kVdbt8HcNi6OlAWKq4oPsLhBet\\/ZHTEZVQqJxeYxySq16EMxX5ikKlyA2eUGd7h\\/4oCwidKoZYwJj77jZ60JsrNPdTmNYR2FbbsXgMvN3WghSC6AbpYiOlaMH794rbFwCMoqYF9S5ETUJLXeDCi4DOBC5C0zbwFZIdPZbJzg5bXgxyLWt7+SlKyQLdLEm0In1Fw0RWV4vB5vH0gA\\/g3pZKQLaJeURUA2gXKuDvPUWNR5cWJQIEoQXJpUOQD2AdlWzzQzhlkcT4hHZttwicHMqsopgGH9xfs5PMjqjUHbeqN6Whne+TxLQmVjz94YRe2V3ctxiQPyzQH6MSl1VzkoSQ0Ni+K4EYCHtVMA\\/N1KNqsqWLA0Lwa1DMNgQIqkhQkBE+bORn\\/xtSA2CR6VAsxGN1trUv27RqN3nkqITddSZg7lbBOWupTOwNdMBKimr3GnWV1e7h\\/JwkmDHWpyEfo18yY3Hu\\/5Lkdg25Mzrete2Rr8ZXNzfQd9lNO+V\\/1TrDMWM7lYBykKT2iEGYOd\\/DC\\/iQzlVnBzY\\/04CfNLK3Q25jb2VW+wL2l7DlJRxj4qdxeJv+wG580gvA2WPnR6FPMp2lbRS6s40AxPGEmLsy5afo1qEzwGs3evywDffsUdk+Sz\\/fXoIK8kedh1zcgGvMXXFz+EisN6BmbULok+khhIlhZ6+2Upt5FxOMs0BDaYnj9w5mxm8FUtAVr0SeCzmRJL9HsiFWOjD3aVRkq+a9C7f\\/Lj41\\/Gxx422d0ESjn+R2S0EJQT2SyyBKFJOoHcpkXekzglAPffDQ40MeVNlbCkNdcSvwIM2wmqXqNj79KtYRVkL7UxWDLKY8Cn5Ohozm67ITkK1ezm070Ga9q4l5n0V+Gf0SM64K\\/ZPauuf7B46Lz8IrR4pzthxLWoF45\\/pUMLxH1fPcZ5aeMQLRPnxUvjtFG7iifQmxV3QNGVDaezAD4HH6F+sbCBxOBDl3lAOkEh6XF0Jtb8RlaCnowt8u3gtah4IJjWBGouRhXRHO2U8nqxGbXGDGz0QiumaEFsGVzzLDlO01Zi5ZdujIGI9LDs7nK5EzNXvb65go8o1GxU2y601bWBgeDPAY9jqdRQvf+B86BMu0PzgCwM2NoMrse8OpXkleq0Wdr6tTwVyIWrKfbsEMSdgIJCGLW0WB9n0rdpEnb\\/nZ7PGAyuukszYpz6a2oc1PTDznlmahyhKEOLUZBCLGeipJOEpng9DPbLyLVH1lD3f8E+fqyczFjvBIzESyLdZ+in3XGhvp2oXpqbCMwfo8bhi4\\/ALtN9cpu3oAVR5oZkVL\\/pCUFqr1kFOvzQfhKbWqqmVDWOLerxA7CC0UtUVvodFPuWBB\\/FymRYW6habwpAVrXJOuzkjFIg98Z9vwON9w6FQlN87M+ela7SejI3tbb9O\\/qE3QtXoGawEC0le\\/YWBPHCuTro5eaXioJozl\\/K9jOrAPNmBK6Ngw0nJnvvSFK+Kgurk3EHhuxrPqBZkC1x6FDoDThS3DSHdz6BbOc+7Fl4b3P3MORGe2D7wuTC4Xyhueeu9W8+WxT1EO82iT3WKmvW4tYbafPx2uS+0yMQoeP0l2\\/Nw7UFaUz9Sjpxk\\/OFnCIjCNFaAoMZDiIZyzReGbnF\\/WLCMBDxVg9AlQov3ZgWU3FEAbws2yn1oTrTUQh853Do0txb1TSd17zRI2SDu2lhP1+xdm2b5qVQUgpl4igLFerOX+F3JMOCUwrKpP\\/Z0W2P79CJCYqbiJ49kwaurIVF\\/52YmOPbu43NFBS3wwcuSmurA1nzxmR7o8JVT3PyAr1GWroNOuoB+dmmfrj\\/UqvPrhlYTFoBjbx3iu7A92VtsbUrndWH59W4eC+QoXsFRm1SEg695V18aC\\/Z\\/VciZs73pHY3E5NAGMq\\/8f5\\/AaaeaHCCWRJDzTLMa+4QuRQPMnMSJhmTFXUJBQBO1Kj2zunCKaeXZh6tWzT1REsjdXXsRFfbEbTOZWkyFl0rPacjSa2S+xGNw6vuYbI\\/lGtjdqw+ByxGdc4Cd4nOLT8M4Hxjolb5S4QMPHFkQ2pZ\\/tSfJUzNdo5nKCun0f8c3ewsxuTVo4+CJbcMmkV0fSDXQoZeNAy2eU19cyGKOqSY2\\/Vg+PE5wy\\/kKDPN4sTD5wClzffT\\/yyxNaWCr+cbS+4BoO\\/28GcJtVnLJhTnjZCBhGOCpFlm5TQl2rg7XT0mzGOnwFI0RkfGdlof3rAMwVixmZWbPiB9JfktR0CZTmpIZDFsjq9\\/hPKruyQtBVN1e\\/WI+8V1hkfC9lscnrWtHediM4xT\\/z59wPVT11n+RXRzs97Ka57Bk7oLCP+yqluqmxG3e80FD9lcmVgZvWHczjw3MU1Wt8SyAUzb4wsJqZW4C4c2glsu6+p2yZ\\/4S6B9aAIi06tkC1UFRFCMMTw+drcAZfI1dMfuIRddN+2eiMr69ily0eLNhXZSse5rLKvjQg4Mz00LzxGrvzuW70RrEPl0PQeFHWoeoKFWCzH4LpaAi4WM95Ftyzva8lZra9ixn6a0qClK+tvsCM9q1NnlMcpsNnz1NTR0c87\\/KD00UikqmZY9J\\/\\/vKDzTHSxVv0DVj1hhqjqtcmek6nD6Pd1KZ9FXD1tdCLYQZe\\/PesLZUUiLRQ47Ft3ox\\/UzavDfoxySMqydA0hrrrJr7MSTfP45u8tHLnAMX8A2V0ePwSr+XaDjL\\/qfCxQunlOU5WtndNRqgCWAS3WNJuke\\/8P2YLvCrlBpjso0U65HkPkyF7GxjHufGH9HPbibkqssYnJP2eqlkfEuNyPqs34EWiVi3htk8CoE48cUFzHf6X48nydvZmmFAN4kOiem2dTSxT6Hh6o6KieCEzwKO62aRgTgllq\\/8VppmjlK+HJ8gbBbPw66mRAQeVwGpVFRGS0EMEvjqPKesR8yweHnFVqWzGQThbOjbI9hJp0O2JSqgmKQ1\\/\\/taj9MXtIXQZPNKs+67I6iAG\\/pP74J2sz\\/mISGANHY2ABiqwkn8yt5+t26J587C\\/UxB9ckuhsbjim+Tpu2pYcu5qOuR8emsXiNGpy\\/5O6nuJg\\/jsxV\\/LYstQnBeTHtrnL68IkJ60zOBBjaAuHvNSgs4H1II5stojn1yO1\\/PMH9R2njSSMSsbo\\/wy7x18UJhiGI4DG5kEElS5\\/wqLsWXlJzo5dWlTnLh+IFD0qxzFlnNmv2F6Zq6flQDc8ImeW5fyIhRjz56H\\/+ETOKxGqD+rhba7PcUUVaP4fD1eK89iR65PPkQv7iVmAW7azC7jjFKaY9EdhHwfL9zKiq57snmQIMLjnce5\\/SwYofPXdOeXz6fjscyLNQt3vtOadz+11fo5IOlrzbqNB5TgvauZDHZUWXubGo977qbR5PYNRdpyrdLPpF+cmHdR8OmXa9U\\/QyZv3fjpgePjXq459HoDB6qdajQ0vCxQcAoUnVxMQq+DVQFroPFHJjdjJJNqTxmtFxil\\/XJhf3ZIiRWoNkgvP4z0t5xCU+ef\\/G+QAeVH35Q+E5yHnBHLbDf3BtqvTRxAMkN\\/XFJ5Sd2TP6CSHr6LmACP66qDtP6UAmO9B4ucqnE5V8kfU3GIBZno+yPI1OYlM0Y3ONDLPyqMHJRzy5GE2AJyg49xcc1rRU\\/6ybV5EaBxiSFO4p2SkhHFVuQU6mxB+Br2FL9Xv6y\\/Vyna7jxRIf6k9bak9Ff6TUPGdXxGTjGHLsXLA2SYEs69tGrDyWzlPRg\\/x77et7gMUYnCwPaZQMcQCmM2iH9E0Jxh5eK7pidAxQqxlrdMdKAkr\\/\\/RRvMqoYWNfxJVHfRKSIagidGroePSAdIJXmxFF602wRSAQbGQvkUhWHv9iTYK7oEA2iegi9yQEva68xlnyK7ZSQSaE92CcvJju0cgZ7lrrbwPZ0iqJfly831fP5C6PeMOlja6UhEfxQykNFt+O0LHt6WYS2qV+InU6stgSbEVbAHM1gjp9tvuHVOYrSf\\/YRidVUitA6s+a72Zhj+Si8LrFPe8lRKXavMuJaZK1mckKWkyuqYv\\/fkAdPbPHhZEohoquuLH2kokmgaFqAKGIYIuXPLS3xalOMngutJWx4S9lWa5TZb2yjY\\/Qu5i6TkzFNGPdxRdZns03Vr6B67hxK+bXqNOjTzM0qvRvJTwtovJzQjR188K0URKO+xagx6tkzKA5QAFB6dz5\\/5EQOrrDpdEBH2Olq3VJVBmrWWTeqMHwHcbUFUuD7Aynx9GqN06bhEzn\\/Bv8j6Fpxhu3uEoSgsCRvrRCLr86nHnakpygBnJyxOn+hO\\/Ihrm6ko+X4ca0MdMSpQBKh956x\\/Q5jQPy3CPFRA8\\/jTWL+aQQ5JCZgdHZHw0\\/tOHJNb4unafe0fnIfdgyM95gpugfrzLCwIJd5OwAeeyQhKTp6fAvrVemJaqkISkGCoOnW9vxQe1jPGRuymkAHBtTYV05JTnRq3ppfeJo\\/XJKHG7+7\\/SsHJAb85sZq75ftxC8Z6\\/yiy6SVL8btJ+ZA0eKcXMgqpQqajrEdYp7JwYWc2biPtJe1I1H84HyjwGXBxYKuJMDzmeKYNHLYmYKl7KT\\/4V2NmHt\\/KeohFw2VpXg+NmlNsecdn8N18jROfq381IajSWxoR6Qv8V9tiq7NJMhUVbZopouHCBRWdZdqrEdgTXQYnVn1tZ5wwoChXmXWY8W0PcdGCt9E6fJZUBrVNM93YKbvtphQExwPE\\/0NEIQqI3EN33vTSWc+HnBglQgUkilvSRD5ph62\\/88gsg3EOwr+S2tLXZUnHxmKlCtSvmOUg4XDeBLbkTXn88N2aJXV\\/y4NHfTMg1I53Ul1roErgEf2SKyIwUSF7L\\/Srvu2vEjLja+8JdkUL28+5Fn7X9Yv7v6mJzeyTijhefJQMEgi5nnKSUZTHbatW1VI+6S4izJgvqnnjVaK\\/6UfxScDldsKDOrqnigq2P8TE8KPSyjJD3pQV5rhVGepTmkXTXPp4CcW8qpPjxb9WMY+sDfqALv2irpmnnzczZyUQ16838dDXia+N8gWIJbsAiVdYIEczx+BhsGjMo99eFFhw1n3ymfNu1STlFpXk8qOQyy90B8Wk7sEfi6Q30WeXHi1KaG0RecjGO6VtSoDLau633CCBqtn5uEG+O4w4sbmYwhfPUvgmflh7\\/WR9cqmMC2bC9\\/AcGgus5o3P1P9HFBHQToPfhsEEr7JGYp3amjVAOK+TBKuxXLtKqrrCF8fusDJ\\/c5A7cDUqTiizotXZ36Dlntn6Lu4KAB4IwGKpaADBFa4qEyw6N7hCgYc4nQcMqfo7NvnodDOSYzAhff0xEjf0JrB43r3e1u942F\\/b29ests8oWex6xh874vEJqG2XS0cTYkuwcoQ0H3Brox\\/amqlUwpnMpqjcpc9QUJo0YJSPhgkDzKYesGZwprfmL5uYyGhgiAFqngUXyYFhRzd1qI+Jefi7RqXP945+mn4kIx5E\\/ihl7bHFlVf4WjliFV9KnpHzMYsB7TmrWkRyOIGm+bCOvcgIsCPvfPldzhPvc+k7WS0BE5doQL5giAbyWblc\\/n3Eo5BrubGtYZBaCJUfB8k\\/SuuoOfpF\\/Hqx9V\\/Q6ni4LqyYlDaznL5RcZ0ov1s0Lbb2ZU14Q\\/XsbrfsQRhECFRWzB7bqziFhAHT1lPLGfyGAKbcWR4pmmxnikF6lV0MKY3o5HDRqfRjEjO\\/YzyGHm46Sp7AqMtnKZvPSIjbDMczsrGTaRX5JaLN+6gu25QinnOURaM9ZJ+UW6S8W9czcbxBu9KPHfU+k2GpQnYSkm71Y0fMwwqR\\/gC7FkqG4+8sK\\/5ovFFY4NEs\\/iIGlhUXhVNoqlWFAHeimiqdGcx+YYJAtGNnbI3C5o6a4pPOJ8YQhr3j\\/w0Hz+plDJuhtb6b7PqkYHOLPMNzsaMnu7Ky9iS+qbYLcEaS6Op7WHfy3+\\/YIjLm9gnOlcKuZT0MTgx7OpTA0lbDEt2ztyZhMeEegiFxTWdyhZkymXsSIL8wdvCwzQUDfVgpYZ6zgJFesofNxVKN13i8LcrHQjILSQCHHOh5BB+VCgWroY6Ph+2Q3VToH1mEuwf3GnLtLw+DeF7XTWDMU\\/x6mF0FOnaANbdnwtrlb6nr2QoLZP9t0I87F1ZfRgb8ISFVkcbIxWI9dJzGTY\\/NApQOvCZtasoyCcLJlKXYPC+kf\\/oysXmQWXdvVpqsjMGgWjcAaW4oQXcmsKFcyG5d0TNFYFdXLkG9Lqr72mqcZkcFzdGU0LayBr\\/LGJ\\/3h\\/XdxnCoHQYlL2Q1AbBiLzyHM1eb\\/JNrNsxTaY\\/fgNFwLzGZwNCk\\/\\/+Mm2A496mwx9xo+xRGdhIAsbz+u7bPoMQjblrLj+XR2x6q\\/xTXzNFm7FwrWbRHyPUwCmHiBDnKyQ\\/bMd1RhN\\/hhJejeXbSfkpcQI2gHwBGqvAFK2LvsHA6or53JSuN7BEya\\/6BIrEZsvie1T8zn6sKMqHK6e5gqy9OnrPH4KFJXAPZ6p5KVIIaferMc4J3iPr+fmBhpiUDnA3Rv7KdGhDmRlm199GpxBwdTsT37zUq\\/1O6KpNUl0L+qZErDHUqUw0Ghex41BpJPRbokIHNCsVLW51uPeMPzxl0M+ZO1T9di23An8VUVc12gMWMLc4t\\/RPcX+WZmR9Fj6aipxCxQqjdPRf5mE+otCl8DCZEIBxtniMPB9p3uBWOG0xTSZolhATM+jBKW2nwVEnjOXyfZm1N+gQcrWogwSw41W8uzzP7\\/7AvRZ84MdWsNoNhWb0\\/n00JYvI0YOcZ4eJLfUhxt+hbDyCZ9bf8Z3KIJe4hWnPpulfjBR7rgQbq4UPn9X7A1bo7YGOin6QmFl1ESrIPb76wfouawa52G7cPEjPAwG7I7+jBIQebEF1NVuJXWtDHt3fOTcfzh\\/6Q6ETagmIXOJwUM4y4YHIh6Ur1RlC5zWuMRwXh6qW+L\\/T7wUdWopJ3VbYtAt\\/BSkzB\\/noB2kYNqtyD+tSAFkfr9SJEt9vZaykStr05XGCD\\/IPklFXJ4\\/pjb3aoiNTnjd3uAmwlf38ixmUSfRDofV0gCJggLlWJ03loBdqSLPxbkErQQEzvV7gwCyeAXYuMgNMXnGAJOBY5anG9J5adhkzAKnnXLZWgQe8Mf6H0BrrmMcRvPlNYk8pX8y1CIucjR2FAEm0AbggtWu6h3GDhmFsRf8wT4B6tixnb5SabZb9pjEtOvuMAh6gSWUY67C5kz\\/ZodNi5Xwm6c6QFgGgX28SKmNnpFl0ONUDNGDJumRTGvbn2qZ3JkFsGbVX8C0d2H2VQir+DyCNlb5ccmbEY\\/3X1B3+lTAJ5njTiSkiUzTwdzBMWxJg8CsR\\/t3WbsstFhSahJtFk2M6c4zPnrL7OpzaHCqNSMtDVFso7AExG5LbVpwoBQMqwCoI7NJ8V5hGBo+6i0y98H8BSFOjI50RzY113tHUQJT56gO9BUmN\\/cDAf\\/9TAG1ZmlHWxgPsw98Frd\\/9TEx\\/Gg3qVVmTYX82jZ50V3nfM81zMrXKCnnur6M5+Kw0sC0j9HO2zVrLIlOJ6ZQ68LURSL07A2a2CMmr1vfRgmdMcuNyO0Rk9dIHDblBShMABFzYWt4qtxGuhkPfUwkA8tR4Y8wOeTYjlsE6RB3MdyGyPyk0I04E3Ymta0i3wzvqanL5f5fVplhaaK35KdpKEwRT8PSvRLLbKG9VTsDOfhMl7\\/wTHZuIriIl2Bo7VTc3uVDGsndhXuC6qJfviPqPMshkTuPF+XWfJErFzqTksBx6vTZUSzoX87yJ4vAAPhoVfFidykRdwq6pwz89e3pdHsk7q2u8rubwd\\/\\/DThIVP9\\/pG\\/sRttaHTSrxQNeg+Qta+B5Jv6n2A\\/MYH8LmMPQIgDlmOx4Cq\\/+QzzOi4JDGjS9daWEDSNLhD7+SmWaYWHfnANbX+eHG7758AhGWbkpnBwsN33jVXHUgOJqaK0dcfNncyEz66JFH\\/Y0gQVeDvewwRL2cutVONDN+9SVdvoaD2IvNVAOSGa59D728KiriyreftdtkBpWXb0oMFLhnyU1sDieIcB+NjgSRw6VhA8ITXhLbFChtRpX6jQIrCE+34XC8c1AM71nTcbHqpRD0owxBIYy0jpDIL1fo7rDy3yqrBkIC8yVj9oC7p\\/ge8xbC327xlqKctrdt3Sqhgb1OCIcQaV2KVith09wCCeUL3kaSL23QyUZSDnEC5M+6RpE3BXk3ijsmpNN4zLqbaBgSZHsfuHoFIceS3W9NSRnD4dJyhNGHVqmUyyWOV+jA8neY9T3ZJ3p1FUX+P\\/y8jkIyMhW6ZgzC1VuUqiV0CPYVs5FI+O82Gs+\\/P9nFKGIS+uaaBTgzTwLbj+WGqj1LyTao8kModRKSoCtfnm4CYnGR5TBFMn\\/UYWG4cpJ\\/4EDdNydm02A71rLLvQY3ebv1cYYYgnKkx3STDjo+Zy0gd3ck5baE6l0qaUmUBikv7ppyw+zQjIsArB4r634vfZN7sfjs7gYZwbAhwATJaJUQiXTz6ahygpbFTO5uQULR2h3ZmcT0Dzs3mgiWSbvTspNJjtOCU6\\/RCYlpX\\/IHqtA9e5ylHl3103vS6Cb7Vqk52DRNKQUJGNoqBhWsJyPfpmXFahjETgWqLYa3K4hj2YiLlaE28HyBbTgrk1jBWX0zocVNwIDAiUry5XkFZPdtj7iVpvqbwyHv2KziT2jSYtYgxQJvCVWzoRHYsQe4fssnaopu8YW\\/hXTRHzl5sKLEjhTp2I6QjEtUQBIxHZ23MFGjtLUusV0CSwm3iOrvWrliyZpGYvkePVQWPBrORtTXMS9RxAIt4FttLanaM1+SGTfttyuvfWj1CAV8u4dsKDMMvP3TD\\/ehV2XioAQtFqYQir3ioVX3bXV621NHbVGrRMKGFL2EtLb7HzoFj4OnWH0JPClLXqEyzq6FnRDxgyuMU1RN\\/FV54xlpCM0ZgDSjhVNO+l7k41t5tu2kOQjLLp7kihmc5BMRs8qlBidCW+QAEy1uNDjZVKj69aEIOqLtCFe0V1+RO7jfgVCy6cVCKxbOg24Dhn3LHmOwZV349qZZGanrr+H9cKcrUPMLrqiou0SMg+1sx\\/1pLQ8IjfJjkfOvlMco8FQ0VohNvaEvgTZ1P22\\/cB8e87NzaPo77CPPX5sC35voUO3ayYBwenkfc4goLY5UpiTTvII34Y5QKbOfm8T\\/0N8Kh4bFwI5aBL5nlgaoJPmlXptxUTpBFF6E\\/OZt5EEx6kQ7RtRArxTiF0ImNZpsTnY1MiVpNRX3yrG+KhFYwx126MPC6rZ+4DmU5\\/Utdpo7Sqk74EJNfNWbp7Ij0cMZciENP\\/9\\/tJOZZfJ0be+pfagSOWsbMqNSomMWCb66YNTjKKbZdBDxMDdSivK17RpFH\\/8H\\/z7X2haNNsckvMgRmYecI71l1o9y0YIZ\\/0zv1J\\/DBgtvZnNSgCMj8HudbuuXiDBW3S0CAWkR1I\\/+q+MtLtxb\\/voTmJ9P8tSW236BE2Xq9Yl5Twj5gl020DA+ziMmzx+oXe95CV6dUSEvrYOg21SZz4jtz+bU7+Y0tZC3ttNa9T0Th9yB2c9wKbfiEzpkSgqspmaHvTqGV7LPjTTQmqDkAMxJEq6066wFzRkmaEvzkvV3pCK6\\/y2yJVYTvpMgiXQvRFUiEOv6V1hWDQFnnSjXVx3b5WNYgAk738\\/c4y+TAErs\\/dZ+1gCoQ9wm+BPpxzbUCdSKqPEk20CbNsfGSJwNMgMBT+CXs0yoxQnXzInFdmh+s4OMH\\/PQBd1aW\\/4a+S+tRnFxOCGn4ujoB60fbLmNqzE6tTMiW\\/M0MH3ZRoBD9FD6pFlaWXJotowtgTVhiLxDSz1lVh8TmuRz91InINasfGdjJryaXhAAQ5EgL\\/vuRSZAQ\\/WcyopGd8SMgrX6KdmEWSykDKNsK0P2n7f68Xo5MuN6FYPP0lskxw6SDUnUP7SojCW9Rd9j+elt8jMkQ2RY0tEgVpp\\/cJgM0+iWfmgNs+63t6aQp5qj+h3AFUdD3J2+FTJb+uzpEQQYHKJcqfr2Lsv\\/oiX4hvzBBL1Jv38BcJ2F0WjL1aL6y+kW3CAX+dplNEdZapLqPtdJgR57z9khf\\/LzgeR8bW9c0EqaPrmGNQ61VIGrmeQiuUWrnd524W7YOrFDvf3C9btJZPWX5wEMzqpvnPYvVD2VF\\/DNKD0otgrERY3EOz0cSbCpo8A8TLz2g8zIX1QJBerYy6mYavCai\\/gT7MHoKn8dxAXnj22yNvg69mujwmjbGvGCJf1UhRPipntDwGy2d28k6eHHvA8ClCSq0+iZJxFcriN4BluBryFAojD5yjkCf0UcpmkGi57ysuZ2j6aSoB1OaxxVzruK87IUplEx4qKJfYHBY7R6djzNT\\/3SupLMBmXp9jmHVo4jOw2byM6gehTsGP\\/feEuEpzCBGqvca+\\/l7+PY0n6WK32\\/kW2HDuz3UDmFwJ9y+7iU62P7FErmioBc7erIa0QGsLzwLc2Espc1LG2ydeOwT7koPiVJoNofSXOxO41DKBNSiNxbunkzzE4JmvQHJWVAPFdCXoJRL0b06Hm2tfreEXcFRRAY3coG4JNCiaSWP9qFs5HhJCsKp44432ZJi4ijPsetKEYRcbnqb6dAEEIcb+t7teRpvkYLgJ16h0T87woCHXqBXTl0ljS87Cd0tYgWz5nuXJ\\/eLe1nt+oo7gnDsW+B09Wl4\\/FMU66u+op+rZ44GJfAE5YCIDNOFFEiMAX8\\/zbdIlegMTshrBDabNL4GXemc17XkVyaQ+BhWUS6CEvUv7RYNt7B83LW\\/M\\/3oNChvNvdiOofBkKt9Uqv\\/qS0JBr4XxN+mf7TvnlkCgJGc97ZrSRQldDRSch3XArytK+RM2a8uy7ON41kTR8G697hr7c144Ll4wEsv7wzNPsdAHn1fFleqg8cV4g9gTjf3pAtUir4lvg+t24SgS7S5U2Y6Rcb+YD7b64cDx+zgJ6fzKVTw+UVtpjISsnvzkDHX+FNdNCZMrav9Mg\\/2JHhM8Os2vAfUELrKJ6twIil0e9jf5HwOiWhIiHnq3pm2x68OzU6KvRPvv\\/QXJU3pcCPNY7FowJdZBkUoAMXDpii1qVZ6AxzS4Fk7h+Aq+yxfO50jqLKqgPmqBhaoGpaYBn0KzLBNcPf3WPaC49VvW8BwPzA02Ys7sgqKqNiFOOwiOe03pXRoTnnX12ENZlLnB1yvSCOb\\/KyzfEiLK9J0grsKtB+jVzB+lSroqETxi5PEJYlMZYyVgr7KwITD7kbpD+BqRoax+MTl5U2EwzKxgJV5fqWWSFSuxZUrsnd6bGvU4W2R1qhK2BdJahI3oRgf1XpNh2BmIvEOwuyE3SyR3P2mem5ey4YwNXV9MKWsIVLgDm0wBiPwG47SBoPeI7RbyyPoQkhn4gg1e56FHdTxl4fQ8FMwgtb1o9NU22Gi+23nvIv5mv2+QiWO1TIn1+h0Bo3k9BnSW3AOlghXm7THz3Tb9laVzOZoYXLlT9wSLIxr8oAx9pgrkYwm6ZQRsL0DHgyEyjmkl+YTP8KO6N0m0afQYLaJxQ0KccT2GR1XOJql97nJRcrMGl2ukAoPODxKB1kZEx\\/UbXbRV9jNtK+z8NCXbxtThuN3ZVG2EnDhYzvR9jKLa4sPofcGAMfe3I7D53ba+4e\\/WL11fO7OjyzIDz7KY1npwGW0hB1kOdjFngndB2piYsUaesffZdF0cmshZfcHs\\/84O5dTvxYHJVuBk3pUtJ7N8M6WdMd8IdAk+ApmloRbgjktE5g9qt7BQzPKP+BW6RBKbttjdPN2cjDOlfS7UW63MZzH\\/gsXxXtFDCzzUKJAPDwOtsF0kATfFQh39xOavbNklJrVX0QBq6vUeMxI3AQcjSD1QeKbOjena46MjxpmNWJAVulv7VZxpQzSIE3uNGLZjhy89WYodX09HngtqcE8Ln1xLEm68\\/0YtkLDClzDRab8v0jh63H7I7HbybtanVaJgJpcdJJBgxeGT0b5Np2h7fX78TLy5iqV8eo9oO\\/lW\\/hnuB79NINJ2YmEeb+\\/C9mGJGPDAy11V6FoRgmhZ8zu1Si03xjDYsRFJR\\/qQBMHDTD+ymrbwn+ahap8y0VyDf4qUeTUWloDm3F6AG58VSTJDZiXRfEyzhjjuJmjLYQBOjeaDnlKQAUWYSlE+5AX40N26rzkQzAOOY2YdS+lS\\/vM35QimRszC2Z2m4QHoYdiZymW6rOatbr9F2hcFaJ93zYQarcI4B2lsclC3qL0goS0kBOuhMH\\/Vyk+LHRKe6OQR7CjW4WCbnLEqcSXk8Sp+SM4\\/8MJbLUY0vC4Utmf988\\/l9NhQ\\/crLDPmCyzDwNhUWiPB3NV53NrarSJnQch+wUiYUxHu5fnTl+RpKdwXrWEw4CQlipKfOJxOqFTRGAD6q6Oo+l4pnDd1\\/kmZDsG1wlO4LuXqRCUypRlCAFtxLBAzu\\/1F9v4b1TbkZRRYcmab6K8SOh4dhgl9FxEeLopzag1tVhvfQdkdVTGfo+kLKOc79BgPstcI6yC6I1m0Rq7BvgJir4UKMdenCA0Q6\\/uNy7nsw7W8yhPlDOBYwdrNLZNN4VRXZhMCqbQ6Tf2EKrPH+KDneoNkhRTPTOotDYO9ryRrO6Q17m3lDsyYXIkoq6R7Dxq5G6zl4lPJfzqVPwf9DyAMxhoQFoUna\\/Jpv9X\\/3pka9\\/rEWqPKXiDQVGm57ZiVCGpyyaN6rsr73PK8alPGKLwoj30kY3wK9ig4bB+Lm\\/GUtWwlDylAoujLBRiUcXqcywGFqF7JHzoa+35K+pp6AxY6Tf7H8Y04RjRVwKi2ms9b0y2MwmPa3uO8W0gNe1xVy+c2VlkPlPWpNfcVe49498IxlVZhwfETFrc95Lq6PbNfW5+4F9RNtaK+ouWzcIk9F7\\/3F116U+5wCEiT1khZ3l2eaNVUgslFE76imV0Zkk8yka5jyAuaWVPkknhUnx\\/NP8uVz6OcPtmvdhbnyR3uUAmuXtMJ7Vm3fQC8JZuAYCtaY6Vq2J2SibrErE3H8w0qJMXZM4aU8eJ3L3U4+Z5DjVguZL8KeScFZ7fmcK0tLycgu5U+jChdEvk24umEUi9QddBoFDgGRilg2ASC3DAPyIS8TCJmPd4Y2c8\\/1\\/sjhrXq6ODh69OJy\\/Ehs2+RASOkMJ7NHRxlsnyClgWFxd+Q0qgZxGf2\\/t\\/iSSxoGcfraYtjTm+Y6GIu2qKmsSSgbyG7TJZsRF0XCj\\/PNfrKIeTjjEzUtzyOYT16t4uGR7jEFiHXNmCpeJCuw4kSOIL2zHV6L7RUtDxoCPLxxwYdOItlZYM9lIsH4e2j5dq2Tv5cZ+mKLOri2Js\\/Q6x288N6o7vkZM\\/2EMERh8IFG\\/6Q3vV5SG5UsXVyfoQjWKsvAy9n5PKxAolNitG3jKUNgPohR1sdyl+CRiAK\\/XA5NIsn7gd8G2NnS5CbF7IzFTrpjQh2htjAEVInO0AicA49X4hgzrgFC6cPno\\/cTDeLs2daF2ya5pR1YKy67ziU9MPMgogWpsJf3xTN1oy4ap+qcEPwyGT7LsZxeBeBtSY7WL0PElCF9a4gm5ZooObZzy8VfN0sY9mgjULZg5BMHbjaU7ALuTs3KbIUq5P1YZ9VvA89b4JFVmtTC+Tb\\/sv87IVtPjhlu321pr\\/\\/xMumDSUuwFa20ACUANhuR4P0DY3MJPslEPeYe6Oo2j17wcD6Z076tFmWpVAN2eSB\\/Q5Z\\/S26JF19iXltnZo9JrfYn8z8HbP\\/ficPt+rHzH\\/uuZUabRNMrOjejzGwAgRhwQFUNfOUwZI7Obek7r9+AL7crlg7ZaEKBSLk1XmrjvDKhHvkrTFnW0Y2M5n26uBq7TGrm7damhvHot9v5XaxDUSwIA3a0QKuen4cqR\\/76We136KQlTKfuve1aFWfFU2IJEhMk70hGmB0Utq6RrfNpSY3mRywjkoefU5ONfAFbGS8c72KHS2ZecrSMBDnPMm3X4v80EKTAcWiAB48sEnd9n7lJmlNinxIuDIOmxuUsUFPkPsjKaZBqmp826k2Y5N7Ru9CKU050JXdGEBBPy7lT8ObgVE72o+oHz\\/mUs2dlaG6YCrT0vLBQ9X3lT2xKtSpoI2NeSI\\/ZXdDc3Bsl2TP4lmWFaF5oiUpO1k3\\/CBTJZh0aA8X2EkHcf01OgJv1LV35JeeD1ocGrbkY5HsiTuiLNILraF1UHia+kd+W4DxCBZmVAt4OyBO28ye6VE7eLonMZP1bMnwjbXtn9FTGmtz7W\\/XSvfYMOwBBNMyD7OE4LK2BqM68AvLZ6J2KoGrSbV+t2DSitEzmh1JKd1yYXNO\\/wn9HDjoootOhTkpeMKwz9Ycq7yO9OPc\\/lxEwgxa7tJkPY80AvPB0mNoEafB9T4286e04pnawMIyQWOMwQPZeOjKfaROD0wdkiHn4mipqAi2zaNV3sogBY\\/\\/1VkDFIOERIqwaAC2q48OSNrTxUTpbIooWjvXFqW7\\/XvScf1JTFpNaipnsIAF3Ox80p3ZqdZIvDcYp0\\/xP1ZUxr1nEbkRmUsC\\/DhNaEYGGi+6ltoFJ8tHYxQleCUCkZDgR5piNrowZ\\/bkjUq8AL7opbBL0kLVrQlEt+u9VYQRjwlaZ6I\\/YZ52vWUD44O6tMkpj6zm7HwSKv1nGBoEkRV79gEk\\/j9VSLuDOv2sqkhMOqtMzxu6cgI0c\\/swvouBTxpiMqEExDKVV9hIHHzzFMjstiTpzLL\\/OmMKC5oZXM1UrLPnmKVRMhu5GC4ZGE13Jfj6DcP+EC0aCSGS3EuWOzPKEltAL6QwQFIlEvW999+\\/nnUx22xevwcgX9Ry4nkbg8D8FMauxYT+cJQY\\/7F8Dc7u7DRa3W2IJp+6hvOx4dH\\/MPukCr0mpgaxj6yPGEArD+FBauTDpm6GKTlg+0Q1zOHhnfXvLTTeqWtj934S4FmO8u0uqv6+TC7JB08oBQg3Qy\\/Nqk3Ym+412GKm\\/lC00MxM6QCwi1+zWF9NUQJSI6yokhpeqX4jn6+IRbhVVOHL5fYO9C58yWIz7wFzU\\/HTk2Ic+O+qogyxRfc\\/s90l\\/sBlvlEe4riCWN5\\/da5PPI3g3A+Dsel1940zNKygcJDf56NEWkYRi\\/lZF90rujkA2R3M3POB9A0S9U1cQ0udXnhU3hw+isfuVw7K9OmwDth1T6IAN6v8J\\/adW5y5q0Z0iZylPPjSTqqXnxFj2SvBBkrS0Pt+nfujxB6jc3tjNB+ot\\/cylhL1oGlevpvGrq6WH9Hk2hyB6S1ryausNQ78g7kJJ+gSgzkPLa\\/BX6JhMAsNOKttPYVwt5B4FOi8rAFRknRyOFHYRg2Igp\\/fzUOtrOc4MPIk2WCjIM5g6gFAW11qBV2B40MZOJmm\\/Ei8rktYeICvrl6Oq1q9e\\/NL5dXqeoO8IkzE21cPw\\/OlGFcBbBQ7Rnnl0z+ZIiqjJ9U+JcaZ13f+rXndlhwx6fp+UWDHnL7Wpj6kMSC\\/TbMfGzJ82g\\/XLyunI6VmamRchgrsg6D+03dPiPkxjqcHmsE0WwZ0tf9EC6s9LmQbPwSWAfS8kscxiMR7ZoxV2+L+8yIj0oQwJ3IETfblyllQoK+YWX\\/ueeA\\/G5a+OZ8DrXXiZ+kjMkvxv46BT\\/OAjKtrfJ62GBGW5j4rNebK3VzdyCgGp9FdL\\/DIq9zT9dC9dQo0L2XeY+n5+Q+MXOgqDSNQihzBsXsPoFpyE4tZ+R\\/8pBIvdVejfgUKfH4qaIpHy5SvI7VqPZ8qNecz0XC23gQIUP4nFwICoG8fUhlbnF45IlqKCaxNXzVuFGUH4Pkw1QsEq3WotXs6v2Gd8zyQACKtTGuOKtT0q2c+MSsiVzFqfrRaCPqPS23JLqlqs3tjpjiOwV8SKPnxaXQzYk96+mk1l29hvIBnFdBY\\/9jDgf9qO9ayQXONeQlE2IM5gZ9nbZpZsRFt3P1AvuT4yH2QHVyfJWKiDwCdnwdjmXUD7xCnjUDHSRSc390E58mH4IQb\\/K4WFtm1SR8bunryIfQtTqWDcR1MrnQcRf2r7TXGyHHalXfXOB\\/l3JIWojzl0VF2d632+o5l9qu6hiyxTS+0REk7irGx4fzcqhsaNyh2pgk4qjruuDcU26POLxKBHCYYt7bOOd9ph5duueWnue9fXed52jw5D\\/FT1F3FOZzrXd29ucRlXB7IAb14z\\/gPEgpbGq1ETMQ9CMQXuHDzP3bt5qCfAjnFxab5Q3LJWgir9M\\/gHQXIweF\\/MNUzV1CEjfPag3mjNsknSnIlJ0NGIid91krV2++kO\\/VFRNFuLIvjHbWfmi8tS0ryC0jnhGgvfCt7yWdLHaVOleDQ2v8WusYcemffizlsUzYDp\\/L3OM5eI7+vp5k6EA7f9fOn0rwG6OFT9PJkVG9zkn1ckunPY38g2ueahUy9RZhrCbmzYXYjzwq5P\\/\\/LTcyIWaqj5ww\\/ke7iKOfFn2oW5tz0ZY1ioZyNk+B+hf7walWu06Yt4W\\/IiT80Nl5i7aupydFCCqI9t7DblrJ3PIznhJ8MvzlMAtOq\\/\\/UiQnUhmR3rn+qljUZbBDuln9ox35CI4EQZTLslb6i8\\/6TJW5gg6\\/++Ew0TW0WnGoBBhynPqoSVVa9la3bvq9i6v2zGk+bsXn+H\\/0GglEimoBnQiQ\\/e2NCu5eVM+Wk3tU0PGIyqg4+VW5gy2\\/2Q1R+17vGuHA5ON30CaEpDkxZOZT4MIBH2hKzzoktKiFTUrRKYbmMJCUfjs1hVUudSFqhLsoFVQLezkdn8Tdqrrqc8u420dg8qVCWjWMYcjPYiNjfV00FYwlKH60QO4ZLG416EAiH58yHIqmWaSmRdhIiZw26Ke8d4go+pEi24\\/gYO3ltLgJwCaxfIkvGXKt4SIaplJzAcv53FJaaAaHGUrWXPFNsBhOTG0gu+OEf20lLXCGplzXpVg6qlc7nxNCeQ5IEQfJ1ZMg6EIrA30I9QLOUqXTujLEkQPmkrGEl5K1ztQLA\\/HYLGKVgVkFjyXdpx4GMvGhyGkV\\/2yilJ\\/7neYQXDRpC04EMVXsK6AdlPJGggRRhjCPkZ1V\\/jZlzMjih0LTmdXx51B4sMbiX+aobvrgmm\\/4hdSmaj9ONndqmTHngyNSwRDwlrIs8PYiGR0f6wEFdExy9TS0gzww\\/EP3j4HXYPS1OidSCl7ag8kg8Sh\\/nSNGMUSnSHSAZxIja151bt9dO2EaggHQOCLmyLbjpyyn2X0ULjYiL+Ws4mqKV1WHiz1l10kBFrRxIlo71Qax5GV\\/kR7EmeDQYxa8fOc1n31Q\\/XhABdmlL+DW5yZGij0HQQ99hEL98dbcFXawBIprEvGhnQ2G60ZZGLyOkw+J1adqMexmy1oYANHD7lBu2nBz8rSJxWGPhjvGSk5wfYxCckZ5MilujGW0hbdKW++sVvOEDSGDu28r28vmSClVjYrknQjmqjG9bgc3FK9K4APSojCV45Y8Mtb\\/+zOUdiiZ49C38EuMRw5JxV0HESx10z\\/kEeXSQh\\/JkvQA\\/kRHFT2rXWvo+UlANdMOpU9cdYk4Gk63+a5QeW4zfp\\/wP8=\",\"tn\":\"atDQJEkeSKdH8C+0pOmw6rOQ4BBMx1ALk7wIIAHYxR3GrCk++IGtVTsKU01TyB6wsvTv2UphwIWmIpCcBW5JyYs4vo77rIkJ3GLg8Ch8HC86GXwG\\/r+Dx\\/op03nVpKVYxZHG739jsLjIKdRqUXwno29OeTIBV\\/n2Htz+Efw3fbruDY33013wirblnUZHVDYo5qWXsTa48uHt\\/oR2CRmwr8QYwFz+yes+NviUxRGTl8tIppUKC7gxhFEnK+PjiL8KGFz25x1fJbmMmLLw4z71fFXGfYXxzOpg5n5nQrtEGnN5aF8e+ozyRMV3cl93VoYpZvSi0K+0X7HaO+lXjDsX3g==\",\"sessionId\":\"1588754495607\",\"fpEncode\":11},\"encrypt\":1,\"organization\":\"oXGNW54W7cZcFS1goYH7\",\"channel\":\"\"}",
		"h=%7b%22u%22%3a%222552111184%22%2c%22thumb%22%3a%22xl%22%2c%22dt%22%3a%22phone%22%2c%22ov%22%3a%2210%22%2c%22net%22%3a%224G%22%2c%22os%22%3a%22ANDROID%22%2c%22d%22%3a%2253cexxxxxxae11f%22%2c%22dv%22%3a%22PCT-TL10%22%2c%22t%22%3a%22json%22%2c%22chil%22%3a%227%22%2c%22v%22%3a%222%22%2c%22av%22%3a%227.8.0%22%2c%22scr%22%3a%223.0%22%2c%22adv%22%3a%221%22%2c%22ts%22%3a%221588726552%22%2c%22s%22%3a%22450efcxxxxx65f145%22%2c%22seid%22%3a%222377955226xxxxxa49004xxxx9db957%22%7d&struct_id=1340828",
	}
	rand.Seed(time.Now().Unix())
	for i := 0; i < 10; i++ {
		bbb := aaa[rand.Intn(2)]
		src1 := bytes.NewBufferString(bbb)

		go func() {
			bb := readBytes(src1)
			time.Sleep(time.Millisecond * time.Duration(rand.Intn(1000)))
			if string(bb) != bbb {
				fmt.Println(string(bb))
			}
		}()

		time.Sleep(time.Millisecond * time.Duration(rand.Intn(50)))
	}
	time.Sleep(time.Second)
	return
}
```

## 解决

最终，我们将buffer放到Context中，问题得到了解决。

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


## 总结

在使用sync.Pool的时候需要注意引用问题。 切记要保证Put回去对象已经使用完毕。