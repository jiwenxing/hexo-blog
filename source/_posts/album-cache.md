title: 利用七牛给相册添加缓存
categories: Coding
tags: [Cache]
toc: fasle
date: 2016-09-21 15:07:47
---

博客相册展示的是Instagram上的照片，众所周知的原因，当用户没有代理环境时就会访问失败，体验很差，一直琢磨啥时候有空对数据做一下缓存，使得未翻墙用户即使在接口请求失败的情况下也能展示缓存数据。<!--more-->

## 创建缓存资源
要做缓存就需要把Instagram的资源同步到缓存服务器（这里用的还是七牛），首先在代理环境下打开[个人Instagram相册]( "https://www.instagram.com/jverson1053/")，拉倒底部点击更多，这是随着页面滚动所有的数据都会加载。然后F12打开调试窗口，在console控制台执行以下代码：

```javascript
!function(t,e,r){var s=t.createElement(e),n=t.getElementsByTagName(e)[0];
s.async=1,s.src=r,n.parentNode.insertBefore(s,n)}(document,"script"
,"https://cdn.rawgit.com/jtsternberg/instascript/master/instascript.js");
```

这时你会惊讶的发现你的所有Instagram照片及小视屏被下载到了本地，以`E:/instagram`文件夹为例。这是一段网友[dsgnwrks](//dsgnwrks.pro/plugins-and-scripts/script-to-download-high-resolution-images-from-instagrams-website/)写的Instagram资源下载脚本，没看源码，用起来还算顺手。

再然后就需要将这些资源上传缓存服务器，也就是传到七牛上，这个简单，安装七牛的qrsbox，将刚才的文件目录设为资源同步目录，这些数据便自动上传到七牛的指定bucket里。至此，数据缓存搞定！

## 加载逻辑
首先jsonp请求Instagram api，如果成功直接返回数据展示，如果超时失败（没有代理环境），则在超时回调中get请求缓存资源进行展示。这个逻辑看上去很简单，本来希望在请求缓存资源时能够直接调用七牛的api获取到所有数据列表，无奈没有找到好用的api，于是想了一个不是很方便的方法，将Instagram接口请求成功返回的json数据保存为服务器的一个本地json文件例如`//jverson.com/data/instagram.json`，然后需要缓存数据时对这个文件进行get请求，并将其中资源url替换为缓存url（文件名相同，域和路径不同）返回，url替换规则如下：

```JavaScript
var replacer = function(str){
    // 将ins的图片资源替换为七牛的缓存链接
	var insUrlSplit = str.split('?')[0].split('/');
	var imgName = insUrlSplit[insUrlSplit.length-1];
	var qiniuPrefix = "//oe5sk3upn.bkt.clouddn.com/";
	return qiniuPrefix+imgName;
}
```

相册数据获取逻辑如下：

```javascript
$.ajax({
	url: url,
	type: "GET",
	dataType: "jsonp",
	timeout: 5000,
	success:function(re){
		if(re.meta.code == 200){
			_collection = _collection.concat(re.data);
			var next = re.pagination.next_url;
			if(next){
				getList(next);
			}else{
				$(".open-ins").html("图片来自我的Instagram，点此访问");
				ctrler(_collection);
			}
		}else{
			 alert("error_type:"+re.meta.error_type+"\nerrorMsg:"+re.meta.error_message);
		}
	},
	error:function(){  
		// if instagram api timeout,then fetch the qiniu cache
		$.ajax({
			url: "/data/instagram.json",
			type: "GET",
			dataType: "json",
			success:function(re){
				// console.log(re.data);
				var data = re.data;
				for(var i=0,len=data.length;i<len;i++){
					if (data[i].type=="image") {
						data[i].images.low_resolution.url = replacer(data[i].images.low_resolution.url);
						data[i].images.standard_resolution.url = replacer(data[i].images.standard_resolution.url); 
					}else{
						// data[i].videos.low_resolution.url = replacer(data[i].videos.low_resolution.url);
						data[i].videos.standard_resolution.url = replacer(data[i].videos.standard_resolution.url); 
						// data[i].images.low_resolution.url = replacer(data[i].images.low_resolution.url);
					}
				}
				$(".open-ins").html("Instagram图片来自缓存，实时数据需要翻墙");
				ctrler(data);
			}
		});
	}
});
```

## 待改进
- 由于Instagram启用了沙箱机制，限制了api只能获取到最近的20条数据，使用缓存则可以突破这个限制（例如直接调用七牛接口返回所有资源数据），但目前只是将ins接口返回的数据做了缓存，依然只能展示20条。
- 另外缓存的更新需要手动实现，即在代理环境下请求ins api，将返回最新json数据更新到`instagram.json`文件，重新部署。
- 个别缓存图片链接出现错误

## 参考
1. [qrsbox 图形界面同步上传工具](//developer.qiniu.com/code/v6/tool/qrsbox.html)
2. [Script to Download High-Resolution Images from Instagram’s Website](//dsgnwrks.pro/plugins-and-scripts/script-to-download-high-resolution-images-from-instagrams-website/)


