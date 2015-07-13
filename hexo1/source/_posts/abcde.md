title: Html5移动app开发
date: 2015-06-28 21:40:08
categories: Coding
tags: [App, Html5]
---

最近被借调做了一段时间的web app开发，其实就是利用当下流行的Html5做一些嵌入到native app的web页面，并利用jQuery及本地的api使这些web页面实现一些简单的逻辑控制和数据交互。<!-- more --> 

##BACKGROUND

微联是一款native的希望实现集中控制所有智能设备的超级app，只要智能设备接入到微联，便会在微联的设备列表里有一个专属的控制页面实现设备的远程交互和控制。显然对于不同的设备，其控制页面只是一个轻量级的应用并且需要寄生于微联这款native APP，因此当下比较火的基于Html5的web app技术再适合不过，同时html 5还具有良好的终端适配及容易上手的特点。

另外因为马上要回到原来的团队做网站的web开发，这里主要想对之前的工作做一些记录，重点对一些代码做上注释，以便以后如果再需要做类似的工作（比如以后我要自己做一款智能产品，app就可以完全自行开发啦，哈哈），可以有一些笔记可以作为参考和回忆，不至于长时间不用忘得一干二净。

##SAMPLE SHOW

下面是一款取暖器的产品，可以[点击这里](http://storage.360buyimg.com/devh5/1434352371065_index.html)查看其界面UI和源代码（在浏览器里右键->查看源代码)，注意这只是一个主界面的UI,由于配置与云端交互的逻辑，而这里并没有与云端建立长连接，因此在浏览器看不到页面的交互效果。

##SAMPLE CODE

下面是该产品web app的源代码，重点对一些控制接口的调用做了注释。
```html
<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0 , maximum-scale=1.0, user-scalable=0">

<!-- 修改css链接地址，引入jQuery及jdsmart的js库 -->
<link type="text/css" rel="stylesheet" href="http://storage.360buyimg.com/devh5/1434029150523_style.css">
<script type="text/javascript" src="http://storage.360buyimg.com/devh5/1431152228724_jquery.js"></script>
<script type="text/javascript" src="http://storage.360buyimg.com/devh5/1431576139678_jdsmart-1.0.0.js"></script>
<script type="text/javascript" src="http://storage.360buyimg.com/devh5/1433907378835_slider.js"></script>

<!-- 终端适配 -->
<script>
$(document).ready(function(){  //document.ready保证执行代码在DOM元素加载完成的情况下执行。
if (/android/i.test(navigator.userAgent)){
	//适配android
	$("#head").attr("class","andr");  //只是对header做了适配
}
if (/ipad|iphone|mac/i.test(navigator.userAgent)){	
    // 默认适配ios
}
});
</script>
<title>先锋智能取暖器</title>
</head>
<body>
<!--添加headerimage链接-->
<header id="head">
    <div class="imgbox"><img src="http://storage.360buyimg.com/devh5/1433906210381_figure.jpg"></div> 
    <h2>先锋智能取暖器</h2>
    <div class="online"><i></i>设备在线</div>
    <div class="not-online" style="display:none">
		<span><i></i>设备不在线</span>
		<div class="notmb">不能点击、蒙板</div>
    </div>
</header>
<!---->
<section>
	<div class="start" onClick="start()">启动</div>
    <!---->
    <dl class="warm" style="display:none">
    	<dt id=temp_value onClick="wendu()">24°</dt>
       	<dd onClick="dangwei()"><span id=dangwei_text>低档</span></dd>
    </dl>
<div class="ecobut" style=""><button onclick="eco1()" style="display: none;">ECO</button><button class="cur" onclick="eco2()" style="display: inline-block;">ECO</button></div>
    <div id="prompt_text" class="start_text">设备将于3小时后开启，请稍后。。。</div>
	
	
    <dl class="czbut">
    	<dt class="ts_off" onClick="ts_off()"><span>童锁</span></dt>
    	<dt class="ts_on" onClick="ts_on()" style="display:none"><span>童锁</span></dt>
       	<dd onClick="yykj()" class="yykj"><span>预约开机</span></dd>
       	<dd onClick="yygj()" class="yygj" style="display:none"><span>预约关机</span></dd>
    </dl>
    <div class="fot_off" onClick="shutup()" style="display:none"><span>关机</span></div> 
</section>
<!--预约开关机-->
<div id="page1" class="tanbox">
	<div class="timecon">
        <div class="time_box" id="time_bath">
            <p class="bg"><i>预约</i><i class="bgx"><em></em></i><i>小时</i></p>
            <div class="boxc col1">
                <ol class="hour"></ol>
            </div>
        </div>
        <div class="timbut">
            <a class=kjyy_start onclick="kjend()">启动</a>
			<a class=gjyy_start onclick="gjend()">启动</a>
        </div>
    </div>
</div>
<!--档位设置-->
<div id="page2" class="tanbox">
	<div class="timecon">
        <h3>档位设置</h3>
        <ul class="szlist">
            <li>
                <input id="radio_1" class="radio" name="radio" type="radio" value="1" checked >
                <label for="radio_1" class="trigger">低档</label> 
            </li>
            <li>
                <input id="radio_2" class="radio" name="radio" type="radio" value="2">
                <label for="radio_2" class="trigger">中档</label> 
            </li>
            <li>
                <input id="radio_3" class="radio" name="radio" type="radio" value="3">
                <label for="radio_3" class="trigger">高档</label> 
            </li>
        </ul>
        <div class="timbut">
            <a onclick="dangwei_end()">确定</a>
        </div>
    </div>
</div>
<!--档位设置-->
<div id="page3" class="tanbox">
	<div class="timecon">
        <h3>温度设置</h3>
        <div class="edsz"><span id="range_1"></span></div>
        <div class="timbut">
            <a onclick="wenduend()">确定</a>
        </div>
    </div>
</div>


<div class="mengban"></div>

<div class="loader none">
	<div class=" ball-beat">
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>
<script type="text/javascript">
//
 JDSMART.ready(function(){
			//showButton(true);//默认是显示的，所以这句可以注释掉
            getInitData();            
            setInterval(function(){
            	getInfo();
            }, 4000);
       
 });

 //可以注释掉
 function showButton(flag){
		JDSMART.app.config (		//配置导航按钮隐藏显示
            {
                    showBack:flag,   // 返回按钮，false是隐藏，true是显示
                    showShare:flag,
                    showMore:flag   // 更多按钮
            });
	};
//第一次进入设备控制界面根据云端数据对界面进行初始化配置	
function getInitData(){
    JDSMART.io.initDeviceData(function (suc) {
    	initData(suc);           
    });    
    };	

function controlDevice(command,callback){
    view_wait();  //指令执行中的动画效果
    JDSMART.io.controlDevice(  // 控制设备接口
            command,
            function (suc) {
                hide_wait(); 
                if(callback)
                    callback(suc);
            },
            function (error) {
               toast(error.errorInfo);
               hide_wait();
            }
    );
   };  
//toast
function toast(str){
	JDSMART.app.toast({"message":str},null);
	}
//随时调用此函数拉取云端数据对页面进行刷新	
function getInfo(){
    JDSMART.io.getSnapshot(
            function (suc) {              
            reflashData(suc);
            },
            function (error) {
                // 执行失败的回调
 			toast(error.errorInfo)
            }
    );

};   
var power; //因为在其它的function中要判断power值，因此定义为全局变量
var eco_value;  
function initData(suc){
if(typeof(suc)=="string"){
	suc = JSON.parse(suc); //string转换成Json格式
	}
	//设备在线状态判断
    if(suc.device.status){    //注意initData中为suc.device.status，而在getsnapshot中为suc.status
		var status = suc.device.status;
		if(status == 0){
			$(".online").css("display","none");
			$(".not-online").css("display","block");
			}else{
			$(".online").css("display","block");
			$(".not-online").css("display","none");
		
			}
		} 
	//设备名称	      
    if(suc.device.device_name){   
    	$(".tit_product").html(suc.device.device_name); 
    }	
	
	 $.each(suc["streams"], function(i,val){ 
     //设备工作状态
        
        if(val["stream_id"] == "power" && val["current_value"]){
            power = parseInt(val["current_value"]); //转为int型进行判断
			//开机状态，一般开关机的显示控制，h5页面已经写好，这里调用即可
			if(power==1){  
                $(".start").css("display","none");
				$(".fot_off").css("display","block");
				//$("#prompt_text").text("");
                $(".warm").css("display","block");
                $(".yygj").css("display","block");
                $(".yykj").css("display","none");
				$(".ecobut").css("display","block");				
				}else{   //关机状态
                $(".start").css("display","block");
				$(".fot_off").css("display","none");
				//$("#prompt_text").text("");
				$(".cur").css("display","none");
				$(".ecobut").css("display","none");
                $(".warm").css("display","none");
                $(".yygj").css("display","none");
                $(".yykj").css("display","block");
				$(".ecobut").css("display","none");				
				}
				
        }
		//档位显示，这里的显示控制一般就是代号到显示文本的转换
		if(val["stream_id"]=="stall"&&val["current_value"]){
		var dangwei = parseInt(val["current_value"]);
			if(dangwei == 1){
			   $("#dangwei_text").text("低档");	
			}else if(dangwei == 2){
			   $("#dangwei_text").text("中档");	
			}else if(dangwei == 3){
			   $("#dangwei_text").text("高档");	
			}
		}
	//设置温度显示
	if(val["stream_id"] == "tem" && val["current_value"]){
		var set_temp = parseInt(val["current_value"]);
		if(set_temp>4&&set_temp<38){
			$("#temp_value").text(set_temp+"°");	
			}else{
			$("#temp_value").text("24°");		
			}
		}		
	//预约时间显示
	if(val["stream_id"] == "book_time1" && val["current_value"]){
		var booktime = parseInt(val["current_value"]);
		if(power==2){
		if(booktime==0){
			$("#prompt_text").text("");		
			}else if(booktime==1){
			$("#prompt_text").text("设备将于0.5小时后开启，请稍后...");		
			}else{
			var lefttime = booktime-1;
			$("#prompt_text").text("设备将于"+lefttime+"小时后开启，请稍后...");
			}
		}
	}
	
	if(val["stream_id"] == "timeing1" && val["current_value"]){
		var closetime = parseInt(val["current_value"]);
		if(power==1){
		if(closetime==0){
			$("#prompt_text").text("");		
			}else if(closetime==1){
			$("#prompt_text").text("设备将于0.5小时后关闭，请稍后...");		
			}else{
			var leftclosetime = closetime-1;
			$("#prompt_text").text("设备将于"+leftclosetime+"小时后关闭，请稍后...");
			}
		}
	}
		//童锁
	if(val["stream_id"] == "lock" && val["current_value"]){
		var lock_value = parseInt(val["current_value"]);
		if(lock_value==1){
			$(".ts_off").css("display","block");
			$(".ts_on").css("display","none");
			}else{
		    $(".ts_off").css("display","none");
			$(".ts_on").css("display","block");			
			}
		}		
	if(val["stream_id"] == "eco" && val["current_value"]){
		eco_value = parseInt(val["current_value"]);
		if(eco_value==1){   //开启
		    	//$(".ecobut button").show();
	           // $(".ecobut button.cur").show();
			//$(".cur").css("display","none");
			//$(".cur0").css("display","inline-block");	//行内显示
				$(".ecobut button").show();
	            $(".ecobut button.cur").hide();	
			}else{
		    //$(".cur0").css("display","none");
			//$(".cur").css("display","inline-block");	//行内显示
				//$(".ecobut button").hide();
				//$(".ecobut button.cur").hide();			
				$(".ecobut button").hide();
	            $(".ecobut button.cur").show();
			}
		}
  
    });  
}

//快照刷新代码和initdata几乎一样，除了suc.deviece.status变成了suc.status
function reflashData(suc){
	if(typeof(suc)=="string"){
	suc = JSON.parse(suc);
	}
	
    if(suc.status){
		var status = suc.status;
		if(status == 0){
			$(".online").css("display","none");
			$(".not-online").css("display","block");
			}else{
			$(".online").css("display","block");
			$(".not-online").css("display","none");
		
				}
	} 

     $("#prompt_text").attr("style", "color:#868686");
	
	 $.each(suc["streams"], function(i,val){ 
      //设备工作状态
        if(val["stream_id"] == "power" && val["current_value"]){
            power = parseInt(val["current_value"]);
			//开机状态
			if(power==1){  
                $(".start").css("display","none");
				$(".fot_off").css("display","block");
				//$("#prompt_text").text("");
                $(".warm").css("display","block");
                $(".yygj").css("display","block");
                $(".yykj").css("display","none");
				$(".ecobut").css("display","block");				
				}else{   //关机状态
                $(".start").css("display","block");
				$(".fot_off").css("display","none");
				//$("#prompt_text").text("");
				$(".cur").css("display","none");
				$(".ecobut").css("display","none");
                $(".warm").css("display","none");
                $(".yygj").css("display","none");
                $(".yykj").css("display","block");
				$(".ecobut").css("display","none");				
				}
				
        }
		//档位显示
		if(val["stream_id"]=="stall"&&val["current_value"]){
		var dangwei = parseInt(val["current_value"]);
			if(dangwei == 1){
			   $("#dangwei_text").text("低档");	
			}else if(dangwei == 2){
			   $("#dangwei_text").text("中档");	
			}else if(dangwei == 3){
			   $("#dangwei_text").text("高档");	
			}
		}
	//设置温度显示
	if(val["stream_id"] == "tem" && val["current_value"]){
		var set_temp = parseInt(val["current_value"]);
		if(set_temp>4&&set_temp<38){
			$("#temp_value").text(set_temp+"°");	
			}else{
			$("#temp_value").text("24°");		
			}
		}		
	//预约时间显示
	if(val["stream_id"] == "book_time1" && val["current_value"]){
		var booktime = parseInt(val["current_value"]);
		if(power==2){
		if(booktime==0){
			$("#prompt_text").text("");		
			}else if(booktime==1){
			$("#prompt_text").text("设备将于0.5小时后开启，请稍后...");		
			}else{
			var lefttime = booktime-1;
			$("#prompt_text").text("设备将于"+lefttime+"小时后开启，请稍后...");
			}
		}
	}
	if(val["stream_id"] == "timeing1" && val["current_value"]){
		var closetime = parseInt(val["current_value"]);
		if(power==1){
		if(closetime==0){
			$("#prompt_text").text("");		
			}else if(closetime==1){
			$("#prompt_text").text("设备将于0.5小时后关闭，请稍后...");		
			}else{
			var leftclosetime = closetime-1;
			$("#prompt_text").text("设备将于"+leftclosetime+"小时后关闭，请稍后...");
			}
		}
	}
		//童锁
	if(val["stream_id"] == "lock" && val["current_value"]){
		var lock_value = parseInt(val["current_value"]);
		if(lock_value==1){
			$(".ts_off").css("display","block");
			$(".ts_on").css("display","none");
			}else{
		    $(".ts_off").css("display","none");
			$(".ts_on").css("display","block");			
			}
		}		
	if(val["stream_id"] == "eco" && val["current_value"]){
		eco_value = parseInt(val["current_value"]);
		if(eco_value==1){   //开启
		    	//$(".ecobut button").show();
	           // $(".ecobut button.cur").show();
			//$(".cur").css("display","none");
			//$(".cur0").css("display","inline-block");	//行内显示
				$(".ecobut button").show();
	            $(".ecobut button.cur").hide();	
			}else{
		    //$(".cur0").css("display","none");
			//$(".cur").css("display","inline-block");	//行内显示
				//$(".ecobut button").hide();
				//$(".ecobut button.cur").hide();			
				$(".ecobut button").hide();
	            $(".ecobut button.cur").show();
			}
		}
		
    });  
}  

//参数是元素id，切换元素的隐藏和显示
function toggle(targetid){
     if (document.getElementById){
         target=document.getElementById(targetid);
             if (target.className=='block'){
                 target.className='none';
             } else {
                 target.className='none';
                 target.className='block';
             }
     }
}

//交互等待动画显示/隐藏
function view_wait(){
	$(".loader").removeClass("none");
	};
function hide_wait(){
	$(".loader").addClass("none");
	};
	
//开机
function start(){
	var command = {
		"command":[
					{
                        "stream_id": "power",
                        "current_value":"1"
                    }
                ]	
		
		}
	controlDevice(command,function(suc){
/*			$(".start").hide();
			$(".warm").show();
			$(".fot_off").show();
			$(".ecobut").show();
            $("#prompt_text").text("");	*/
			$("#prompt_text").text("");
			getInfo();
		});
	}		
	
//关机
function shutup(){
	var command = {
		"command":[
					{
                        "stream_id": "power",
                        "current_value":"2"
                    }
                ]	
		}
	controlDevice(command,function(suc){
/*		$(".start").show();
		$(".warm").hide();
		$(".fot_off").hide();
		$(".ecobut").hide();
        $("#prompt_text").text("");	*/
		$("#prompt_text").text("");
		getInfo();
		});		
	}
	
//预约开机
function yykj(){
	$("#page1").attr('class','tanbox dowtop');
	$(".mengban").show();
	$(".kjyy_start").show();  //开机预约和关机预约用相同的时间控件，但使用不同的启动按钮
	$(".gjyy_start").hide();
	}
	
function yygj(){
	$("#page1").attr('class','tanbox dowtop');
	$(".mengban").show();
	$(".kjyy_start").hide();
	$(".gjyy_start").show();
	}	
	
//预约开机确定
function kjend(){  
    //注意时间控件对当前设置时间的获取方法(.hour .on), class=hour下的某个值<li>被选中后会给其添加class=on的属性
	var book_time_value = parseInt($(".hour .on").text()); //中间空格表示下一级
	//alert(book_time_value);
	var command = {
		"command":[
					{
                        "stream_id": "book_time",
                        "current_value": book_time_value
                    }
                ]	
		
		}
	controlDevice(command,function(suc){
		$("#page1").attr('class','tanbox topdow');
		$(".mengban").hide();
		$(".start").hide();
		$(".yykj").hide();
		$(".yygj").show();
		$(".warm").show();
		$(".fot_off").show();
		$(".ecobut").show();
		getInfo(); //如果觉得控制后界面没有即刻响应，可主动调用一下快照刷新
		});	

	}

//预约关机确定
function gjend(){
	var timeing_value = parseInt($(".hour .on").text());
	//alert(book_time_value);
	var command = {
		"command":[
					{
                        "stream_id": "timeing",
                        "current_value": timeing_value
                    }
                ]	
		
		}
	controlDevice(command,function(suc){
		$("#page1").attr('class','tanbox topdow');
		$(".mengban").hide();
		$(".start").hide();
		$(".yykj").hide();
		$(".yygj").show();
		$(".warm").show();
		$(".fot_off").show();
		$(".ecobut").show();
		getInfo();
		});	

	}	
	
	//童锁
function ts_off(){
	var command = {
		"command":[
					{
                        "stream_id": "lock",
                        "current_value":"2"
                    }
                ]	
		
		}
	controlDevice(command,function(suc){
		$(".ts_off").hide();
		$(".ts_on").show();	
		});
	}
	
function ts_on(){
	var command = {
		"command":[
					{
                        "stream_id": "lock",
                        "current_value":"1"
                    }
                ]	
		
		}
	controlDevice(command,function(suc){
		$(".ts_off").show();
		$(".ts_on").hide();
		});
	}
	
//eco
function eco1(){
	var command = {
		"command":[
					{
                        "stream_id": "eco",
                        "current_value":"2"
                    }
                ]	
		
		}
	controlDevice(command,function(suc){
		$(".ecobut button").hide();
		$(".ecobut button.cur").show();
		});
	}
	
function eco2(){
	var command = {
		"command":[
					{
                        "stream_id": "eco",
                        "current_value":"1"
                    }
                ]	
		
		}
	controlDevice(command,function(suc){
		$(".ecobut button").show();
		$(".ecobut button.cur").hide();
		});
	}
//温度
function wendu(){
	$("#page3").attr('class','tanbox dowtop');
	$(".mengban").show();
	}
//温度确定
function wenduend(){
    //注意滑竿当前选定值的获取，及将类似23°的字符串转为int型处理
    var temp_set = parseInt($(".irs .irs-to").text().replace("°","")); //滑竿取值，和时间控件相同
	//alert(dangwei_set);
	var command = {
		"command":[
					{
                        "stream_id": "tem",
                        "current_value": temp_set
                    }
                ]	
		
		}
	if(eco_value==1){
	    $("#page3").attr('class','tanbox topdow');
		$(".mengban").hide();
		$("#prompt_text").attr("style", "color:#fe9429");
        $("#prompt_text").text("ECO模式开启，当前温度不可控！");
	}else{
		controlDevice(command,function(suc){
		$("#page3").attr('class','tanbox topdow');
		$(".mengban").hide();
		getInfo();
		});	
	}	
	}
//档位
function dangwei(){
	$("#page2").attr('class','tanbox dowtop');
	$(".mengban").show();
	}
	
//档位确定
function dangwei_end(){
    //radio 选择器, 给单选框添加value属性，然后这样即可得到其值
    var dangwei_set = parseInt($("input:checked").val()); 
	//alert(dangwei_set);
	var command = {
		"command":[
					{
                        "stream_id": "stall",
                        "current_value": dangwei_set
                    }
                ]	
		
		}
	
	if(eco_value==1){
	    $("#page2").attr('class','tanbox topdow');
		$(".mengban").hide();
		$("#prompt_text").attr("style", "color:#fe9429");
        $("#prompt_text").text("ECO模式开启，当前档位不可控！");
	}else{
	    controlDevice(command,function(suc){
		$("#page2").attr('class','tanbox topdow');
		$(".mengban").hide();
		getInfo();
		});	
	}	
	}

$(function(){
    $(".mengban").on('click', function() {
        $('.mengban').hide();
		$("#page1").attr('class','tanbox topdow');
		$("#page2").attr('class','tanbox topdow');
		$("#page3").attr('class','tanbox topdow');

    });
});

//设置当前温度
$(document).ready(function(){

	$("#range_1").ionRangeSlider({
		min: 5,
		max: 37,
		from:0,
		to: 24,
		type: 'double',//设置类型
		step: 0,
		prefix: "",//设置数值前缀
		postfix: "°",//设置数值后缀
		hasGrid: true
	});
	
	$("#selectStyle").change(function(){
		$("#styleSrc").attr("href",$(this).val());
	});
	
});

//////设置时间
function time_control(obj,times,viewobj){
	var htmls = {};
	htmls.hour = "";
	htmls.minute = "";
	htmls.second = "";
	var onindex = {};
	onindex.hour = 0;
	onindex.minute = 0;
	onindex.second = 0;
	var idx = 0;
	var tops = {};
	tops.hour = 0;
	tops.minute = 0;
	tops.second = 0;
	var line_height = 0;
	
	function gethtml(name){
		idx = 0;
		var k,j;
		for(i = times[name+"_min"]; i <= times[name+"_max"]; i += times[name+"_step"]){
			idx += 1;
			if(i ==  times[name+"_default"]){
				if(i<10){
					 k = "0"+i;
					}else{
						k=i;
						}
				htmls[name] += "<li class='on'>" + k + "</li>";
				onindex[name] = idx;
			}
			else{
				if(i<10){
					 j="0"+i;
					}else{
						j=i;
						}
				htmls[name] += "<li>" + j + "</li>";
			}
		}
		$(obj).find("."+name).html(htmls[name]);
		line_height = parseInt($(obj).find("."+name).find("li").height());
		tops[name] = (2 - onindex[name]) * line_height; 
		$(obj).find("."+name).css("top",tops[name]+"px");
	}
	if(times.hour_max > 0)gethtml("hour");
	if(times.minute_max > 0)gethtml("minute");
	if(times.second_max > 0)gethtml("second");
	
	var start_y,end_y;
	var canmove = false;
	var touch_obj;
	var box_height;
	var list_height;
	function touchStart(event){
		canmove = true;
        if (!event.touches.length) return;
    	var touch = event.touches[0];
    	start_y = touch.pageY;
		touch_obj = event.srcElement.parentNode;
		list_height = parseInt($(touch_obj).height());
		box_height = parseInt($(touch_obj).parent().height());
	}
	 
	function touchMove(event){
		if(canmove){
			event.preventDefault();
			if (!event.touches.length) return;
			var touch = event.touches[0];
			end_y = touch.pageY;
			var move_top = parseInt($(touch_obj).css("top")) + (end_y - start_y) / 8;
			move_top = move_top > line_height ? line_height : move_top < box_height - list_height - line_height ? box_height - list_height - line_height : move_top;
			var sel_idx = Math.round(move_top / line_height) > 0 ? Math.round(move_top / line_height) - 1 : Math.abs(Math.round(move_top / line_height)) + 1;
			sel_idx = sel_idx < 0 ? 0 : sel_idx > $(touch_obj).find("li").length - 1 ? $(touch_obj).find("li").length - 1 : sel_idx;
			$(touch_obj).css("top", move_top + "px");
			$(touch_obj).find("li").attr("class","");
			$($(touch_obj).find("li")[sel_idx]).attr("class","on");
			var return_time = {}
			return_time.hour = $(touch_obj).parent().find(".hour").find(".on").html();
			return_time.minute = $(touch_obj).parent().find(".minute").find(".on").html();
			return_time.second = $(touch_obj).parent().find(".second").find(".on").html();
			var t_html = "";
			t_html += return_time.hour >= 0 ? return_time.hour : "";
			t_html += return_time.minute > 10 ? ":"+return_time.minute :  return_time.minute >= 0 ? ":0"+return_time.minute : "";
			t_html += return_time.second > 10 ? ":"+return_time.second :  return_time.second >= 0 ? ":0"+return_time.second : "";
			$(viewobj).html(t_html);
		}
	}
	function touchEnd(event){
		if(canmove){
			var tops = Math.round(parseInt($(touch_obj).css("top")) / line_height);
			$(touch_obj).css("top",(tops * line_height) + "px");
			
		}
		canmove = false;
	}
	if($(obj).find(".hour").length > 0)$(obj).find(".hour").get(0).addEventListener("touchstart",touchStart,false);
	if($(obj).find(".minute").length > 0)$(obj).find(".minute").get(0).addEventListener("touchstart",touchStart,false);
	if($(obj).find(".second").length > 0)$(obj).find(".second").get(0).addEventListener("touchstart",touchStart,false);
	$(document.body).get(0).addEventListener("touchmove",touchMove,false);
	$(document.body).get(0).addEventListener("touchend",touchEnd,false);
}

var time1 = {};
time1.hour_min = 0;
time1.hour_max = 23;
time1.hour_step = 1;
time1.hour_default = 6;
time_control($("#time_bath"),time1,$(".t_bath"));

</script>
</body>
</html>

```