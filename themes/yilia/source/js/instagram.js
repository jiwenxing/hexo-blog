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
				liTmpl += '<li>\
								<div class="img-box">\
									<a class="img-bg" rel="example_group" href="'+data[em].bigSrclist[i]+'" title="'+data[em].text[i]+'"></a>\
									<img lazy-src="'+data[em].srclist[i]+'" alt="">\
								</div>\
							</li>';		
			}

			
			$('<section class="archives album"><h1 class="year">'+data[em].year+'<em>'+data[em].month+'月</em></h1>\
			<ul class="img-box-ul">'+liTmpl+'</ul>\
			</section>').appendTo($(".instagram"));
			

		}

		$(".instagram").lazyload();
		changeSize();

		setTimeout(function(){
			preLoad(data);
		},3000);
		
		$("a[rel=example_group]").fancybox();
	}

	var replacer = function(str){
		if(str.indexOf("outbound-distilleryimage") >= 0 ){
			var cdnNum = str.match(/outbound-distilleryimage([\s\S]*?)\//)[1];
			var arr = str.split("/");
			return "https://distilleryimage"+cdnNum+".ak.instagram.com/"+arr[arr.length-1];
		}else{
			var url = "http://photos-g.ak.instagram.com/hphotos-ak-xpf1/";
			var arr = str.split("/");
			return url+arr[arr.length-1];
		}
	}

	var ctrler = function(data){
		var imgObj = {};
		for(var i=0,len=data.length;i<len;i++){
			var d = new Date(data[i].created_time*1000);
			var y = d.getFullYear();
			var m = d.getMonth()+1;
			var da = d.getDate();
			var src = replacer(data[i].images.low_resolution.url);
			var bigSrc = replacer(data[i].images.standard_resolution.url); 
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
			}else{
				imgObj[key] = {
					year:y,
					month:m,
					date:da,
					srclist:[bigSrc],
					bigSrclist:[bigSrc],
					text:[text]
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
			timeout: 3000,
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
					 alert("hello success!");
/*					$('<div class="warncontainer">
				      <h1>Bad Request!</h1>
				      <p><strong>Dear friend, I am so sorry that your request has been blocked by the evil Great Fire Wall.</strong></p>
				      <p>
				        If you are still trying to visit this page,
				        <a href="http://www.zhiyanblog.com/goagent-chrome-switchyomega-proxy-2015-latest.html">click here</a> to learn how to surf the Internet over the <strong>Great Fire Wall</strong>
				        or <a href="http://xskywalker.software.informer.com/">click here</a> to download <strong>xskywalker</strong> to visit.
				      </p>').appendTo($(".instagram"));*/
				}
			},
			error:function(){  
    			//alert("hello error");
    			$('<section><h1 class="warncontainer">BAD REQUEST</h1><p class="warncontainer1"><strong>Dear friend, I am so sorry that your request has been blocked by the damned Great Fire Wall. Fxxk the GFW</strong></p><p id="suggestions">If you are still trying to visit this page,<a href="http://pan.baidu.com/s/1pKrBFwZ">click here</a> to download <strong>Lantern</strong> to visit over the <strong>Great Fire Wall</strong>.<p></section>').appendTo($(".instagram")); 
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
			$(".img-box").css({"width":"auto", "height":"auto"});
		}else{
			var width = $(".img-box-ul").width();
			var size = Math.max(width*0.26, 157);
			$(".img-box").width(size).height(size);
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
			var insid = $(".instagram").attr("data-client-id");
			if(!insid){
				alert("Didn't set your instagram client_id.\nPlease see the info on the console of your brower.");
				console.log("Please open 'https://instagram.com/developer/clients/manage/' to get your client-id.");
				return;
			}
			getList("https://api.instagram.com/v1/users/2059681846/media/recent/?client_id="+insid+"&count=100");
			bind();
		}
	}
})();
$(function(){
	Instagram.init();
})