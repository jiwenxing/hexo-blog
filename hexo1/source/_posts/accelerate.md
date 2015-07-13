title: 优化由Google字体造成的访问速度问题
date: 2014-08-07 15:58:29
categories: Coding
tags: [GitHub]
---

最近每次访问自己的博客巨慢无比，严重影响用户体验，浏览器下方一直在提示：
>正在等待fonts.googleleapis.com的响应...
<!-- more -->
##原因
忍无可忍，上网查找解决方案，原来是hexo主题默认使用的是google提供的字体，每次访问都要转到google的服务器加载，而google在国内大家都懂的。

##解决方法
找到..\hexo\themes\RagingCat\source\css目录下的style.styl文件打开
![](http://7u2eve.com1.z0.glb.clouddn.com/blogElement/style.PNG)


可以看到import了很多http:/fonts.googleapis.com的东西。而网上查了下，360网站卫士推出一项字体加速服务，即360将这些从google国外服务器import的东西下载下来存在了自己的服务器上供大家使用，从这点来看360也算是做了回业界良心。
具体方法：将其中的fonts.googleapis.com替换为fonts.useso.com即可，如下图所示。

![](http://7u2eve.com1.z0.glb.clouddn.com/blogElement/style2.PNG)

保存后再去试试，看看速度是不是杠杠的。。。
<br/>
<br/>

----------


