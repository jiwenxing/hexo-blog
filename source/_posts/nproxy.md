title: 前端调试利器Nproxy
categories: Coding
tags: [Frontend]
toc: false
date: 2016-10-21 12:00:34
---

[NProxy](http://goddyzhao.me/nproxy/)是一个前端调试利器，它能按照你设置的规制捕获网络请求，再指向本地文件，如拦截你的js文件到本地，就能很快的调试线上环境（如后台环境，测试环境，预上线环境等）。<!--more-->

其实Nproxy的原理很简单，通过设置本机为代理服务器监听指定的接口，从而所有本机发布的请求都通过代理过滤，这样便可以按照既定的规则将指定的路径转发至本地环境，从而方便在本地修改css及js代码调试线上环境，或者将ajax请求映射到本地假数据，下面简单介绍一下使用方法。


1. 配置本地代理环境
install proxy-switchyomega
链接：https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif 
> 如果不想安装插件，还可以在chrome的设置中设置局域网代理，代理ip设为本机127.0.0.1，端口nproxy默认监听8989

2. 通过npm安装nproxy
> npm install -g nproxy

3. 创建规则文件rule.js
```js
module.exports = [
  {
    pattern: 'css/skin/comments.css',  //线上访问路径
    responder: 'D:\\projects\\fridge\\app\\css_modify_yuelin\\comments.css' //本地映射文件路径
  },
  {
    pattern: 'friendsh5/myposts.js',  
    responder: 'D:\\projects\\fridge\\app\\css_modify_yuelin\\myposts.js'
    //这里注意windows本地文件路径的反斜杠需要使用双反斜杠进行转义。 
  }
];
```

4. 启动Nproxy
> 当前目录执行：nproxy -l rule.js

5. 验证匹配结果
刷新页面，当资源链接匹配rule中配置的pattern时请求便会被转发到相应的responder，并会有如下匹配成功的提示
![](http://ochyazsr6.bkt.clouddn.com/201610211157_36.jpg)
<br>





 