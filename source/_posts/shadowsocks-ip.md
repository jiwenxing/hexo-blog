title: 震惊！AWS EC2 主机 IP 被封！
categories: Tools
tags: []
toc: false
date: 2018-01-17 11:15:36
---


UC 看多了不自觉也学会震惊体了，哈哈。回到主题，事情是这样的，之前申请了 AWS 的 EC2 免费主机一台，平时在上面部署一些自己的小应用，昨天晚上突然发现部署在上面的相册访问不了，搭的 Shadowsocks（以下简称ss） 代理也不能用了，关键是 SSH 连主机都连不上了，这可是重大线上事故啊。 

<!-- more -->

## 排查处理

后来经过排查发现 EC2 主机的 IP 被 Ban 了，也不知道谁这么坏（偷笑）！直接上 AWS 的 EC2 Dashboard 左侧网络与安全分组下有个弹性IP的标签，点击左上角分配新地址便会得到一个新的 IP，然后点击操作中关联地址即可将新的 IP 绑定到 EC2 实例上。最后在 DSNPod 中改了一下 DNS 的 IP 设置，相册马上就可以访问了，改了 ss 的 IP 之后也能正常使用了。可见现在 Ban Rule 是多么简单粗暴，连端口都懒得理了，直接操作 IP！也不知道换了 IP 能坚持几天，且用且珍惜吧。

## 关于 ShadowSocks

这个事情感觉应该就是 ss 的锅了，不过我就是用来上上谷歌、看看油管，也没干什么，但是没办法，非礼勿视，现在是不但要求勿视，可视的途径也不能有。话说之前大概了解过 ss 代理方式，其由于采用灵活的加密方式报文很难被探测和特征分析，从而稳定性要比其它的方式好很多。但是刚刚 Google 了一下（没错就是用上文提到的ss），看到网上从去年十月开始此类问题就开始频繁的出现了。具体可以看看 shadowsocks [issues](https://github.com/shadowsocks/shadowsocks/issues/988) 上的吐槽。

这时忍不住想对 ss 的原理深入了解一下，想看看到底是怎么道高一尺魔高一丈的（道魔难分），先参考网上的一篇文章[2]对 ss 的原理有个大概的认识，感觉写的很不错，将其中的几张图摘抄于此。

long long ago…

![](http://ochyazsr6.bkt.clouddn.com/6754b95cbb27f92979a4dbf1471d0101.jpg)


when evil comes(hahahaha...)

![](http://ochyazsr6.bkt.clouddn.com/a250a9851c17e397731ab902e18ee074.jpg)


ssh tunnel

![](http://ochyazsr6.bkt.clouddn.com/ca96eb0c6f38d7afe6985ad32f415885.jpg)


shadowsocks

![](http://ochyazsr6.bkt.clouddn.com/66e428d153c996c29c38aad4aa3f4084.jpg)



图画的很清晰，可以看到 ShadowSocks 通过客户端以指定的密码、加密方式和端口连接服务器，成功连接到服务器后，客户端在用户的电脑上构建一个本地socks5代理。使用时将流量分到本地socks5代理，客户端将自动加密并转发流量到服务器，服务器以同样的加密方式将流量回传给客户端，以此实现代理上网。

ShadowSocks 中间没有任何握手的环节，直接是TCP数据流，没有 SSH 建立连接的过程，同时也不需要保持连接。因此相对而言 Shadowsocks 的代理方式更为隐蔽和安全。但是随着 ShadowSocks 的使用越来越多，其默认使用的8388端口首先就被盯上了，很容易就被 ban 了。 你可能会说换个端口号就好了，然而随着类似于[此类论文](http://ieeexplore.ieee.org/document/8048116/?reload=true#full-text-section)（当然这篇文章已被吐槽很水）的研究越来越多，也说明了相关从业者在不遗余力的来封堵这条路，有人说 GFW 其实很任性，宁可错杀也不放过，这不感觉我就被错杀了。

当然我肯定想不出也开发不出来更好的科学上网的协议或者工具出来，我能做的就是保持学习，学习前人的智慧（例如[clowwindy](https://github.com/clowwindy)），并感激他们为此付出的努力，同时也希望所有的事情都能向一个美好的方向发展~


## 参考

[1] [https://github.com/shadowsocks](https://github.com/shadowsocks)     
[2] [写给非专业人士看的 Shadowsocks 简介](https://vc2tea.com/whats-shadowsocks/)
