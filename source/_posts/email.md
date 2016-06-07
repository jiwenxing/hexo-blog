title: 打造自己的专属邮箱服务
categories: Coding
tags: [Blog]
toc: false
date: 2016-06-02 17:05:50
---

如果你的博客拥有自己的独立域名，有没有想过再拥有一个类似于 **i@yourdomain.com** 的专属邮箱呢，看上去有木有很酷的样子，其实实现很简单，而且完全免费哦。
<!-- more -->

## step 1
Firstly， 你需要拥有一个域名，如果暂时没有想购买域名的话可以去[godaddy](https://sg.godaddy.com/zh?isc=CJC2OFF30&ci=)或者[阿里云](https://wanwang.aliyun.com/domain/?spm=5176.7960203.1907008.1.q8vhml)等网站购买，首次购买挺便宜的，差不多一年五六十块rmb的样子，但是注意godaddy等国外域名服务商购买的域名不需要备案，省事适合个人博客，另外比较好的顶级域名很抢手，赶紧去抢注吧，指不定还能赚一笔呢（据说jd.com是花了三千万买的）！

## step 2
Secondly，假设你已经成功的购买到自己心仪的域名并做了dns解析，这时候你需要选择一个免费企业邮箱服务商，貌似网易、腾讯、阿里等都提供这样的服务，这里以[网易免费企业邮](http://ym.163.com/)为例。点击首页的创建，若你的域名是example.com，你就可以创建类似@example.com的域名邮箱。具体的操作步骤请[参考这里](http://app.ym.163.com/ym/help/help-hmail.html#3.6)。

## step 3
Thirdly，网易会要求你验证这个域名确实是属于你的，具体的操作步骤[帮助中心](http://app.ym.163.com/ym/help/help-hmail.html#3.6)也有介绍，对于这里的操作可能有人会感到困惑。下面我来具体解释一下。
当你购买了一个域名后需要对其进行dns解析别人才能通过你的域名访问到你的服务器，一般你购买域名的网站也会提供域名解析服务，也可以通过类似[DNSPod](https://www.dnspod.cn/)这样专门提供dns解析服务的网站进行解析。打开管理页面看到类似于这样（以我的域名在DNSPod的设置为例）：

![](http://7u2eve.com1.z0.glb.clouddn.com/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20160602195333.png)

其中MX记录和TXT记录是按照网易企业邮箱的要求刚刚添加上去做域名验证的，下面对这些记录做一些解释。
- A记录
A (Address) 记录是用来指定主机名（或域名）对应的IP地址记录。用户可以将该域名下的网站服务器指向到自己的web server上。可以看到这里有两条A记录的记录值分别对应着两个具体的ip，因为我的博客是托管在github上的，因此这两个ip就直接解析到了github pages的服务器。

![](http://7u2eve.com1.z0.glb.clouddn.com/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20160602200229.png)

- NS记录
同样可以看到两条NS记录分别指向f1g1ns1.dnspod.net和f1g1ns2.dnspod.net，NS记录是用来指定该域名由哪个DNS服务器来进行解析，而f1g1ns1.dnspod.net和f1g1ns2.dnspod.net便是DNSPod的专用域名解析服务器的域名。
- CNAME记录
别名记录。别名解析是先将域名解析到主机别名再转跳到IP，这样主机IP改变了不用重新解析。例如我的CNAME是将www.jverson.com解析到jiwenxing.github.io，jiwenxing.github.io是我的github pages主页地址，这样的话假设github pages服务器ip发生变化时，我的A记录就失效了，但此时可以通过CNAME记录解析到jiwenxing.github.io，而这个域名肯定可以被正确的解析，这样就不会造成不可访问的问题了。另外目前很多虚拟主机或者vps都是使用了cdn加速的，对应的不仅仅是一个ip，如果仅仅做A记录解析到一个ip，就丢失了cdn的加速效果。
- MX记录
邮件交换记录，它指向一个邮件服务器，用于电子邮件系统发邮件时根据收信人的地址后缀来定位邮件服务器。例如，当Internet上的某用户要发一封信给 user@mydomain.com 时，该用户的邮件系统通过DNS查找mydomain.com这个域名的MX记录，如果MX记录存在， 用户计算机就将邮件发送到MX记录所指定的邮件服务器上。我这里的MX记录设置的是mx.ym.163.com.即网易免费企业邮的邮箱服务器。这样发送到***@jverson.com的邮件便会被网易的服务器接收。
- TXT记录
TXT记录通常用来做SPF（Sender Policy Framework，发信者策略架构），是为了防范垃圾邮件而提出来的一种DNS记录类型。SPF是跟DNS相关的一项技术，它的内容写在DNS的txt类型的记录里面。mx记录的作用是给寄信者指明某个域名的邮件服务器有哪些。SPF的作用跟mx相反，它向收信者表明，哪些邮件服务器是经过某个域名认可会发送邮件的。可以看到我这的设置是 **v=spf1 include:spf.163.com ~all** ，也就是说我授权网易可以以我的域名即jverson.com的名义发送邮件。

## step 4
Last but not least，进行MX验证服务之前，需要先进行实名认证服务，只有当您的实名认证资料通过后，MX验证服务才会生效。一般等个几小时就能验证完成，这是你便可以随意创建自己的邮箱了，我正在纠结用i@jverson.com还是me@jverson.com，哈哈，真是幸福的烦恼~
