title: 建立你的个人独立博客
date: 2014-03-04 10:49:16
categories: Thinking
tags: [GitHub]
---
我希望用我在Github上的第一篇博客来记录我三天以来搭建博客的过程及一些感受，一方面记录遇到的些问题和解决方法，另一方面谈谈自己的认识。注意这不是一篇建站指南，如果您需要比较详尽的建站教程请移步《[如何搭建一个独立博客——简明Github Pages与Hexo教程](http://cnfeat.com/2014/05/10/2014-05-11-how-to-build-a-blog/)》。
<!-- more -->
开始之前我们先探讨几个问题：

### 为什么要建一个独立博客
当然建博客是为了写博客，但是有那么多像CSDN、cnblog、新浪博客甚至QQ空间之类现成博客网站注册就可以使用，为什么还要在这瞎折腾呢。对我来说，它最吸引我的地方就是它可以绑定独立域名，可以任意的设计主题，这样会让我感觉它具有一定的独立性，它是真正属于我并且只为我服务的，这点对我很重要；另外我很喜欢markdown的写作形式，不是因为他多么方便、多么炫酷，只是感觉很简洁很优雅，其实我也说不上来，可能专业背景使然吧。当然这里必须说明，不是每个人都有这个必要，但如果你是一名程序员，或者你是一名博客达人、设计师，或者你仅仅是一个喜欢折腾的人，那么你一定会喜欢上它的。

### 为什么要写博客
写博客无非就是一些思考分析、经验分享、阶段总结以及生活感悟之类的，相信每一个坚持写博客的人都有一个自己的理由，不尽相同。以前我喜欢在QQ空间写一些赋新词强说愁的文字，后来因为学习需要在CSDN和百度空间写过一些技术文章，都没能坚持以至逐渐就废弃了。也是最近受了点小挫折，正好也比较闲，就思考了很多问题，很多很多。这才发现很久以来，自己都只是在学习却很少思考，这也是有时候你感觉为什么你那么努力，却始终很难得到你想要的结果，或者说你根本还不知道自己想要什么。

   >思考才使我们阅读的东西成为我们自己的。——洛克

   而在写作的时候，你便是在充分的思考。

   当然这只是我个人的感受，推荐您看看[这篇文章](http://zhuanlan.zhihu.com/cnfeat/19743861)

## 建站过程

### 你需要了解哪些背景知识
 
 #### 什么是GitHub
简单的讲，GitHub是一个具有版本管理功能的代码仓库，可以使用[GitHubPages](https://pages.github.com/)为每个项目建立一个主页，也就是用户编写的、托管在github上的静态网页。而我们搭建自己的博客即使用了其GitHub Pages功能。
![](http://7u2eve.com1.z0.glb.clouddn.com/blogElement/githubpages.PNG) 

 #### 什么是Hexo
Hexo出自台湾大学生tommy351之手，是一个基于Node.js的静态博客程序，[Hexo官网](http://hexo.io/)介绍其是一个快速的、支持Markdown格式、操作简单并且插件丰富的博客发布工具。Hexo可以将markdown格式文本生成的静态网页直接放到GitHub Pages等平台上。
    使用Hexo发表文章只需要三步：
 ``` bash
$ hexo new  "Title" #创建题为title的新博客
$ hexo generate    #生成静态页面至Hexo\public
$ hexo deploy      #部署至GitHub
  ```

 #### 需要哪些计算机基础
 本人是学电子的，会点C和Java，互联网尤其是前端的Html、Javascript及CSS之类的一概不懂，也就只花了两三天就把基本的操作和原理搞清楚了，觉得还挺有意思，最近准备买几本书系统的学习一下。所以不管你是什么职业，不管你懂不懂编程，你都可以做到，可能唯一需要就是你必须喜欢折腾。对了，再教你一招，其实我很久之前就有在github上建博客的想法，前几次用jekyll尝试都没搞成就放弃了，这次为了防止自己嫌麻烦放弃，就先把域名买了，一下买两年的，每次想放弃的时候就会想我的钱要白花了，，哈哈，当然这招对土豪应该不管用。

### 一些需要注意的设置项

#### SSH keys
得益于选修过信息安全这门课，对于SSH还有一定的了解，它是一种基于RSA非对称加密算法的安全协议，可以使本地git项目与远程的github实现无密码通信，在配置Hadoop的各个datanode时也需要配置SSH，也就是说将密钥一次性分发后，再次向github提交便不用再输密码了。

#### Github上创建仓库
Github上创建仓库时应该命名为username.github.io，好像这样是创建在master分支下的，如果写成其它的名字后面会报一些奇怪的错误，不知道原因。另外部署到github前需要配置一下hexo根目录的_config.yml，如下所示：
```
deploy:
type: github
repository: git@github.com:username/username.github.com.git
branch: master
```
注意在有些博客里repository设置为https://usename.github.io，这样的话后面每次部署都会需要输入用户名和密码，造成不必要的麻烦。

### 个性化配置自己的主题
 #### 选择自己喜欢的主题
 其实这个过程中最花费时间的是选择并个性化的配置一个自己喜欢的主题，[hexo官网](https://github.com/hexojs/hexo/wiki/Themes)提供很多网友贡献的主题，你可以任意选择一款，以ragingcat为例：
 ``` bash
 $ git clone https://github.com/RagingCat/hexo-theme-ragingcat.git themes/RagingCat
 ```
 **注意直接clone的主题在执行hexo generate时可能会报如下错误**
``` java
[error] { name: 'HexoError',
  reason: 'incomplete explicit mapping pair; a key node is missed',
  mark:
   { name: null,
     buffer: 'categories: Categories\nsearch: Search\ntags: Tags\ntagcloud: Tag Cloud\ntweets: Tweets\nprev: Prev\nnext:
 Next\ncomment: Comments\narchive_a: Archives\narchive_b: Archives: %s\npage: Page %d\nrecent_posts: Recent Posts\ndescr
iption: Description\nread_more: Read More\n\u0000',
     position: 163,
     line: 9,
     column: 19 },
  message: 'Process failed: languages/default.yml',
  domain:
   { domain: null,
     _events: { error: [Function] },
     _maxListeners: 10,
     members: [ [Object] ] },
  domainThrown: true,
  stack: undefined }
  ```
打开\themes\RagingCat\languages下的yml文件
![](http://7u2eve.com1.z0.glb.clouddn.com/blogElement/yml.PNG)
是不是冒号后面的单词都没有加双引号，问题就在这，加上就没问题了，这里需要感谢一下[Xuanwo](http://xuanwo.org/2014/08/14/hexo-usual-problem/)。

 #### 修改配置选项
 既然是建立的自己的博客，当然希望所有的特性都按照自己的喜好来配置，由于本人对CSS、js等技术暂时不太了解，因这里只介绍一些简单的配置。
正常情况下你clone的Theme文件夹的结构应该是这样的
.
├── _config.yml
├── languages
├── layout
├── scripts
└── source

- 首先打开_config.yml文件，根据里面的注释即可修改主页的menu、挂件Widgets、网站图标以及作者信息等很多选项。
- languages文件夹下可以看到网站可以有哪些语言选项，例如我的有default.yml（英文）、zh-CN（中文简体）及zh-TW（台湾繁体），那么打开hexo根目录下的_config.yml文件：

``` yml
Hexo Configuration
/## Docs: http://hexo.io/docs/configuration.html
/## Source: https://github.com/hexojs/hexo/
/# Site
title: Totoro's blog
subtitle: Writing your dream and coding your furture.
description: 
author: Ji.wenxing
email: ji_wenxing@163.com
language: 
```

最后一行language处便可配置网站的语言，不填则为默认default。如果你眼力架还可以你会发现这里同样可以设置主页的标题和子标题。

 - 将\themes\RagingCat\source\img下ico及Banner替换为自己的喜欢的图片，使用相同文件名直接覆盖即可拥有自己专属的网站图标和banner。

### 辅助工具的选择
#### 关于图床的选择
由于github的空间容量有限制，如果你的博客里需要大量的图片，那么你可能就需要选择一个适合你的图床了，对于大多数只用于博客的个人站点来说，我想一个免费的即使有各种限制的图床也完全够用。
我选择的[七牛云存储](http://www.qiniu.com/)，其实主要原因是论坛上好多人都推荐它，了解了一下，七牛是专门做网站资源托管的，体验用户可以获得1G的免费空间，可以上传证件照升级为标准用户获赠10G免费空间，而且还有专门的客户端用于管理这些资源，我想对于多数个人用户够用了。
另外网上很多人都提到了可以使用百度云盘、新浪微博、腾讯微博等做图床，个人觉得这些网站虽然都是大户人家，不会在意这点流量，但是毕竟不是合理的使用，随时都有可能将外链禁掉，百度空间好像就已经不好使了。

#### 关于Markdown编辑器的选择
选择一款方便顺手的markdown编辑器对于写作显然很重要，当然这也是萝卜青菜各有所爱的的问题，这里介绍一下我所使用的google chrome的[StackEdit插件](https://stackedit.io/)，如果你也使用chrome浏览器，那么我强烈推荐这款插件。
StackEdit是一个开放源码免费使用的MarkDown编辑器，基于PageDown，使用了Stack Overflow和其他Stack Exchange网站的 MarkDown库，stackoverflow出品。
功能：
 - 管理多个 MarkDown 文档，可在线或离线编辑
 - 通过模板导出 MarkDown 或 HTML 格式文件
 - 云同步 MarkDown 文档
 - 支持 Google Drive,  Dropbox 和本地硬盘驱动器等备份
 - 发布 MarkDown 文档在GitHub，GIST，Google Drive，Dropbox或任何SSH服务器
 - 转换HTML到 MarkDown

### 撰写博文
#### 如何删除之前的tags及categories

即当你将之前的某篇文章从本地删除掉并重新生成和部署到github后，访问站点发现文章虽已删除，但依然保留了该文章的tags及其所在categories目录，但都显示为0，这时如果你想将其彻底删除，删掉hexo根目录下的db.jason文件重新部署即可。

#### 不显示文章右上角的层级目录
if you don't want display contents in a specified post, you can modify *front-matter* and add *toc: false*.

#### 重装系统或者更换电脑后如何配置


1. 首先安装[Node,js](https://nodejs.org/)及[git](http://git-scm.com/)
2. 配置SSH
3. 安装hexo
4. 配置_config.yml文件，或者把之前的_config.yml拷贝过来，但记得hexo3.0版本以上的type要改为git而不是以前的github
5. $ git config --global user.name "yourname"  and  $ git config --global user.email  "youremail"
6. 如果还用以前的hexo文件夹，则把配置文件备份下，进入后和hexo init，再把配置文件替换回来

### 主题定制
#### 修改样式
套用的主题总会有些自己不喜欢的地方，怎么办呢？github博客的好处就是可以根据自己的喜好任意修改。一般如果只是稍微做些例如字体、颜色、位置等的小改动的话，在网页待修改的地方右键选择审查元素，可以看到其应用的样式，找到该样式文件（一般就是style.css）进行修改即可。
但是注意，因为有的样式文件例如article.css是作为单独文件被@import到style.css中的，只修改了article.css再hexo g的时候检测不到文件被改动过，也就不会被加载应用，这时候可以对style.css做一些无意义的改动再次生成即可（好像generate的时候只检测style的变动，import的样式变动不会被检测）。

----------
暂时先写这么多，还在不断摸索中，后面有更多的发现会不断更新，也希望您能不吝赐教。
<br/>


