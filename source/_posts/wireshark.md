title: 网络协议之Wireshark抓包分析（三）
categories: Tools
tags: [network]
toc: true
date: 2016-05-17 15:58:57
---

在了解了计算机网络的基础知识、分层结构及各种通信协议之后，可以使用网络抓包工具对各种协议的数据报进行抓取分析，以便进一步直观的理解协议的原理。
<!-- more -->

## Wireshark介绍

[Wireshark](https://www.wireshark.org/)是一个网络封包分析软件，处于混杂模式（Promiscuous）的Wireshark可以抓取改冲突域的所有网络封包。它的基本原理是通过程序将网卡的工作模式设置为“混杂模式”，这时网卡将接受所有流经它的数据帧，这实际上就是Sniffer工作的基本原理：让网卡接收一切他所能接收的数据。Sniffer就是一种能将本地网卡状态设成混杂状态的软件，当网卡处于这种"混杂"方式时，该网卡具备"广播地址"，它对所有遇到的每一个数据帧都 产生一个硬件中断以便提醒操作系统处理流经该物理媒体上的每一个报文包。

## Wireshark过滤器

为了能够从大量冗余的wireshark报文中快速定位所需要的报文，必须熟练的使用wireshark提供的过滤器，捕获过滤器和显示过滤器。捕捉过滤器是数据经过的第一层过滤器，它用于控制捕捉数据的数量，以避免产生过大的日志文件。
显示过滤器是一种更为强大（复杂）的过滤器。它允许您在日志文件中迅速准确地找到所需要的记录。两种过滤器使用时都需要遵守一定的语法，不过在使用的过程中，wireshark提供的一些常用的过滤命令基本可以满足需求。下面给出一些过滤语法示例：   

- 过滤源ip、目的ip。  
```
ip.dst==192.168.101.8
ip.src==1.1.1.1
```

- 端口过滤
```
tcp.dstport==80
tcp.srcport==80
```

- http模式过滤
```
http.request.method=="GET"
http.request.method=="POST"
```

## DHCP协议抓包分析

 DHCP（Dynamic Host Configuration Protocol,动态主机配置协议）是一个局域网的网络协议，使用UDP协议工作，为互联网上主机提供地址和配置参数。DHCP使用的客服务器模式，其中客户端使用的是UDP68端口，而服务器使用的是UDP67端口。使用DHCP时，在网络上首先必须有一台DHCP服务器，而其他的计算机则是DHCP客户端。当DHCP客户端程序发出一个信息，要求一个动态IP地址时，DHCP服务器将根据，目前配置的IP地址池，从中提供一个可供使用的IP地址和子网掩码给客户端。DHCP工作分为4个阶段。分别为发现阶段（DHCP Discover），提供阶段（DHCP Offer），选择阶段（DHCP Request）和确认阶段（DHCK ACK）
 ![](http://7u2eve.com1.z0.glb.clouddn.com/20151130090201520.png)

在进行抓包分析之前，首先需要将自己电脑已获取的IP释放掉，使用命令行工具输入```ipconfig /release```，然后执行```ipconfig /renew```，这时主机便会重新发送DHCP请求获取IP地址，另外注意在捕获DHCP包时过滤器设置为Bootp（DHCP其实是Bootp协议的升级）。下面我们就进行数据包分析。

### Discover报文

![](http://7u2eve.com1.z0.glb.clouddn.com/filehelper_1463490751806_7.png)

Bootp报文内容
![](http://7u2eve.com1.z0.glb.clouddn.com/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20160517212159.png)

### Offer报文

![](http://7u2eve.com1.z0.glb.clouddn.com/filehelper_1463492279868_95.png)

### Request & ACK
注意由于可能会有多个DHCP都收到了Discover报文，也都返回了Offer报文。当客户端收到多台DHCP发送的DHCP offer包，DHCP客户端只接受其中一台DHCP服务器的数据，然后以广播的方式回应DHCP服务器DHCP Request，通知自己选择的DHCP服务器。当局域网中所以的DHCP服务器收到客户端发送的DHCP Request信息，通过查看包，确定是否是选择了自己IP，如果选择的是自己，则会发送一个确认包。否则，不进行响应。
由于Request和ACK报文与之前的Discover和Offer报文很类似，不再讨论。


## TCP三次握手抓包分析

### TCP的三次握手过程
![](http://7u2eve.com1.z0.glb.clouddn.com/20140410074734_35455.jpg)

1, 第一次握手：建立连接时，客户端发送syn包（syn=j）到服务器，并进入SYN_SENT状态，等待服务器确认；SYN：同步序列编号（Synchronize Sequence Numbers）。  
![](http://7u2eve.com1.z0.glb.clouddn.com/syn.png)  

2, 第二次握手：服务器收到syn包，必须确认客户的SYN（ack=j+1），同时自己也发送一个SYN包（syn=k），即SYN+ACK包，此时服务器进入SYN_RECV状态。    
![](http://7u2eve.com1.z0.glb.clouddn.com/synack.png)

3, 第三次握手：客户端收到服务器的SYN+ACK包，向服务器发送确认包ACK(ack=k+1），此包发送完毕，客户端和服务器进入ESTABLISHED（TCP连接成功）状态，完成三次握手。     
![](http://7u2eve.com1.z0.glb.clouddn.com/ack.png)

### 三次握手抓包方法
将捕获过滤器设置为tcp only，然后显示过滤器设为http，访问某个http网站（例如浏览器地址栏输入jverson.com然后回车），可以看到一条```GET / HTTP/1.1```的http报文，右键点击选择追踪TCP流，这是可以看到显示过滤器栏变为```tcp.stream eq 84```，然后就可以看到该http请求前的三次握手的TCP报文如下图所示。

![](http://7u2eve.com1.z0.glb.clouddn.com/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20160518170345.png)

## DNS协议抓包分析

DNS即域名解析服务，可以将指定的域名转换为其对应的IP地址。DNS只有两种报文：查询报文、回答报文，两者有着相同格式。客户端和dns服务器在传输层利用UDP数据报方式通信。
对某个特定域名（例如jverson.com）的dns请求进行抓包，首先捕获过滤器只捕捉udp包，然后显示过滤器过滤出dns报文，找到一条标记```standard query xxxxxx A jverson.com```的报文右键追踪udp流，便可以看到本次dns的请求和应答报文。
![](http://7u2eve.com1.z0.glb.clouddn.com/dns.png)

DNS query报文   
![](http://7u2eve.com1.z0.glb.clouddn.com/dnsquery.png)    


DNS answer报文    
![](http://7u2eve.com1.z0.glb.clouddn.com/dnsanswer.png)   



## 参考
1. [Wireshark实战分析之DHCP协议（一）](http://blog.csdn.net/longwang155069/article/details/50107911)    
2. [wireshark抓包图解 TCP三次握手/四次挥手详解](http://www.seanyxie.com/wireshark%E6%8A%93%E5%8C%85%E5%9B%BE%E8%A7%A3-tcp%E4%B8%89%E6%AC%A1%E6%8F%A1%E6%89%8B%E5%9B%9B%E6%AC%A1%E6%8C%A5%E6%89%8B%E8%AF%A6%E8%A7%A3/)