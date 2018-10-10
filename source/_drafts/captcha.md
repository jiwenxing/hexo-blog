title: Completely Automated Public Turing test to tell Computers and Humans Apart
categories: Coding
tags: [Java]
toc: false
date: 2016-05-04 15:12:39
---

![](http://
pgdgu8c3d.bkt.clouddn.com/24fde0b64eeee64015e4f9c5c3319da.jpg)
<!-- more -->

是不是看到题目一脸懵逼^_^，换句人话其实就是验证码，验证码是网站做人机区分的一种常用手段。想必大家对12306的BT验证码还历历在目吧，尽管遭到无数的吐槽和调侃，但是不可否认验证码作为一种辅助安全手段在Web安全中起着重要的作用，可以一定程度上防止恶意破解密码、刷票、论坛灌水等非法操作。这里我们就来探究一下目前的一些验证码解决方案及其安全性。

> 全自动区分计算机和人类的图灵测试（英语：Completely Automated Public Turing test to tell Computers and Humans Apart，简称CAPTCHA），俗称验证码。

## Google Kaptcha

[Kaptcha](https://github.com/axet/kaptcha)是一个验证码生成引擎，axet使得基于maven的工程可以很方便的集成自己的项目中，只需要在pom中添加以下依赖即可。

```xml
 <dependencies>
    <dependency>
      <groupId>com.github.axet</groupId>
      <artifactId>kaptcha</artifactId>
      <version>0.0.9</version>
    </dependency>
 </dependencies>
``` 

示例的controller代码如下。

```java
@Controller
public class CaptchaController {
	@Resource
	private Producer producer;
	@Autowired
	private RedisService redisService;	

    //verification_key可以是一个随机数，例如uuid
	@RequestMapping(value="/captcha/{verification_key}")
	public ModelAndView getPostCodeKaptchaImage(HttpServletRequest request, @PathVariable("verification_key") String verification_key,HttpServletResponse response)
	throws Exception {
		
		try {
			//禁止缓存使得每次点击验证码都可以刷新
			response.setDateHeader("Expires", 0);
			response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
			response.addHeader("Cache-Control", "post-check=0, pre-check=0");
			response.setHeader("Pragma", "no-cache");
			response.setContentType("image/jpeg");
			
			// 将验证码内容写入Redis，用户提交表单时取回验证（也可以暂存在cookie里）
			if(StringUtils.isNotBlank(verification_key)) {
				// 生成验证码内容
				String capText = producer.createText();
				redisService.createVerification(verification_key, capText);
				
				// 输出验证码图片
				BufferedImage bi = producer.createImage(capText);
				ServletOutputStream out = response.getOutputStream();
				ImageIO.write(bi, "jpg", out);
				try {
					out.flush();
				} finally {
					out.close();
				}
			}
		} catch (Exception e) {
		}
		return null;
	}
}
```

Kaptcha提供比较丰富的配置参数，可以在Producer的实现类DefaultKaptcha自动装载的时候进行相关配置。

```xml
<bean id="producer" class="com.google.code.kaptcha.impl.DefaultKaptcha">
	<property name="config">
		<bean class="com.google.code.kaptcha.util.Config">
			<constructor-arg>
				<props>
					<!-- 验证码宽度 -->  
                    <prop key="kaptcha.image.width">70</prop>   
                    <!-- 验证码高度 -->  
                    <prop key="kaptcha.image.height">30</prop>  
                    <!-- 生成验证码内容范围 -->  
                    <prop key="kaptcha.textproducer.char.string">0123456789</prop>  
                    <!-- 验证码个数 -->  
                    <prop key="kaptcha.textproducer.char.length">4</prop>  
                    <!-- 是否有边框 -->  
                    <prop key="kaptcha.border">no</prop>  
                    <!-- 边框颜色 --> 
                    <prop key="kaptcha.border.color">105,179,90</prop> 
                    <!-- 边框厚度 -->  
                    <prop key="kaptcha.border.thickness">1</prop>  
                    <!-- 验证码字体颜色 -->  
                    <prop key="kaptcha.textproducer.font.color">0,0,0</prop>  
                    <!-- 验证码字体大小 -->  
                    <prop key="kaptcha.textproducer.font.size">20</prop>  
                    <!-- 验证码所属字体样式 -->  
                    <prop key="kaptcha.textproducer.font.names">Courier</prop>  
                    <!-- 干扰线颜色 -->
                    <prop key="kaptcha.noise.impl">com.google.code.kaptcha.impl.NoNoise</prop>
                    <prop key="kaptcha.noise.color">100,100,100</prop>
                    <prop key="kaptcha.obscurificator.impl">com.google.code.kaptcha.impl.ShadowGimpy</prop>
                    <!-- 验证码文本字符间距 -->  
                    <prop key="kaptcha.textproducer.char.space">3</prop>
				</props>
			</constructor-arg>
		</bean>
	</property>
</bean>
```

最后在你需要展示验证码的html中加上```<img class="captcha" src="/captcha/uuid" alt="验证码">```便可以看到如下所示的预览效果。

![](http://
pgdgu8c3d.bkt.clouddn.com/TimLine%E5%9B%BE%E7%89%8720160505155349.jpg)

captcha就是一款典型的传统验证码解决方案，目前此类验证码的安全性已经很低甚至于形同虚设，可以轻松的被光学字符识别（OCR, Optical Character Recognition）之类的电脑程序自动辨识，因此并不适合应用于安全性要求较高的场合。

## Google reCAPTCHA
reCAPTCHA是Google推出的一种“简化”的图灵测试，可以通过一种更简单的方法来判断机器人：点击一个复选框。也就是说你只需要像下图一样勾选“我不是机器人（I'm not a robt）”，谷歌便能够识别出是人或者机器的一次操作。这是因为reCaptcha功能会在“不经意间”收集大量信息，包括IP地址和cookies，然后通过收集这些数据看对方是否和过去在互联网上的行为一致，来判定这个用户究竟是不是机器人。尽管reCAPTCHA相对于传统手动输入的验证码相比对用户更加友好，但还是有人担心谷歌过度收集用户信息，并且网上也出现了一些破解算法。

![](http://
pgdgu8c3d.bkt.clouddn.com/547fbadc3fff5.gif)

## geetest

国产验证码解决方案[极验（点击体验）](http://www.geetest.com/exp_normal)，利用行为判别算法，用户只需要轻轻拖动滑块即可完成验证。个人觉得在体验和安全性上较传统的验证码形式都更好的表现，还带有一点点趣味性，唯一美中不足的是免费版的有1000次/小时的累积验证量限制，安全性也较收费版更低。


## Reference

[1]. [kaptcha](https://github.com/axet/kaptcha)   
[2]. [Googlere CAPTCHA](http://www.google.com/recaptcha/intro/index.html)    
[3]. [极验](http://www.geetest.com/)    