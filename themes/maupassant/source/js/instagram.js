var Instagram = (function(){

	var _collection = [];

	var preLoad = function(data){
		for(var em in data){
			for(var i=0,len=data[em].srclist.length;i<len;i++){
				var src = data[em].bigSrclist[i];
				var img = new Image();
				img.src = src;
			}
		}
	}

	var render = function(data){
		for(var em in data){
			var liTmpl = "";
			for(var i=0,len=data[em].srclist.length;i<len;i++){
				// images
				if (data[em].type[i] == "image") {
					liTmpl += '<li>\
								<div class="img-box">\
									<a class="img-bg" rel="example_group" href="'+data[em].bigSrclist[i]+'" title="'+data[em].text[i]+'">\
									<img lazy-src="'+data[em].srclist[i]+'" alt=""></a>\
								</div>\
							</li>';	
				}else{ // videos
					liTmpl += '<li>\
								<div class="img-box">\
									<a class="img-bg" rel="example_group" href="'+data[em].bigSrclist[i]+'" title="'+data[em].text[i]+'">\
									<video src="'+data[em].srclist[i]+'" onmouseover="this.play()" onmouseout="this.pause()" loop="loop" muted style="width: 100%;height: 100%;z-index:-1;">your browser does not support the video</video></a>\
								</div>\
							</li>';
				}
					
			}

			
			$('<section class="archives album"><span class="date-icon"></span><h1 class="year">'+data[em].year+'<em>'+data[em].month+'月</em></h1>\
			<ul class="img-box-ul">'+liTmpl+'</ul>\
			</section>').appendTo($(".instagram"));
				
			

		}

		$('<section style="text-align: center;background-color: #ccc;line-height: 30px;width: 65%;font-weight: bold;margin-left: 17%;margin-top: 6%;border-radius: 57%;"><a href="https://www.instagram.com/jverson1053/" target="_black" style="color: white;">Click Here to See More</a></section>').appendTo($(".instagram"));

		$(".instagram").lazyload();
		changeSize();

		setTimeout(function(){
			preLoad(data);
		},3000);
		
		$("a[rel=example_group]").fancybox();
	}

	var replacer = function(str){

        // 将ins的图片资源替换为七牛的缓存链接
		var insUrlSplit = str.split('?')[0].split('/');
		var imgName = insUrlSplit[insUrlSplit.length-1];
		var qiniuPrefix = "http://oe5sk3upn.bkt.clouddn.com/";
		return qiniuPrefix+imgName;
		// if(str.indexOf("outbound-distilleryimage") >= 0 ){
		// 	var cdnNum = str.match(/outbound-distilleryimage([\s\S]*?)\//)[1];
		// 	var arr = str.split("/");
		// 	return "https://distilleryimage"+cdnNum+".ak.instagram.com/"+arr[arr.length-1];
		// }else{
		// 	var url = "http://photos-g.ak.instagram.com/hphotos-ak-xpf1/";
		// 	var arr = str.split("/");
		// 	return url+arr[arr.length-1];
		// }
	}

	var ctrler = function(data){
		var imgObj = {};
		for(var i=0,len=data.length;i<len;i++){
			var d = new Date(data[i].created_time*1000);
			var y = d.getFullYear();
			var m = d.getMonth()+1;
			var da = d.getDate();
			// console.log("tags:"+data[i].tags);
			// console.log("likes:"+data[i].likes.count);
			// console.log("low:"+data[i].images.low_resolution.url);
			// var src = replacer(data[i].images.low_resolution.url);
			var type = data[i].type;
			var videoImg = "";
			// console.log(type);
			if (type=="image") {
				var src = data[i].images.low_resolution.url;
				var bigSrc = data[i].images.standard_resolution.url;
				videoImg = ""; 
			}else{
				var src = data[i].videos.standard_resolution.url;
				var bigSrc = data[i].videos.standard_resolution.url; 
				// videoImg = data[i].images.low_resolution.url;
			}
			
			// console.log("stanrdard:"+data[i].images.standard_resolution.url);
			// var bigSrc = replacer(data[i].images.standard_resolution.url); 
			
			//var text = data[i].caption.text;
			if(data[i].caption.text==null){
				var text = "no description by Totoro";
			}else{
				var text = data[i].caption.text;
			}
			var key = y+"-"+m;
			if(imgObj[key]){
				imgObj[key].srclist.push(src);
				imgObj[key].bigSrclist.push(bigSrc);
				imgObj[key].text.push(text);
				imgObj[key].type.push(type);
				// imgObj[key].videoImg.push(videoImg);
			}else{
				imgObj[key] = {
					year:y,
					month:m,
					date:da,
					srclist:[bigSrc],
					bigSrclist:[bigSrc],
					text:[text],
					type:[type]
					// videoImg:[videoImg]
				}
			}
		}
		render(imgObj);
	}

	var getList = function(url){
		$(".open-ins").html("图片来自我的Instagram，访问需要翻墙哦…");
		// alert("hello begin!");
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
    			// $('<section><h1 class="warncontainer">BAD REQUEST</h1><p class="warncontainer1"><strong>Dear friend, I am so sorry that your request has been blocked by the damned Great Fire Wall. Fxxk the GFW</strong></p><p id="suggestions">If you are still trying to visit this page,<a href="https://getlantern.org/">click here</a> to download <strong>Lantern</strong> to visit over the <strong>Great Fire Wall</strong>.<p></section>').appendTo($(".instagram")); 
			},
/*			error:function(XMLHttpRequest, textStatus, errorThrown){
		        alert(XMLHttpRequest.status);
                alert(XMLHttpRequest.readyState);
                alert(textStatus);
				$('<div class="warncontainer">
				      <h1>Bad Request!</h1>
				      <p><strong>Dear friend, I am so sorry that your request has been blocked by the evil Great Fire Wall.</strong></p>
				      <p>
				        If you are still trying to visit this page,
				        <a href="http://www.zhiyanblog.com/goagent-chrome-switchyomega-proxy-2015-latest.html">click here</a> to learn how to surf the Internet over the <strong>Great Fire Wall</strong>
				        or <a href="http://xskywalker.software.informer.com/">click here</a> to download <strong>xskywalker</strong> to visit.
				      </p>').appendTo($(".instagram"));
				alert("hello error!");
			},*/                    
			complete:function(XMLHttpRequest, textStatus) {
                
                //alert("hello welcome!");
            }

		});
	}
	

	var changeSize = function(){	
		if($(document).width() <= 600){
			var width = $(".img-box-ul").width();
			var size = Math.max(width*0.35, 137);
			$(".img-box").width(size).height(size);
			$(".img-box").css({"margin-bottom":"10px"});
			$(".open-ins").css({"font-size":"10px"}); //缩小字体避免换行			
			// $(".description").css({"font-size":"12px"}); //副标题
			// $("#logo").css({"font-size":"35px"}); //标题
			//$(".img-box").css({"width":"auto", "height":"auto"});
		}else{
			var width = $(".img-box-ul").width();
			var size = Math.max(width*0.26, 157);
			$(".img-box").width(size).height(size);
			$(".open-ins").css({"font-size":"15px"}); 
			// $(".description").css({"font-size":"18px"}); //副标题
			// $("#logo").css({"font-size":"55px"}); //标题
		}
	}

	var bind = function(){
		$(window).resize(function(){
			changeSize();
		});
	}

	return {
		init:function(){
			//getList("https://api.instagram.com/v1/users/2059681846/media/recent/?access_token=2059681846.4f38fd6.b4d5736e2ec1402190815007124c66b8&count=100");
			// var insid = $(".instagram").attr("data-client-id");  $(".img-box").css({"margin-bottom":"10px","margin-bottom":"10px"});
			// if(!insid){
			// 	alert("Didn't set your instagram client_id.\nPlease see the info on the console of your brower.");
			// 	console.log("Please open 'https://instagram.com/developer/clients/manage/' to get your client-id.");
			// 	return;
			// }
			getList("https://api.instagram.com/v1/users/self/media/recent/?access_token=2059681846.4f38fd6.65fd54f42e1449fda45d8e059ea5e4b0");
			bind();
		}
	}
})();
$(function(){
	$('<a href="https://instagram.com/jverson1053" target="_blank" class="open-ins" style="float:right;font-size:15px;color:#6E7173;margin-top:10px">图片来自我的Instagram，点此访问</a>').appendTo($(".post-title"));
	Instagram.init();
})