title: AutoHotkey&qshell 实现图片自动上传七牛并返回markdown引用
categories: Coding
tags: [AutoHotkey]
toc: false
date: 2016-08-30 11:41:56
---


因为平时使用七牛作为图床，在 markdown 中使用图片时总是需要先将图片或者截图上传至七牛然后复制外链使用，总觉得这个过程很繁琐，直接影响了我在博客中使用图片的积极性，于是想我能不能就像写 word 一样复制图片到剪贴板后直接 ctrl+v 就能在 markdown 中引用呢？ <!-- more --> 答案显示是肯定的，并且借助于`qshell`和`AutoHotkey`很容易就能实现。

## 使用方法
如果你只想快速的使用这个小脚本，对其实现并不感兴趣，请按照以下步骤操作即可：
1. 安装 [qshell](http://developer.qiniu.com/code/v6/tool/qshell.html)
2. 新建一个 myAutoHotKey.ahk 文件，将以下代码复制进去
3. 修改其中的七牛的[AccessKey&SecretKey]( "https://portal.qiniu.com/user/key")、Bucket、外链默认域名以及当前工作路径（即你的qshell安装目录），当然也可以将快捷键改为自己喜欢的任意键组合。
4. 保存后右键点击该文件选择`Run Script`，然后选择任一图片`ctrl+c`复制，然后`ctrl+alt+Insert`上传，最后直接在markdown编辑器中`ctrl+v`即可。

```
; 我定义的快捷键为 ctrl+alt+Insert
^!Insert::
Random, rand, 1, 1000
filename =  %A_yyyy%%A_MM%%A_DD%%A_Hour%%A_Min%_%rand%.jpg
; MsgBox %filename%
AccessKey = ELUs327kxVPJrGCXqWae9yioc0xYZyrIpbM6Wh6o
SecretKey = LVzZY2SqOQ_I_kM1n00ygACVBArDvOWtiLkDtKi_
Bucket = forMyBlog
; E:\TOOLS\qiniu\为我的qshell安装目录
SetWorkingDir, E:\TOOLS\qiniu\
; To run multiple commands consecutively, use "&&" between each
Run, %comspec% /c qshell account %AccessKey% %SecretKey% && qshell fput %Bucket% %filename% %clipboard% http://up-z1.qiniu.com

clipboard =  ;
; http://ochyazsr6.bkt.clouddn.com 为我的七牛外链默认域名
clipboard = ![](http://ochyazsr6.bkt.clouddn.com/%filename%) 
```

下面分别对`qshell`及`AutoHotkey`的实现代码进行简单的介绍。

## qshell 方式上传图片
[qshell](http://developer.qiniu.com/code/v6/tool/qshell.html) 是基于七牛 API 参考手册实现的一个方便开发者测试和使用七牛 API 服务的命令行工具。下面首先来看看如何使用qshell进行图片上传。

- 按照说明安装 qshell
下载并解压 qshell，根据系统平台选择合适的可执行文件（其他的可删除），再把可执行文件重命名为 qshell 放在例如`E:/TOOLS`的目录下，然后在该目录下打开 DOS 命令行窗口即可执行 qshell 的相关指令。

- 设置 AccessKey 和 SecretKey
```
qshell account ELUs327kxVPJrGCXqWae9yioc0xYZyrIpbM6Wh6o LVzZY2SqOQ_I_kM1n00ygACVBArDvOWtiLkDtKi_ //set AccessKey&SecretKey
qshell account //查看设置结果
```

- fput 上传指令
完成上述步骤后便可以使用[`fput`](https://github.com/qiniu/qshell/wiki/fput)指令进行文件上传了。其中`forblog`是七牛的 bucket 名称，`test.jpg`是自定义的文件名，后面为文件存放目录，最后的`http://up-z1.qiniu.com`是上传入口地址（根据错误提示设置即可）。

```
qshell fput forblog test.jpg C:\Users\YEZHENYUE\Pictures\50625281
289792534.jpg http://up-z1.qiniu.com
Uploading C:\Users\YEZHENYUE\Pictures\50625281289792534.jpg => forblog : test.jp
g ...
Progress: 100%
Put file C:\Users\YEZHENYUE\Pictures\50625281289792534.jpg => forblog : test.jpg
 ( FmMuZK1yWMFzlxSpvSczPTPVRvAg ) success!
Last time: 0.44 s, Average Speed: 49.0 KB/s
```
上传成功以后图片的链接即为：`http://ochyazsr6.bkt.clouddn.com/test.jpg`，其中 ochyazsr6.bkt.clouddn.com 是七牛外链默认域名。

## AutoHotkey 实现自动上传
既然可以使用 qshell 工具上传图片，下面就需要定义快捷键使得触发后 qshell 能够自动将剪贴板里的图片上传并返回图片的 markdown 形式链接。下面对实现代码进行简单介绍。
`^!Insert::`： :: 左边为自定义快捷键(^代表ctrl，!为alt)，右边为执行指令
`Random, rand, 1, 1000`： 生成一个大于1小于1000的随机数用于定义文件名
`filename =  %A_yyyy%%A_MM%%A_DD%%A_Hour%%A_Min%_%rand%.jpg`： 文件名为当前时间和随机数的拼接，防止命名重复上传失败。
`SetWorkingDir, E:\TOOLS\qiniu\ `： 设置当前工作路径，从而可以直接在该路径下打开cmd窗口
`Run, %comspec% /c`： 调用Windows的DOS命令行工具，其中%ComSpec% 是脚本内建的用以指示命令行解释器位置的变量或宏，/c代表调用完毕窗口关闭，如果是/k则会保留窗口。
`qshell fput forblog %filename% %clipboard% http://up-z1.qiniu.com`：后面跟着的即为要在DOS命令提示符中要执行的指令，多个指令用`&&`连接。
`clipboard = ![](http://ochyazsr6.bkt.clouddn.com/%filename%)`：上传成功之后图片链接即为七牛默认域名拼上文件名，将其写为 markdown 引用形式放到剪贴板，直接 ctrl+v 即可使用。

## Todo
目前可以支持 png、jpg、gif 等多种格式图片的上传（虽然在七牛中统一以jpg为扩展名），基本可以满足我的使用要求，但是仍然还有一些待优化的地方：
- bug，文件路径及文件名不能包含空格（会导致剪贴板里的文件路径不完整）
- 不能将剪贴板里的截图直接进行上传，需要先保存在上传
- 实现网络图片直接复制上传，目前也是需要先手动下载到本地再上传

## References
[qshell 命令行工具](http://developer.qiniu.com/code/v6/tool/qshell.html)
[qshell fput 文件上传指令](https://github.com/qiniu/qshell/wiki/fput)
[markdown图片实用工具](https://github.com/tiann/markdown-img-upload)
[自动化操作轻松入门](https://zhuanlan.zhihu.com/p/19792473)



<a href="https://github.com/jiwenxing" target="_blank" rel="external"><a href="https://github.com/jiwenxing/qiniu-image-tool-win" title="Fork me on GitHub" class="fancybox" rel="article"><img style="position: absolute; top: 0; left: 0; border: 0;" src="https://camo.githubusercontent.com/121cd7cbdc3e4855075ea8b558508b91ac463ac2/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f677265656e5f3030373230302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_left_green_007200.png"></a><span class="caption">Fork me on GitHub</span></a>