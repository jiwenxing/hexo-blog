title: 博客域名升级 Https
categories: Coding
tags: [Https]
toc: false
date: 2018-05-21 22:55:23
---

细心的你肯定有留意到我博客的地址栏左侧多了一个 Https 的小绿标吧，是不是瞬间就感觉高大上了，没错，我把博客域名升级到 Https 了。

<!— more —>

自从两年前好多站点全站升级 Https 开始，我就一直琢磨给自己的域名也添加一个证书，升级到 Https。但是那会证书基本都会收费，后来偶然发现七牛上可以申请免费证书，折腾了半天才发现需要域名备案（我不备案就是嫌麻烦），后来也就放弃了。

最近突然有一天打开 github 首页返现左上角的 broadcast 栏目里赫然写着

> Custom domains on GitHub Pages gain support for HTTPS

点进去仔细看了看[正文](https://blog.github.com/broadcasts/)，是5月1日出的通知，Github 从 2009 年开始支持自定义域名，从 2016 年开始 `*.github.io` 域名支持 Https，终于今天 GitHub Pages 上的自定义域名也开始支持 Https 啦！再往下看，原来是 Github 和 [Let’s Encrypt](https://letsencrypt.org/) 合作对建立在其上的上百万自定义域名站点进行的证书颁发和认证。

实现的方法也很简单，如果之前域名是做的 CNAME 或者 Alias 的 DNS 记录，则直接可以支持 Https 访问；如果直接是 A 记录做的解析，则需要更换 A 记录指向的 IP 地址为新的给定地址。最后在 Github Pages 仓库的设置页选中  “Enforce HTTPS” 选项即可。

配置的过程中有个小插曲，因为我的域名 DNS 配置是 A 记录，需要修改 IP 地址，我改完以后发现我的 settings 页面的 “Enforce HTTPS” 选项是置灰的，不能点击，于是我就想改一个子域名看看行不行，结果点击保存按钮以后整个 settings 页面就开始一直 502 无法访问了。没办法就邮件联系 Github 客服，没想到那边响应特别快，基本一个小时左右就能回邮件，经过三四封邮件往来，他们定位并 push 了 bugfix，当天就把我的问题解决了，而且 “Enforce HTTPS” 也可点击了，这里给 Github 的 Staff  Nick Cannariato 一个大大的赞！

目前比较遗憾的是还没有全站升级 Https，由于使用的是七牛的图床，其普通外链只支持 Http，要想支持 Https 需要绑定域名，并且要求域名一定要备案过得，这又把我给卡住了。导致现在凡是有七牛外链的页面都有 Mixed Content 的 Warning，小绿锁也会被隐藏起来。还有之前本来准备给相册用七牛的 CDN 服务，最后也是卡在必须要备案域名上，其实我也了解了一下，网上申请备案也不是很麻烦，但是不知道为什么就是很反感那些人为制造的看上去没啥意义的流程！

那就先这样吧！