title: Maupassant主题添加Instagram相册
date: 2015-12-29 19:09:42
categories: Coding
tags: [JavaScript]
toc: true
---

之前一直使用一个叫[**yilia**](https://github.com/litten/hexo-theme-yilia)的主题，很喜欢它相册的功能，可以直接将Instagram的照片拉取过来展示到博客。直到我遇见了[**Maupassant**](https://github.com/pagecho/maupassant)，一眼就喜欢上了，非常简洁耐看，而且相比较之前的yilia多了一分朴素和稳重。<!-- more -->


对于我这种前端小白，将yilia中的相册挪到Maupassant中着实费了一番功夫，不过最终经历千回百转还是实现了，下面简单介绍一下实现过程。

## 创建相册页签

![](http://7u2eve.com1.z0.glb.clouddn.com/810738144892721482.jpg)

首先需要在Maupassant博客中添加相册的页签如图。在Hexo根目录的source文件夹下创建一个空文件夹，不妨就起名instagram，然后创建一个index.md
文件，编辑文件内容如下：

```markdown
---
title: "My album"
noDate: "true"
---
<div class="instagram">
</div>
<script src="/js/jquery.lazyload.js"></script>
<script src="/js/instagram.js"></script>
```
这里主要设置一下相册的标题以及引用加载照片需要的js资源，后面请求到的照片便会填充到class="instagram"的div中。然后进入到主题的根目录下打开_config.yml文件，在menu的配置中添加相册menu的名称、路径及图标信息如下：

> \- page: album   
     directory: instagram/  
     icon: fa-picture-o 


这时候再deploy一下就会发现相册页签已经出现了，当然还没有照片。这是你需要将页面引用的“jquery.lazyload.js”及“instagram.js”文件添加到**主题根目录**下source文件夹下的js文件夹中，[下载链接](https://github.com/litten/hexo-theme-yilia/tree/master/source/js)。

## Instagram接口

完成以上步骤后你会发现还是没有照片或者是别人的照片~囧，取自己的照片当然需要设置一些个人的信息。那么问题来了，Instagram是什么没听过啊？呃(⊙o⊙)…  没有Instagram账号！赶紧申请一个吧。啥Instagram上不去？！@#￥%……&*，经过九九八十一难终于注册了一个IG账号，下面我们看看[Instagram的api](https://www.instagram.com/developer/endpoints/users/)，在Endpoints标签下的Users里第一个接口便就是我们即将要用的接口。

![](http://7u2eve.com1.z0.glb.clouddn.com/TimLine%E5%9B%BE%E7%89%8720160426205807.jpg)

可以看到我们现在缺的就是图中框出来的Access Token，怎么获取这个token呢？

### Step 1

登陆[Instagram开发者平台](https://www.instagram.com/developer/)，按照下图的步骤注册一个new client。填写相关信息时Valid redirect URIs最好填为本机地址“http://localhost”，如果你将你的账号授权给别人的话，这里便可以填写你授权的应用链接；另外记得去掉"Disable implicit OAuth"前的小对号。

![](http://i.imgur.com/utTetpb.gif)

### Step 2

完成第一步之后就可以得到如图所示的一个new client的信息：

![](http://7u2eve.com1.z0.glb.clouddn.com/TimLine%E5%9B%BE%E7%89%8720160426211557.jpg)

看到里面有client_id信息我就放心了，然后将下面的链接复制到浏览器，将其中的CLIENT_ID_HERE替换为自己的client_id，然后，奇迹就出现了，请看下图。

> https://instagram.com/oauth/authorize/?client_id=[CLIENT_ID_HERE]&redirect_uri=http://localhost&response_type=token

![](http://i.imgur.com/sSWj1xR.gif)

### Step 3

上一步已经得到了Access Token，我还想简单的验证一下是不是有效怎么搞？前面不是有api么。复制到浏览器，将其中的ACCESS-TOKEN替换为你刚刚获取的token，回车，如果你看到眼前一堆json数据，那么恭喜你，已经万事俱备了。

> https://api.instagram.com/v1/users/self/?access_token=ACCESS-TOKEN

## 修改instagram.js文件

由于yilia之前的js中调用的接口已经被Instagram废弃，因此需要修改一下js中调用的接口。打开instagram.js文件找到getList方法，将其中的url替换为你刚才测试的链接即可。另外由于Instagram在某地被墙，你可能会经常会遇到请求失败的情况，如果你希望在请求超时给用户一个比较友好的界面，可以在回调中做一下处理。例如在我的博客中如果用户没有代理VPN请求图片失败时会展示如下界面，这个实现可以参考我的另一篇博客[JSONP error handling with jquery.ajax](http://jverson.com/2015/07/27/jsonp/)。

![](http://7u2eve.com1.z0.glb.clouddn.com/TimLine%E5%9B%BE%E7%89%8720160426213510.jpg)


## 注意（2016/06/06）

最近几天访问自己的相册发现只能拉取到最近的20张照片，查了一下发现是Instagram的api做了调整，所有的api调用都会被一道沙箱环境，只有app通过审核才可以继续正常使用这些api，这也是Instagram最近规范第三方应用的一系列措施之一，不过没关系，想看更多照片点击右上方的链接进入Instagram的官网查看即可。

![](http://7u2eve.com1.z0.glb.clouddn.com/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20160608102706.png)

## References

- [Instagram Developer](https://www.instagram.com/developer/endpoints/users/)
- [大道至简——Hexo简洁主题推荐](https://www.haomwei.com/technology/maupassant-hexo.html)
- [How to generate an Instagram Access Token](http://jelled.com/instagram/access-token#)
- [Hexo主题Yilia](http://litten.github.io/2014/08/31/hexo-theme-yilia/)