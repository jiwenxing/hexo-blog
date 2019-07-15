title: Java模拟并发请求
categories: Coding
tags: [Concurrent, 并发]
toc: false
date: 2016-05-24 20:15:04
---

从Java5开始添加的一个提供各种并发编程方法的类**java.util.concurrent**，可以模拟并发请求，进行压测或者测试方法是否线程安全。    
<!-- more -->

最近遇到一个bug，之前线上正常运行了几个月的接口突然出现偶尔失败的情况，查日志发现接口生成的签名错误，而且都是在有并发请求时出错。检查了签名生成逻辑和线程安全感觉没有问题，于是就想在本地模拟一下并发跟一下代码寻找问题。

首先看一下签名生成方法，其中使用到的 **StringBuffer** 是线程安全的，其它的地方咋一看好像也没有什么问题。到底问题出在什么地方下面我们测一下就知道了。

``` java
public static String getSignature(SortedMap<Object, Object> parameters, String key) {
	StringBuffer sb = new StringBuffer();
    Set<Entry<Object, Object>> es = parameters.entrySet();
    Iterator<Entry<Object, Object>> it = es.iterator();
    while (it.hasNext()) {
        @SuppressWarnings("rawtypes")
        Map.Entry entry = (Map.Entry) it.next();
        String k = (String) entry.getKey();
        Object v = entry.getValue();
        if (null != v && !"".equals(v)) {
            sb.append(k + "=" + v + "&");
        }
    }
    sb.append("key=" + key);
    String sign = MD5Util.getMD5String(sb.toString()).toUpperCase();
    return sign;
}
```

**java.util.concurrent** 包含许多线程安全、测试良好、高性能的并发构建块。其中**CountdownLatch**类是对已经在它们中间分摊了问题的一组线程进行协调，**CountdownLatch** 将到达和等待功能分离。任何线程都可以通过调用 **countDown()** 减少当前计数，这种不会阻塞线程，而只是减少计数。调用 **await()** 任何线程都会被阻塞，直到闩锁计数减少为零，在该点等待的所有线程才被释放。当问题已经分解为许多部分，每个线程都被分配一部分计算时，**CountdownLatch** 非常有用。在工作线程结束时，它们将减少计数，协调线程可以在闩锁处等待当前这一批计算结束，然后继续移至下一批计算。具有计数1的 **CountdownLatch** 可以用作"启动大门"，来立即启动一组线程；工作线程可以在闩锁处等待，协调线程减少计数，从而立即释放所有工作线程。

``` java
public static void main(String[] args) {
	
	final CountDownLatch begin = new CountDownLatch(1); //为0时开始执行
	final ExecutorService exec = Executors.newFixedThreadPool(9);
	
	for (int i = 0; i < 9; i++) {
		final int NO = i + 1;
		Runnable runnable = new Runnable() {
			@Override
			public void run() {
				try {
					begin.await(); //等待直到 CountDownLatch减到1
			    	SortedMap<Object, Object> sortedMap = new TreeMap<Object, Object>();
			    	//----------签名参数------------
			    	sortedMap.put("appid", "5412916052207510000052159");
			    	sortedMap.put("mch_id", "dhfkjadh");
			    	sortedMap.put("nonce_str", "fasjkldfh");
			    	String sign = getSignature(sortedMap,"fhldhfkajhdfkjajsdh");
					System.out.println("sign"+String.valueOf(NO)+": "+sign);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		};
		exec.submit(runnable); 
	}
	System.out.println("开始执行");    
    begin.countDown(); // begin减一，开始并发执行  
    exec.shutdown();      
}
```

以上代码只模拟了9个并发线程，运行得到9次签名生成结果如下，参数不变的情况下计算结果各不相同，那显然就是方法存在线程安全问题了。

> 开始执行
sign5: 35F6B4BE2E33D3A655210599E5C57936
sign6: F4B678751A3C071B25AD2AB08CED2027
sign8: F4B678751A3C071B25AD2AB08CED2027
sign3: E8A83555C457502AAEDF379E38DC6233
sign9: 8568FA9C6E5C1CE1A1DD5C22D82D013B
sign2: 37EE9EA8D1CBA2B3F094FDAC1E565288
sign4: 35F6B4BE2E33D3A655210599E5C57936
sign1: E86DA0FF3270A381146135F24CEBFB3D
sign7: F486A648860192E312B7D2BA26411049

这时我注意到签名方法里使用了 **MD5Util.getMD5String()** 的方法，单独给这个MD5方法加上synchronized同步后运行得到如下结果：

> 开始执行
sign8: F4B678751A3C071B25AD2AB08CED2027
sign4: F4B678751A3C071B25AD2AB08CED2027
sign7: F4B678751A3C071B25AD2AB08CED2027
sign9: F4B678751A3C071B25AD2AB08CED2027
sign2: F4B678751A3C071B25AD2AB08CED2027
sign5: F4B678751A3C071B25AD2AB08CED2027
sign3: F4B678751A3C071B25AD2AB08CED2027
sign1: F4B678751A3C071B25AD2AB08CED2027
sign6: F4B678751A3C071B25AD2AB08CED2027

看来就是这个方法的问题了，跟进去研究一下，发现计算消息摘要的类 **MessageDigest** 为static，也就是每次方法调用都使用的是同一个对象，而这个类是非线程安全的（[参考](https://recalll.co/app/?q=Message%20Digest)）
>The MessageDigest classes are NOT thread safe. If they're going to be used by different threads, just create a new one, instead of trying to reuse them.

``` java
protected static MessageDigest messagedigest = null;

static {
    try {
        messagedigest = MessageDigest.getInstance("MD5");
    } catch (NoSuchAlgorithmException nsaex) {
        nsaex.printStackTrace();
    }
}

//... 省略 ...

public static String getMD5String(String s) {
    return getMD5String(s.getBytes());
}

public static String getMD5String(byte[] bytes) {
	messagedigest.update(bytes);
    return bufferToHex(messagedigest.digest());
}
```

对于这个问题有一些解决方法，最容易想到的就是我们常用的 **synchronized** 同步块，在资源竞争不是很激烈的情况下，偶尔会有同步的情形下，synchronized是很合适的，当同步非常激烈的时候，synchronized的性能则会急剧下降。而在这里我们采用上文建议的方法，在 **MD5Util** 中每个使用 **MessageDigest** 的方法里都创建一个新的对象即可，修改后的代码如下：

``` java
public static String getMD5String(String s) {
    return getMD5String(s.getBytes());
}

public static String getMD5String(byte[] bytes) {
	MessageDigest messagedigest = null;
	try {
		messagedigest = MessageDigest.getInstance("MD5");
		messagedigest.update(bytes);
    } catch (NoSuchAlgorithmException nsaex) {
    	nsaex.printStackTrace();
    }
    return bufferToHex(messagedigest.digest());
}
```

类似的问题也会出现在SimpleDateFormat（包括DateFormat）类的format()和parse()上，因为该类中的成员变量calendar会进行`calendar.setTime(date)`及`calendar.clear()`方法改变其状态，这时候多线程下便会出现线程不一致的情况。由于format()方法只用到的setTime方法，因此多线程下会出现时间不一致的情况，但是不会抛异常，这个问题比较隐蔽。而parse方法即用到了setTime也用到了clear方法，多线程时b线程设置了date这时候a线程又调用了clear方法清空了值，这是b线程再继续执行便会抛出异常。

对SimpleDateFormat和DateFormat的使用可以参考这篇文章[深入理解Java：SimpleDateFormat安全的时间格式化](//www.cnblogs.com/peida/archive/2013/05/31/3070790.html)


第一次碰到java并发的问题，解决的过程中查询了很多资料发现对java多线程了解的很少，后面找时间系统的研究一下关于java多线程的知识点。

## References
[1] [Message Digest](https://recalll.co/app/?q=Message%20Digest) 
[2] [java模拟并发访问](//zx-code.iteye.com/blog/2267185)
[3] [java.util.concurrent介绍](//www.cnblogs.com/sarafill/archive/2011/05/18/2049461.html)
[4] [Java Concurrency / Multithreading Tutorial](//tutorials.jenkov.com/java-concurrency/index.html)
