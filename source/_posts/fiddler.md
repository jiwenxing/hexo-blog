title: 使用fiddler调试移动端H5
categories: Coding
tags: [Frontend]
toc: false
date: 2017-04-10 14:58:48
---


调试移动应用的H5时，大部分情况都可以在PC上模拟，但有时会存在需要校验native环境信息及签名等复杂的情况，浏览器上模拟需要准备一些必备的参数并且不够接近真实环境，这时就希望APP端能够像pc一样可以配host，可以查看network详细信息，这个时候可以借助fiddler来实现了。<!-- more-->


## 抓取http请求

### 操作步骤
1. pc上安装fiddler并打开远程机器捕获模式
如图所示，Tools > Fiddler Options下确保 Allow remote clients to connect 被选中
![](http://ochyazsr6.bkt.clouddn.com/201704101432_963.jpg)

2. 远程机器（即手机）连接至同一局域网并设置该pc为代理机
![](http://ochyazsr6.bkt.clouddn.com/201704101327_739.jpg)
注意：ip为pc在局域网中的ip，fiddler默认监听的端口号为8888，可以在第一步修改

3. pc配上需要的host即可在APP上进行测试
这时应该可以在fiddler中看到APP发出的请求，就类似于chrome调试工具中的network查看请求的详细信息

>注意需要保证手机和pc连接至同一局域网，如果不能保证（公司网络可能需要认证），**可以使用360或猎豹wifi共享网络，不过这时第二步的代理ip应该填共享网络的pc端ip（网络与共享中心查看共享网络适配器的ipv4地址），而不是pc的本地ip（ipconfig）**


## 抓取https请求
以上操作完成只能正常的抓取http请求，对于https请求由于传输数据是加密的，fiddler解析报文。如果希望fiddler能够抓取https报文，客户端需要安装fiddler的证书，这样fiddler可以截获用户的https请求，然后伪装成用户请求服务器，得到响应后解密信息并使用自己的证书加密发送给客户端，然后客户端使用安装的fiddler的证书解密报文。

### 操作步骤

1. fiddler设置
tools->options->https，选中capture HTTPS connects & decrypt https traffic & ignore server certificate errors，这时会提示安装证书，点击yes安装即可
![](http://7xry05.com1.z0.glb.clouddn.com/201705081657_866.png)

2. 手机安装fiddler证书
手机连接至pc分享的wifi，fiddler处于打开状态，手机内置浏览器输入：http://192.168.64.107:8888，其中ip为pc分享的wifi的ip，即前面设置的代理的ip，端口号默认就是8888，点击页面中的fiddlerRoot certificate安装即可
![](http://7xry05.com1.z0.glb.clouddn.com/201705081658_54.png)

**注意：** 经过测试安卓安装了证书以后没有问题，但是ios安装了证书https请求还是会被拦截，需要native做特殊的处理忽略证书相关警告。


## 原理解释
Fiddler支持代理的功能，也就是说你所有的http请求都可以通过它来转发，在手机端设置Fiddler所在的pc为代理服务器并使用fiddler监听的端口号，使得手机应用的请求都通过Fiddler来转发，从而实现调试手机端页面的目的。当然也可以使用例如NProxy等其它代理工具达到同样的目的，但是无法像fiddler那样查看请求的详细信息。能够抓取https请求是因为当客户端安装了并信任了fiddler自己的证书以后，客户端和fiddler以及fiddler和服务器之间的通信都是没问题的，只是fiddler每次拿到服务器返回的数据后先使用服务器的证书解密再使用自己的证书加密然后再发送给客户端，这时由于客户端安装并信任了fiddler的证书，并可以正常的解析数据了。

## 参考资料
- [Capture traffic from another machine](http://docs.telerik.com/fiddler/configure-fiddler/tasks/MonitorRemoteMachine)
- [用fiddler做代理服务器转发请求](http://blog.csdn.net/sb___itfk/article/details/45250771)