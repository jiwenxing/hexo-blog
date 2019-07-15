title: Http 的 Cookie&Session 机制
categories: Coding
tags: [Cookie,Session,Http]
toc: true
date: 2016-09-26 20:31:30
---

为什么京东的网站没登录也可以加入购物车？为什么刚打开淘宝页面左上角就显示出了我的用户名？为什么我在这个商品页登陆了，其它的页面刷新后也显示已登录？今天就来仔细的探讨一下Http的Cookie和Session机制。<!-- more -->

“Cookie 是一个神奇的机制，同域内浏览器中发出的任何一个请求都会带上 Cookie，无论请求什么资源，请求时，Cookie 出现在请求头的 Cookie 字段中。服务端响应头的 Set-Cookie 字段可以添加、修改和删除 Cookie，大多数情况下，客户端通过 JavaScript 也可以添加、修改和删除 Cookie。”

Cookie 的重要字段如下：
`[name][value][domain][path][expires][httponly][secure]`其含义依次是：名称、值、所属域名、所属相对根路径、过期时间、是否有 HttpOnly 标志、是否有 Secure 标志。
其中：
- 设置 Domain 的值可以进行共享 cookie(不填为默认本域，可设为根域名进行使其它二级域名共享)。
- `HttpOnly` 是指仅在 HTTP 层面上传输的 Cookie，当设置了 HttpOnly 标志后，客户端脚本就无法读写该 Cookie，这样能有效地防御 XSS 攻击获取 Cookie。
- 设置了 Secure 标志的 Cookie 仅在 HTTPS 层面上安全传输，如果请求是 HTTP 的，就不会带上这个 Cookie，这样能降低重要的 Cookie 被中间人截获的风险。


## 添加 cookie 属性及 session
客户端浏览器访问服务时，可以向其添加cookie属性或在服务端保存一些用户相关的session属性，如下所示。注意添加到根域名下的cookie可以在不同的二级域名下共享，这也是多数网站共享登录态实现单点登录的常用手段。创建的session是保存在服务端servlet容器的内存中，如果用户量大或session数据大这样会影响性能甚至造成内存溢出，因此常用的手段是将session存于redis或memcache。
```java
@RequestMapping("/")
String home(HttpServletRequest req, HttpServletResponse res) {
    //req中session存在时直接获取，不存在时返回新建的session对象
	HttpSession session = req.getSession();
	System.out.println("session id: "+ session.getId());
	//设置session
	//Values stored in the session object are stored in the memory of the servlet container.
	session.setAttribute("name", "jverson");
	session.setAttribute("psd", "123456");
	session.setAttribute("login", false);
	//设置根域名cookie
	Cookie cookie1 = new Cookie("skus","1111111111");
	cookie1.setMaxAge(600);
	cookie1.setDomain("jd.com");
	//设置二级域名cookie（本域名）
	Cookie cookie = new Cookie("price","999.99");
	cookie.setMaxAge(600);
	cookie.setDomain("pad.jd.com");
	res.addCookie(cookie);
	res.addCookie(cookie1);
    return "Hello World!";
}
```

## 获取cookie及session属性
获取某个特定cookie可以使用`@CookieValue`注解，也可以从`HttpServletRequest`中获取到所有cookie数组后遍历查找。

```java
@RequestMapping("/{name}")
public String get(@PathVariable("name") String name, @CookieValue(value="price",required=false) Double price, HttpServletRequest req) throws Exception {  
	//遍历cookie属性
	Cookie[] cookies = req.getCookies();
	if (cookies!=null && cookies.length>0) {
		System.out.println(">>>>>>>>> iterate the cookies ---------------");
		for (Cookie cookie : cookies) {
			System.out.println(cookie.getName()+": "+cookie.getValue());
		}
	}
	//打印session
	System.out.println(">>>>>>>>> print the sessions ---------------");
	HttpSession session = req.getSession(false);
	if (session!=null) {
		String sid = session.getId();
        System.out.println("sid: "+sid);
        System.out.println("session value name: "+session.getAttribute("name"));
        System.out.println("session value psd: "+session.getAttribute("psd"));
	}else {
		System.out.println("no session!");
	}
	return "hello "+name;  
}
```

这里需要特别注意一下session的获取方法getSession，当入参为false时有HttpSession对象就返回，没有就返回null，不会新创建session，但是不传参或传true时，如果检查没有对象就会新创建一个：
```java
HttpSession session = req.getSession(false);
```
> public HttpSession getSession(boolean create)
Returns the current HttpSession associated with this request or, if if there is no current session and create is true, returns a new session.
If create is false and the request has no valid HttpSession, this method returns null.
To make sure the session is properly maintained, you must call this method before the response is committed. If the Container is using cookies to maintain session integrity and is asked to create a new session when the response is committed, an IllegalStateException is thrown.
Parameters: true - to create a new session for this request if necessary; false to return null if there's no current session
Returns: the HttpSession associated with this request or null if create is false and the request has no valid session

因此一般获取session属性的代码会写成这样：
```java
HttpSession session = request.getSession(false);  
String user_name = WebUtils.getSessionAttribute(reqeust, "user_name");
```
再看看WebUtils（org.springframework.web.util.WebUtils）的源码：
```java
public static Object getSessionAttribute(HttpServletRequest request, String name) {  
    Assert.notNull(request, "Request must not be null");  
    HttpSession session = request.getSession(false);  
    return (session != null ? session.getAttribute(name) : null);  
}  
```


## 删除某个cookie属性
假如要删除本二级域名下price的cookie属性，可以向response中添加一个同名的cookie并将其有效期设置为0即可。以下代码注意setMaxAge为-1时并不会删除该cookie，只是将其过期时间设为session。
> A negative value means that the cookie is not stored persistently and will be deleted when the Web browser exits. A zero value causes the cookie to be deleted.

```java
@RequestMapping("/destroy")
public String destroy(HttpServletRequest req, HttpServletResponse res){
	Cookie[] cookies = req.getCookies();
	if (cookies!=null && cookies.length>0) {
		for (Cookie cooki : cookies) {
			if ("price".equals(cooki.getName())) {
				Cookie cookie = new Cookie("price", "");
				cookie.setDomain("pad.jd.com");
				//这里设置为-1时将会为该域名下添加一个同名的session cookie,关闭浏览器时才会清除，设为0则直接清除
				cookie.setMaxAge(0);
				cookie.setPath("/");
				cookie.setComment("EXPIRING COOKIE at " + System.currentTimeMillis());
				res.addCookie(cookie);
			}
		}
		return "cookies price destroyed!";
	}
	return "no cookies!";
}
```

## cookie大小限制
当Cookie已达到限额，自动踢除最老的Cookie，以使给最新的Cookie一些空间，一般单个域cookie尽量不要超过50个。做个小实验，登陆百度账号，然后在改网页下运行下面这段代码可以让你的百度账号退出，正是因为向根域名设置cookie过多导致原来的cookie失效。
```JavaScript
for (var i = 0; i<1E3; i++)
  document.cookie = i + '=' + i + '; Domain=baidu.com; Path=/';
```

## XSS攻击
跨站脚本攻击(Cross Site Scripting)是一种常见的web安全漏洞，它允许攻击者将恶意代码植入到提供给其它用户使用的页面中。XSS的攻击目标是为了盗取存储在客户端的cookie或者其他网站用于识别客户端身份的敏感信息。一旦获取到合法用户的信息后，攻击者甚至可以假冒合法用户与网站进行交互。

### XSS通常可以分为两大类：
1. 一类是存储型XSS，主要出现在让用户输入数据，供其他浏览此页的用户进行查看的地方，包括留言、评论、博客日志和各类表单等。应用程序从数据库中查询数据，在页面中显示出来，攻击者在相关页面输入恶意的脚本数据后，用户浏览此类页面时就可能受到攻击。这个流程简单可以描述为:恶意用户的Html输入Web程序->进入数据库->Web程序->用户浏览器。
2. 另一类是反射型XSS，主要做法是将脚本代码加入URL地址的请求参数里，请求参数进入程序后在页面直接输出，用户点击类似的恶意链接就可能受到攻击。

### 遭受XSS攻击的常见原因
Web应用未对用户提交请求的数据做充分的检查过滤，允许用户在提交的数据中掺入HTML代码(最主要的是“>”、“<”)，并将未经转义的恶意代码输出到第三方用户的浏览器解释执行。

### 预防XSS
答案很简单，坚决不要相信用户的任何输入，并过滤掉输入中的所有特殊字符。这样就能消灭绝大部分的XSS攻击。目前防御XSS主要有如下几种方式：
- 过滤特殊字符，避免XSS的方法之一主要是将用户所提供的内容进行过滤，一般高级语言会提供相关的工具类。
- 使用HTTP头指定类型，`w.Header().Set("Content-Type","text/javascript")`这样就可以让浏览器解析javascript代码，而不会是html输出。

## CSRF攻击
CSRF(Cross-site request forgery)跨站请求伪造，是一种对网站的恶意利用，攻击者盗用了你的身份，以你的名义发送恶意请求。要完成一次CSRF攻击，受害者必须依次完成两个步骤：
1. 登录受信任网站A，并在本地生成Cookie。
2. 在不登出A的情况下，访问危险网站B。这时危险网站B会要求用户访问A的某个资源，访问A的时候自然会带上1处产生的cookie，于是服务器便将B站的危险行为误认为是A的正常行为，达到盗用身份的目的。

### 预防CSRF
- Cookies Hashing
让服务器发送给客户端的所有表单中都标示一个随机值，并同时在客户端的COOKIE中保存一个相关联的token；验证的时候，服务端每次对接收到的请求过来的一个input随机值跟客户端的COOKIE中的token进行对照验证。攻击者攻击的原理是利用了客户端的COOKIE，但是攻击者是得不到COOKIE具体的内容(这里抛开XSS攻击的可能性,由于用户的Cookie很容易由于网站的XSS漏洞而被盗取，这就另外的1%)；所以攻击者没法在攻击URL中加入token，这样就无法通过验证。如果我们不考虑用户的Cookies很容易由于网站中存在XSS漏洞而被偷窃（我们已经知道这样的事情并不少见）这一事实，这是一个很好的应对对CSRF的解决方案。

- 校验Referer
检测访问来路是否可信的最简单方法是，获得HTTP请求中的来路信息（即名为Referer的HTTP头）并且检查它来自站内还是来自一个远程的恶意页面：这是一个很好的解决方法，但是由于可以对服务器获得的请求来路进行欺骗以使得他们看起来合法（js利用插件可以修改http的所有头部信息），这种方法不能够有效防止攻击。

## 参考
1. [Session Management in Java – HttpServlet, Cookies, URL Rewriting](//www.journaldev.com/1907/java-session-management-servlet-httpsession-url-rewriting)
2. [Cookie/Session的机制与安全](//harttle.com/2015/08/10/cookie-session.html)
3. [避免XSS攻击](https://github.com/astaxie/build-web-application-with-golang/blob/master/zh/09.3.md)
4. [总结 XSS 与 CSRF 两种跨站攻击](https://blog.tonyseek.com/post/introduce-to-xss-and-csrf/)
