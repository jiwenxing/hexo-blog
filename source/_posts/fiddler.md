title: 使用fiddler调试安卓H5
categories: Coding
tags: [Frontend]
toc: false
date: 2017-04-10 14:58:48
---


调试移动应用的H5时，大部分情况都可以在PC上模拟，但有时会存在需要校验native环境信息及签名等复杂的情况，浏览器上模拟需要准备一些必备的参数并且不够接近真实环境，这时就希望APP端能够像pc一样可以配host，可以查看network详细信息，这个时候可以借助fiddler来实现了。<!-- more-->

## 操作步骤
1. pc上安装fiddler并打开远程机器捕获模式
如图所示，Tools > Fiddler Options下确保 Allow remote clients to connect 被选中
![](http://ochyazsr6.bkt.clouddn.com/201704101432_963.jpg)

2. 远程机器（即手机）连接至同一局域网并设置该pc为代理机
![](http://ochyazsr6.bkt.clouddn.com/201704101327_739.jpg)
注意：ip为pc在局域网中的ip，fiddler默认监听的端口号为8888，可以在第一步修改

3. pc配上需要的host即可在APP上进行测试
这时应该可以在fiddler中看到APP发出的请求，就类似于chrome调试工具中的network查看请求的详细信息

>注意需要保证手机和pc连接至同一局域网，如果不能保证（公司网络可能需要认证），可以使用360wifi共享网络

## 原理解释
Fiddler支持代理的功能，也就是说你所有的http请求都可以通过它来转发，在手机端设置Fiddler所在的pc为代理服务器并使用fiddler监听的端口号，使得手机应用的请求都通过Fiddler来转发，从而实现调试手机端页面的目的。当然也可以使用例如NProxy等其它代理工具达到同样的目的，但是无法像fiddler那样查看请求的详细信息。

## 参考资料
- [Capture traffic from another machine](http://docs.telerik.com/fiddler/configure-fiddler/tasks/MonitorRemoteMachine)
- [用fiddler做代理服务器转发请求](http://blog.csdn.net/sb___itfk/article/details/45250771)