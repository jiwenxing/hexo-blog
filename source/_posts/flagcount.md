title: 好玩的Flagcounter
categories: Coding
tags: [Hexo, Blog]
toc: false
date: 2016-04-20 19:24:27
---

无意间发现一个很好玩的东西——[**flagcounter**](//s05.flagcounter.com/index.html), 这个小工具可以帮你统计你的博客访问量及访客的国家分布，展示效果请向右看，另外使用起来也是炒鸡简单的哦。

<!-- more -->

![](//s05.flagcounter.com/css/images/logo.gif)


如果你想类似于我的博客这样将flagcount作为一个widget放置在博客右侧的区域，这就需要你添加一个小挂件。打开maupassant主题根目录的_config.yml配置文件，找到widgets的设置，会发现原主题已经提供了六种可用的小挂件，就在这里再添加一个flagcounter的widget即可。然后需要为新加的widget添加一个jade文件，从主题根目录进入到layout然后打开_widget文件夹，新建一个flagcounter.jade的文件，复制以下内容保存。

```html
.widget
.widget-title
i(class='fa fa-bar-chart')= ' ' + __('visitors')
\<a href="//s05.flagcounter.com/more/quj">\<img src="//s05.flagcounter.com/count2/quj/bg_FFFFFF/txt_000000/border_CCCCCC/columns_2/maxflags_10/viewers_0/labels_1/pageviews_1/flags_0/percent_0/" alt="Count you in" border="0" style="margin-top:10px;"></a>
```

别着急关闭文件，里面<\a>标签的内容需要换成你自己的，打开[flagcounter官网](//s05.flagcounter.com/index.html)，设置自己喜欢的样式，点击GET YOUR FLAG COUNTER并填写你的email之后就可以得到类似的一段代码，复制替换到flagcounter.jade文件保存关闭。done！

