title: 微信PAP（委托代扣）支付开发
date: 2015-12-20 22:40:51
categories: Coding
tags: [Java]
---
 
 微信支付在之前推出的JSAPI支付接口的基础上又推出了PAP的支付服务，所谓PAP，即微信所谓的委托代扣支付业务，用户只需要完成一次签约，以后消费便可授权商户进行自动扣款，无需每次都需要用户输入密码。经常使用滴滴打车的用户可能两个月前已经用过此项功能了，但是由于此项业务的特殊风险，微信目前好像并没有公开这项服务，只对几家关系良好的合作伙伴开放了PAP的接口，不过随着微信安全措施的升级，相信很快会有越来越多的商户接入此项服务。本文即是对PAP支付开发的相关介绍。<!-- more -->

## 准备工作
首先需要进行商户号等各项申请工作，最终拿到接口需要用到的以下一些参数：
- APPID：APPID是每一个APP和每一个公众号在微信平台的唯一标识，这里应该是用APP的APPID，注意不要用错哦
- MCHID：商户号，微信支付商户资料审核成功后回复邮件中的商户号
- KEY：在商户平台中设置的支付key，设置路径：微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
- PLAN_ID：模板id也是在商户后台设置，但是注意必须在风控审核通过之后才生效
当所有的申请审核手续全部完成以后也就拿到了已生效的接口需要用到的各项参数，下面就可以进入开发了，但是这里需要提醒一下的是，一定要提前进行相关的准备工作，因为微信申请审核的周期有可能会比较长，以免耽误开发进度。

## 签约
对于之前用过微信其它支付接口的同学来说，可能就只有签约接口是陌生的。微信的委托代扣签约流程其实类似于我们平常的微信支付。用户在商户的app进入到委托代扣签约页面以后，后台会生成一个用于签约的链接，点击签约便会唤醒微信app并打开微信的webview进入到签约页面，后续的签约便都是在微信上完成了。下图便是一个不是很规范的签约流程图，另外还会讲到签约需要注意的一些地方。<br>
![](http://7u2eve.com1.z0.glb.clouddn.com/wechatsign.jpg)
#### 签约参数request_serial 
签约参数里有一个request_serial（商户请求签约时的序列号，商户侧须唯一），大家在开发文档里应该都能看到，类型是String，刚开始用的是uuid一直没问题，后来突然有一天所有的签约连接打开都提示“参数构造错误”，后来与微信方沟通才知道他们将request_serial参数由String改为uint64了，也没有通知我们，还好我们业务没有上线。另外由于该参数需要保证商户端唯一，再考虑到并发，可建议大家使用ip转long加时间戳的方法。

#### 参数encode
签约连接里有些参数是需要进行encode，比如文档里要求notify_url是需要的；另外contract_display_account用户账户名称是要在微信签约页面展示的，如果有中文的话也需要encode；还有一个很奇怪现象是，签约链接里clientip是非必填的风控项，如果不encode直接传的话，安卓手机微信端签约时总会弹出选择浏览器的页面，导致签约不能正常进行，最后图省事就把clientip给去掉了。对了，encode是在生成签名之后的哦。

#### 时间戳timestamp限制10位
注意有些系统得到的时间戳是13位的，而微信限制为10位，因此需要截取掉3位

#### 签约结果异步通知
尽管签约结果是异步通知给商户的，但是根据微信工程师介绍及实测，签约结果通知几乎是实时的，也就是说绝大多数情况下，当用户在微信端签约完成返回到商户app之前商户已经收到通知了，但是为了慎重起见回到商户app之后前端可以做一个查询签约结果的效果稍微拖延一下用户，等待一两秒再去调用查询接口查询签约结果。

#### 查询签约结果
用户每次进入App的支付方式页面，都需要调用微信的签约查询接口确定用户是否已开通微信免密支付，从而向用户展示相应页面或状态。另外查询签约服务还可以负责维护本地签约数据与微信侧数据的一致性。具体流程如下所示：
<br>
![](http://7u2eve.com1.z0.glb.clouddn.com/wechatcheck.jpg)

#### 解除签约
解约同签约，但需要注意的是用户既可以在商户App解约也可以直接在微信客户端解约。区别是如果在商户App调用解约接口解约则会同步返回解约结果，如果是在微信客户端解约，则解约结果会通过商户后台设置的notify_url异步通知商户。附解约时序图和实测解约通知数据格式：<br>
![](http://7u2eve.com1.z0.glb.clouddn.com/wechat%E8%A7%A3%E7%BA%A6.jpg)

```xml
<xml>
	<change_type>DELETE</change_type>
	<contract_code>5feb99af29c340b69bc6800ca3066a8d</contract_code>
	<contract_id>201512210005943896</contract_id>
	<contract_termination_mode>2</contract_termination_mode>
	<mch_id>123837873</mch_id>
	<openid>oTxn5wu4H5sa5Bj9wwjsItssU7M8</openid>
	<operate_time>2015-12-21 19:37:23</operate_time>
	<plan_id>12227</plan_id>
	<request_serial>9223372036854775807</request_serial>
	<result_code>SUCCESS</result_code>
	<return_code>SUCCESS</return_code>
	<return_msg>OK</return_msg>
	<sign>FA84C9EA12F90550A5D32875AA0E1612</sign>
</xml>
```

## 支付&退款
对于财务系统很简单或者根本就没有财务系统的小商户来说，支付这部分开发会比较容易，只需要按照微信的接口文档调通接口，用户支付钱打到商户号绑定的银行卡即可。但是对于比较大型的商户，一般支付会涉及到订单系统、交易系统、台账系统、财务系统、仓储系统等，中间的逻辑就需要厘清。以下是支付流程图（业务不同会有所区别）及几点支付需要注意的问题。<br>
![](http://7u2eve.com1.z0.glb.clouddn.com/wechatpay.jpg)

#### 支付结果异步通知
调用支付接口支付完成后会返回一个实时结果，如果支付成功也会返回<result_code><![CDATA[SUCCESS]]></result_code>，但是不能根据此信息确认支付成功，这只说明支付请求没有出现异常，最终的支付业务成功还是需要收到异步通知结果才能确定。但是如果返回“SYSTEMERROR”及“BANKERROR”异常时，则需要调用查询接口确认支付结果。
注意微信的文档写的不太规范，起初拿到的文档里面写的是“余额不足”及“超限额”的异常是在同步结果中返回，后来经过测试发现“超限额”异常是同步返回，没有异步通知；但是“余额不足”异常同步返回成功，异步才会告知异常！并且异步返回异常时并不会回传包括“attach”字段在内的一些信息。下面是一些实际的测试数据：
- 超限额时同步返回结果，无异步通知 
```xml  
<xml>
	<return_code><![CDATA[SUCCESS]]></return_code>
	<return_msg><![CDATA[OK]]></return_msg>
	<appid><![CDATA[wxcb5534cjskdhfks3]]></appid>
	<mch_id><![CDATA[123837873]]></mch_id>
	<nonce_str><![CDATA[ZWju0IDf2U6ZJgXq]]></nonce_str>
	<sign><![CDATA[AE6EC119E21A8D64BE485938A93B0464]]></sign>
	<result_code><![CDATA[FAIL]]></result_code>
	<err_code><![CDATA[RULELIMIT]]></err_code>
	<err_code_des><![CDATA[交易金额超出限制]]></err_code_des>
</xml>  
```
- 余额不足时同步返回结果及异步通知  
同步结果： 

```xml  
<xml>
	<return_code><![CDATA[SUCCESS]]></return_code>
	<return_msg><![CDATA[OK]]></return_msg>
	<appid><![CDATA[wxcb5534cjskdhfks3]]></appid>
	<mch_id><![CDATA[123837873]]></mch_id>
	<nonce_str><![CDATA[lqfYK0sdRoje8IWP]]></nonce_str>
	<sign><![CDATA[AFB905E34349B94B20B595234FEA3846]]></sign>
	<result_code><![CDATA[SUCCESS]]></result_code>
</xml>  
```


异步通知：  

```xml  
<xml>
	<appid><![CDATA[wxcb5534cjskdhfks3]]></appid>
	<contract_id><![CDATA[20160122684623938]]></contract_id>
	<err_code><![CDATA[NOTENOUGH]]></err_code>
	<err_code_des><![CDATA[银行卡可用余额不足（如信用卡则为可透支额度不足），请核实后再试]]></err_code_des>
	<mch_id><![CDATA[123837873]]></mch_id>
	<nonce_str><![CDATA[5VYnrTNjA1kx9nDg]]></nonce_str>
	<out_trade_no><![CDATA[5410416012212010000020269]]></out_trade_no>
	<result_code><![CDATA[FAIL]]></result_code>
	<return_code><![CDATA[SUCCESS]]></return_code>
	<return_msg><![CDATA[OK]]></return_msg>
	<sign><![CDATA[66A1DF6591BB83ECC8AB79DF127C2153]]></sign>
</xml>   
```

- 支付成功时的异步通知 

```xml  
<xml>  
	<appid><![CDATA[wxcb5534cjskdhfks3]]></appid>
	<attach><![CDATA[{"amount":"29.90","Pin":"wenzibin2005","agencyCode":"541"}]]></attach>
	<bank_type><![CDATA[SPDB_DEBIT]]></bank_type>
	<cash_fee><![CDATA[2990]]></cash_fee>
	<cash_fee_type><![CDATA[CNY]]></cash_fee_type>
	<contract_id><![CDATA[20160122684623938]]></contract_id>
	<fee_type><![CDATA[CNY]]></fee_type>
	<is_subscribe><![CDATA[N]]></is_subscribe>
	<mch_id><![CDATA[123837873]]></mch_id>
	<nonce_str><![CDATA[pgYQFmLoHdigrN67]]></nonce_str>
	<openid><![CDATA[oTxn5wpEQxnmRuj0e_bbT5KJLw]]></openid>
	<out_trade_no><![CDATA[5410416012514320000182171]]></out_trade_no>
	<result_code><![CDATA[SUCCESS]]></result_code>
	<return_code><![CDATA[SUCCESS]]></return_code>
	<return_msg><![CDATA[OK]]></return_msg>
	<sign><![CDATA[D4FD9613C1C6D23EA5745ED2C54EC563]]></sign>
	<time_end><![CDATA[20151225143434]]></time_end>
	<total_fee>2990</total_fee>
	<trade_state><![CDATA[SUCCESS]]></trade_state>
	<transaction_id><![CDATA[1008740918201601252891325515]]></transaction_id>
</xml>   
```

可以发现当支付异常时（例如余额不足），异步通知的参数会少很多，只能用out_trade_no字段去识别订单。

#### 支付结果查询
据微信的研发人员介绍，支付结果查询接口需要在支付之后至少30秒才能准确获的支付结果

#### 退款
退款接口与其它接口唯一的不同是多了一个证书，官方有demo（[demo链接](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_3)），调试过程基本没有什么问题，附退款请求返回值：

```xml  
<xml>
	<return_code><![CDATA[SUCCESS]]></return_code>
	<return_msg><![CDATA[OK]]></return_msg>
	<appid><![CDATA[wxcb5534cjskdhfks3]]></appid>
	<mch_id><![CDATA[123837873]]></mch_id>
	<nonce_str><![CDATA[oQxaMheGcTSjZH7o]]></nonce_str>
	<sign><![CDATA[6764C2086F4AD1097AEFC25329410BBB]]></sign>
	<result_code><![CDATA[SUCCESS]]></result_code>
	<transaction_id><![CDATA[1005550918201512252307432422]]></transaction_id>
	<out_trade_no><![CDATA[151225541003079294892]]></out_trade_no>
	<out_refund_no><![CDATA[1512251854113034514]]></out_refund_no>
	<refund_id><![CDATA[2005550918201512250112155398]]></refund_id>
	<refund_channel><![CDATA[]]></refund_channel>
	<refund_fee>5</refund_fee>
	<coupon_refund_fee>0</coupon_refund_fee>
	<total_fee>5</total_fee>
	<cash_fee>5</cash_fee>
	<coupon_refund_count>0</coupon_refund_count>
	<cash_refund_fee>5</cash_refund_fee>
</xml>    
```
## 安全
由于支付属于安全级别比较高的业务，作为开发一定要注意可能存在的安全隐患，比如微信端接口返回数据及异步通知数据都要进行签名验证，另外部署的时候除了接收异步通知的接口以外，签约、解约、支付及退款等接口尽量都不要暴露在外网上。

## 附录
由于目前获得的官方开发文档资料不是很详尽，特将之前开发的一些主要代码传至github以供参考（[github链接](https://github.com/jiwenxing/wechat-pap-pay)）







