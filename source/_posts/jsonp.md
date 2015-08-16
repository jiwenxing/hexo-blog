title: JSONP error handling with jquery.ajax
date: 2015-07-27 23:50:15
categories: Coding
tags: [JavaScript] 
---
这几天想对自己的博客做一些优化，例如我的相册是通过Instagram提供的api以Ajax封装的jsonp跨域请求方式获取照片来展示，但是需要翻墙才能访问，我希望如果用户未翻墙导致访问失败后能够调用error callback展示另一个页面。<!-- more -->

##PROBLEM
先看看这段代码，刚开始不管怎么搞都无法进入到`error`回调函数中。

	$.ajax({
	url: "https://www.google.com.hk/?gws_rd=cr",
	type: "GET",
	dataType: "jsonp",
	success:function(re){
	    alert("hello success!");
	},
	error:function(){  
		alert("hello error"); 
	},                   
	complete:function() {           
	    alert("hello complete!");
	}
	});

注意这里的`url`是需要翻墙才能访问的，我在打开`VPN`的情况下访问可以进入`success`回调，当关闭`VPN`时报以下错误信息
> Failed to load resource: net::ERR_CONNECTION_TIMED_OUT

当然访问失败很正常，但按理说访问失败就应该进入`error`回调中，而页面却没有任何反应，也没有进入任何`callback`中。

##DIGNOSE
先了解下JSONP是个什么东东，她的使用场景和实现原理是什么。
由于浏览器同源策略的限制，Ajax无法实现数据的跨域请求，而 HTML 的 `<script>` 元素是一个例外。利用 `<script>` 元素的这个开放策略，网页可以得到从其他来源动态产生的JSON 资料。其过程可以简单的描述为: 当需要通讯时，本站脚本创建一个`<script>`元素，地址指向第三方的API网址，形如： `<script src="http://www.example.net/api?param1=1&param2=2"></script>` ，并提供一个回调函数来接收数据（函数名可约定，或通过地址参数传递）。 第三方产生的响应为json数据的包装（故称之为jsonp，即json padding），形如： callback({"name":"hax","gender":"Male"}) 这样浏览器会调用callback函数，并传递解析后json对象作为参数，本站脚本可在callback函数里处理所传入的数据。简单讲就是jsonp通过一种取巧的非正式的方式实现了数据的跨域请求。

那么jsonp和普通的json数据格式的Ajax请求有什么不同呢？

**`ajax`的核心是通过`XmlHttpRequest`获取非本页内容，而`jsonp`的核心则是动态添加`<script>`标签来调用服务器提供的`js`脚本。**

而上面我们遇到的问题正是与这两种请求的实现方式不同有关，[这个帖子](http://forum.jquery.com/topic/jquery-ajax-with-datatype-jsonp-will-not-use-error-callback-if-request-fails)道出其中症结所在


> $.ajax() can determine other error scenarios by inspecting the XHR
object, but jsonp doesn't use XHR.

##SOLUTION

如果jsonp方式想在请求失败后触发并执行error callback要怎么实现呢？万能的Google搜到了[一个帖子](http://designwithpc.com/post/11989720389/jsonp-error-handling-with-jqueryajax)提到了两种可行的方案。

- 添加`timeout`设置
> Timeout after a reasonable amount of time to fire the error callback because it might have failed silently. You may not know what the actual error (or error status) was but at least you get to handle the error.


即将之前的代码改成如下即可：

	$.ajax({
	url: "https://www.google.com.hk/?gws_rd=cr",
	type: "GET",
	dataType: "jsonp",
    timeout: 3000    //添加此行
	success:function(re){
	    alert("hello success!");
	},
	error:function(){  
		alert("hello error"); 
	},                   
	complete:function() {           
	    alert("hello complete!");
	}
	});


- 添加一个`jquery-jsonp`的插件

插件地址： `jquery-jsonp，https://github.com/jaubourg/jquery-jsonp`

将`<script src="https://raw.github.com/jaubourg/jquery-jsonp/master/src/jquery.jsonp.js"></script>`插入到html头部即可。

另外还需注意jsonp只支持get不支持post请求。


###REFERENCE
1. [http://www.kankanews.com/ICkengine/archives/96670.shtml](http://www.kankanews.com/ICkengine/archives/96670.shtml)
2. [http://forum.jquery.com/topic/jquery-ajax-with-datatype-jsonp-will-not-use-error-callback-if-request-fails](http://forum.jquery.com/topic/jquery-ajax-with-datatype-jsonp-will-not-use-error-callback-if-request-fails)
3. [http://designwithpc.com/post/11989720389/jsonp-error-handling-with-jqueryajax](http://designwithpc.com/post/11989720389/jsonp-error-handling-with-jqueryajax)
4. [http://baike.baidu.com/link?url=eXfWWy4ai-a7PkrsYHsqCrRGzRJYoF4l7WJStF4HoTMMwDeMrFtcnOICK0BM1QfwAjluEvrwfV5M9ZDuoejM-_](http://baike.baidu.com/link?url=eXfWWy4ai-a7PkrsYHsqCrRGzRJYoF4l7WJStF4HoTMMwDeMrFtcnOICK0BM1QfwAjluEvrwfV5M9ZDuoejM-_)