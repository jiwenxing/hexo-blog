title: AutoHotkey&qshell实现图片一键上传七牛并返回markdown引用
categories: Coding
tags: [AutoHotkey]
toc: false
date: 2016-08-30 11:41:56
---

**[qiniu-image-tool-win](https://github.com/jiwenxing/qiniu-image-tool-win)**是一个windows上提升markdown贴图体验的实用小工具，基于`AutoHotkey`和`qshell`实现，可以自定义快捷键，一键上传图片或截图至七牛云，获取图片的markdown引用至剪贴板，并自动粘贴到当前编辑器。<!--more-->

## 简介
因为平时使用七牛作为图床，在markdown中使用图片时需要先将图片或者截图上传至七牛然后复制外链使用，总觉得这个过程很繁琐，直接影响了我在博客中使用图片的积极性，坚持了一段时间以后实在忍无可忍，于是便有了`qiniu-image-tool`这个小工具，其中`qiniu-image-tool-win`为windows版本，其借助于`qshell`和`AutoHotkey`实现了图片或截图一键上传和引用，从此markdown中贴图成了一件非常愉悦的事情。

另外如果您使用mac，请参考[使用alfred在markdown中愉快的贴图](http://jverson.com/2017/04/28/alfred-qiniu-upload/)

## 用法
使用方法很简单，只需两步即可完成图片的上传和使用，[github](https://github.com/jiwenxing/qiniu-image-tool-win)有预览动图：

1. 复制本地图片、视频或js等其它类型文件至剪贴板（ctrl+c）or 使用喜欢的截图工具截图 or 直接复制网络图片
2. 切换到编辑器，`ctrl+alt+v`便可以看到图片链接自动粘贴到当前编辑器的光标处

## 安装
### 下载源码
相对于mac版本，windows版安装更加简单。首先从[github](https://github.com/jiwenxing/qiniu-image-tool-win/releases)上下载最新的release版本并解压到任意目录，在`qiniu-image-tool-win`文件夹中看到的目录结构应该是如下这样：
![](http://ochyazsr6.bkt.clouddn.com/afa184acc926d86a6ea786d7634500e7.jpg)
其中`dump-clipboard-png.ps1`是保存截图的`powershell`脚本，`qiniu-image-upload.ahk`即完成文件上传的`AutoHotkey`脚本。

### 安装 **AutoHotkey**    
文件夹中`AutoHotkey_1.1.25.01_setup.exe`是1.1.25版本的`AutoHotkey`安装包，您可以直接双击安装，也可以去[AutoHotkey官网](https://autohotkey.com/)下载安装最新版本，这是一款免费的、Windows平台下开放源代码的热键脚本语言，利用其通过自定义热键触发一系列系统调用从而完成自动化操作。

### 注册七牛账号并创建一个bucket   
[七牛](https://www.qiniu.com/)是一个云服务提供商，很多个人博客现在都喜欢用七牛的对象存储服务做图床，速度确实不错，有比较完整的文档和开发工具，另外实名以后有10G的免费空间使用，基本上满足使用。


### 配置脚本
文件夹中选中`qiniu-image-upload.ahk`文件，右键选择编辑脚本使脚本在编辑器中打开，找到下面这段代码:
         
```autohotkey
;;;; config start, you need to replace them by yours
ACCESS_KEY = G4T2TrlRFLf2-Da-IUrHJKSbYbJTGpcwBVFbz3D
SECRET_KEY = 0wgbpmquurY_BndFuPvDGqzlfWHCdL8YHjz_fHJ
BUCKET_NAME = fortest  ;qiniu bucket name
BUCKET_DOMAIN = http://7xry05.com1.z0.glb.clouddn.com/  ;qiniu domain for the image
WORKING_DIR = E:\TOOLS\qiniu-image-tool-win\  ;directory that you put the qshell.exe 
;;;; config end
```

修改这里的五个配置项的值，其中前四个配置项都与七牛账号相关：  

**`ACCESS_KEY` & `SECRET_KEY`**  
这是qshell操作个人账号的账号凭证，登陆七牛账号后在`个人面板->密钥管理`中查看，或者直接访问`https://portal.qiniu.com/user/key`查看。   

**`BUCKET_NAME` & `BUCKET_DOMAIN`**     
在`对象存储->存储空间列表`中选择或新建一个存储空间即bucket，点击该bucket在右边看到一个测试域名，该域名即bucketDomain是图片上传后的访问域名。这里要特别注意域名不要少了前面的http头和最后的那个斜杠。

查看以上四个参数的操作如下图所示：
![](http://ochyazsr6.bkt.clouddn.com/883c2cf5633cac4fba7b3719284ab678.gif)

**`WORKING_DIR`**。  
这是设置您的工作目录，即这些脚本所在的目录，比如我将从github上下载的release压缩包解压到了`E:\TOOLS`目录下，那我的`WORKING_DIR`就是`E:\TOOLS\qiniu-image-tool-win\`。这里要特别注意不要少了最后那个反斜杠。

## 运行脚本
至此所有的安装和配置过程都结束了，右键点击`qiniu-image-upload.ahk`文件选择运行脚本（Run Script），这时便可以在任务栏看到一个H字母的绿色图标在运行。这时便可以使用`ctrl+alt+v`尝试上传图片了。

## 调试脚本
如果以上操作完成后没有按照预期达到图片上传的效果，感兴趣的筒子可以先自己调试找一下原因，一般报错信息会打印在cmd命令行中，但是cmd窗口一闪而过可能看不清楚，这时候在`qiniu-image-upload.ahk`脚本文件中找到以`RunWait, %comspec% /c`开始的代码，并将其中的`/c`改为`/k`保存，然后在右下角任务栏找到运行着的H绿色小图标右键选择`Reload This Script`，再次尝试，这时候cmd窗口不会自动关闭，便可以看到具体的报错信息从而对症下药解决问题。

如果您在使用过程中有任何问题，也欢迎留言或在github中提交[issues](https://github.com/jiwenxing/qiniu-image-tool-win/issues)。

## 修改默认项
以下操作非必需，是对一些默认设置的修改，请根据喜好自行选择。

### 修改快捷键
脚本中默认的快捷键是`^!V`，即`ctrl+alt+v`(^代表ctrl，!为alt)，如果您希望修改为其它自己习惯的快捷键，直接修改并reload脚本即可生效。    
关于hotkey的符号与按键对应关系请参考 [You can use the following modifier symbols to define hotkeys](https://autohotkey.com/docs/Hotkeys.htm)

### 升级最新版 **qshell** 
qshell是基于七牛 API 参考手册实现的一个方便开发者测试和使用七牛 API 服务的命令行工具。源码文件夹中已自带1.8.0版本的`qshell.exe`，因此无需单独安装，如果您想使用最新版，可以去[qshell官网](http://developer.qiniu.com/code/v6/tool/qshell.html) 自行下载。

## 参考
- [qshell fput 文件上传指令](https://github.com/qiniu/qshell/wiki/fput)
- [Powershell-Scripts for dumping images from clipboard](https://github.com/octan3/img-clipboard-dump)


<a href="https://github.com/jiwenxing" target="_blank" rel="external"><a href="https://github.com/jiwenxing/qiniu-image-tool-win" title="Fork me on GitHub" class="fancybox" rel="article"><img style="position: absolute; top: 0; left: 0; border: 0;" src="https://camo.githubusercontent.com/121cd7cbdc3e4855075ea8b558508b91ac463ac2/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f677265656e5f3030373230302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_left_green_007200.png"></a><span class="caption">Fork me on GitHub</span></a>

