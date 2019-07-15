title: 使用 Alfred 在 markdown 中愉快的贴图
categories: Tools
tags: [Alfred Markdown]
toc: false
date: 2017-04-28 10:59:26
---

**[qimage-mac](https://github.com/jiwenxing/qimage-mac)**是一个mac上提升markdown贴图体验的实用小工具，可以自定义快捷键，一键上传图片或截图至七牛云，获取图片的markdown引用至剪贴板，并自动粘贴到当前编辑器。<!--more-->


## Introduction
`qimage`目前支持mac及windows，其中windows版基于Autohotkey实现，详细介绍请移步另一篇博文[AutoHotkey&qshell 实现图片自动上传七牛并返回markdown引用](//jverson.com/2016/08/30/autohotkey-markdown-uploadImage/)，本篇主要介绍mac上基于Alfred和qshell的实现和使用。


## Usage
使用方法很简单，只需两步即可完成图片的上传和使用，[github](https://github.com/jiwenxing/qiniu-image-tool)有预览的动图：

1. 复制本地图片或视频文件至剪贴板（cmd+c）／使用喜欢的截图工具截图
2. 切换到编辑器，`cmd+option+v`即可

怎么样，是不是想试一把，下面就跟着我来一步一步安装使用这个小工具吧。

### Pre-Work
开始之前需要做一些准备工作，注册七牛账号、安装必要的软件。   

1. 安装 Alfred with Powerpack   
如果你的mac上还没有安装`Alfred`(a productivity application for Mac OS X)，请先至[官网](https://www.alfredapp.com/)下载安装。另外由于该工具是基于Alfred的workflow功能实现，因此还需要购买Powerpack（£19），也不算很贵，如果充分利用的话还是很超值的，尽管网上也有破解版的。

2. 安装qshell  
`qshell`是一个基于七牛API服务的命令行工具，`qimage-mac`即使用脚本执行qshell指令实现账户信息设置及文件的上传操作。[官方文档](https://developer.qiniu.com/kodo/tools/1302/qshell)对qshell的安装和使用有非常详细的教程，这里不再赘述。**为了防止出现异常情况，这里强制要求将`qshell_darwin_amd64`文件重命名为`qshell`并移至`usr/local/bin`目录下。**安装完成后在任意目录执行`/usr/local/bin/qshell -v`如果显示当前qshell版本号表明安装成功。

3. 注册七牛账号   
[七牛](https://www.qiniu.com/)是一个云服务提供商，很多个人博客现在都喜欢用七牛的对象存储服务做图床，速度确实不错，有比较完整的文档和开发工具，另外实名以后有10G的免费空间使用，基本上满足使用。

### Installation
如果准备工作都已完成，下面开始安装配置`qimage-mac`。

1. [github](https://github.com/jiwenxing/qiniu-image-tool/releases)下载最新的release版本  
`qimage-mac`文件夹下双击`Qiniu.alfredworkflow`文件安装该workflow。效果如下图所示，其中`Hotkey`为快捷键配置，`Run Script`为AppleScript脚本，最右边两个分别是粘贴板和系统通知。
![](//
jverson.oss-cn-beijing.aliyuncs.com/2c1f76695ffd16c594e4b222f64b3686.jpg)

2. 配置workflow环境变量   
点击上图标出的环境变量图标，可以看到下图所示的四个配置项
![](//
jverson.oss-cn-beijing.aliyuncs.com/6ec3283e4782eed9b2995289a028e15e.jpg)
这四个配置项都与七牛账号相关：  
**AccessKey & SecretKey**  
这是qshell操作个人账号的账号凭证，登陆七牛账号后在`个人面板->密钥管理`中查看，或者直接访问`https://portal.qiniu.com/user/key`查看。   
**bucket & bucketDomain**
在`对象存储->存储空间列表`中选择或新建一个存储空间即bucket，点击该bucket在右边看到一个测试域名，该域名即bucketDomain是图片上传后的访问域名。
![](//
jverson.oss-cn-beijing.aliyuncs.com/883c2cf5633cac4fba7b3719284ab678.gif)

3. 设置快捷键及关联应用。  
双击`Hotkey`模块，设置自己习惯的快捷键用于触发该workflow执行，如图这里设置的就是`cmd+option+v`，另外如果担心和别的热键冲突或者只想在特定的app中激活该热键，在`Related Apps`页签中将该app拖拽进来即可。
![](//
jverson.oss-cn-beijing.aliyuncs.com/ab6d5581255f00511fa56a08aed3a4b1.jpg)

4. 开始使用   
这时候如果一切顺利的话，便可以使用了。如果使用过程有什么问题，如下图在设置环境变量的右侧有个debug图标，点击打开debug窗口，重新操作一次查看错误日志定位问题，如果依然不能解决问题欢迎留言或在github中提交 [issues](https://github.com/jiwenxing/qiniu-image-tool/issues)。
![](//
jverson.oss-cn-beijing.aliyuncs.com/d98503cde4aa2712d8fab3b0c644fa60.jpg)

## References
1. [qshell命令行工具](https://developer.qiniu.com/kodo/tools/1302/qshell)
2. [How to save a new jpg image from the clipboard](https://discussions.apple.com/thread/2379870?start=0&tstart=0)
3. [Workflow/environment variables](https://www.alfredforum.com/topic/9070-how-to-workflowenvironment-variables/)
4. [How to split a string](//erikslab.com/2007/08/31/applescript-how-to-split-a-string/)
 

<a href="https://github.com/jiwenxing" target="_blank" rel="external"><a href="https://github.com/jiwenxing/qiniu-image-tool" title="Fork me on GitHub" class="fancybox" rel="article"><img style="position: absolute; top: 0; left: 0; border: 0;" src="https://camo.githubusercontent.com/121cd7cbdc3e4855075ea8b558508b91ac463ac2/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f677265656e5f3030373230302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_left_green_007200.png"></a><span class="caption">Fork me on GitHub</span></a>

