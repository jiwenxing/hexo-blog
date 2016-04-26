title: 富文本编辑框wangEditor
date: 2016-04-13 16:09:42
categories: Coding
tags: [JavaScript]
toc: false
---

由于项目需要，在网上找了个富文本编辑框[**wangEditor**](wangEditor.github.io)，抱着试一试的态度用了一下，原以为这款个人开发维护的插件会有不少bug，使用之后经过我们测试人员全方位的测试检验，基本符合需求，并且较之前使用的[**simditor**](http://simditor.tower.im/)包含了更多的小功能。<!-- more -->

## wangEditor

wangEditor 是一款开源免费的基于javascript和css开发的html富文本编辑器。从下面的预览图可以看到增加了代码块、地图，插入表格等一些不常用、但正好是我们需要的小功能，而且有Demo和比较完整的[文档](http://www.kancloud.cn/wangfupeng/wangeditor2/113961)，上手很快，但对于我这样的业余前端来说使用中还是有一些需要注意的地方。

![](http://7u2eve.com1.z0.glb.clouddn.com/filehelper_1461659066987_36.png)


## 初始化

使用前首先在页面添加一个id=content的编辑器div元素（textarea也可以），然后使用new wangEditor('content')对其进行初始化即可，但是需要注意的是初始化js放在body的最后才能生效，如下所示，不知是何原因。

```html
<!DOCTYPE html>
<html>
<meta charset="UTF-8" />
	<title>joylink后台</title>
	<body>
		<div class="container-fluid">
			<!--富文本编辑框-->
			<div id="editArea"  style="display:none;">
			    <div style="width:80%; margin-top:50px;">
			        <div id="content" style="height:400px;max-height:500px;">
			            <p>请输入内容...</p>
			        </div>
					<div style="margin-top:10px;">
						<button type="button" class="btn btn-success btn_save_content" id="saveContent">保存</button>	
						<div class="error" style="margin-top:15px;margin-left:30px;"></div>
					</div>
			    </div>
			</div>
		</div>
		<script type="text/javascript" src="${rc.contextPath}/resources/js/wangEditor.min.js"></script>
		<script>
			//---- 初始化富文本编辑框插件 ----
			window.wangEditor.$body = $('body');
			var editor = new wangEditor('content');
			editor.config.uploadImgUrl = '/jlNav/uploadImg';    //controller的请求地址
		    editor.create();
		</script>
	</body>
</html>
```
## 图片上传

经过第一步初始化后大多数功能已经可以使用，但是图片上传只能通过url形式，还不能上传本地图片，因为本地图片是要传到服务器存储的，需要后台的配合。wangEditor里只需要配置一下图片上传请求的url如下所示，然后就可以看到编辑框图片上传的位置出现了选择本地图片的选项。

> editor.config.uploadImgUrl = '/jlNav/uploadImg';  //controller的请求地址


配置完编辑器后，本地图片上传时，编辑器便会向你配置的url发送一个post请求如下，在相应的controller里对文件进行上传处理返回该图片的url即可。

> Request URL:http://jverson.com/jlNav/uploadImg
Request Method:POST
------WebKitFormBoundarybWoD7tBsuqM8uVkn
Content-Disposition: form-data; 
name="wangEditorH5File"; 
filename="8724976127960344.jpeg"
Content-Type: image/jpeg


 对应 /jlNav/uploadImg 请求的controller在springMVC环境下代码如下所示，同时可以支持图片的form提交、复制粘贴、拖拽上传等多种上传方式，不同方式对应的Content-Disposition中的name不同，在controller中处理的时候需要注意。

```java
@ResponseBody
@RequestMapping(value = "/uploadImg", method = {RequestMethod.POST}, produces = {"application/json;charset=UTF-8"})
public String uploadImg(HttpServletRequest request, @RequestParam(value = "wangEditorH5File", required=false) MultipartFile formFile,
		@RequestParam(value = "wangEditorPasteFile", required=false) MultipartFile pasteFile,
		@RequestParam(value = "wangEditorDragFile", required=false) MultipartFile dragFile){
	MultipartFile file = (formFile!=null?formFile:pasteFile!=null?pasteFile:dragFile!=null?dragFile:null);
	String imgUrl = null;
	if (file != null) {
		try {
            imgUrl = fileUpDownUtil.uploadImgWithDFS(file.getInputStream());
            if (StringUtils.isNotBlank(imgUrl)) {
            	imgUrl = fileUpDownUtil.getDFSDefaultImgURI(imgUrl);
            }
        } catch (Exception e) {
        	e.printStackTrace();
        }
	}
    return imgUrl;
}
```


## 附注
作为个人开发维护的一款功能完善的实用插件，我相信作者付出了大量的精力和时间，感谢作者的开源精神，作为免费用户和受益者，不强制但应该给予作者小小的捐赠，不成敬意，但这是向劳动和分享精神的一种致敬。
