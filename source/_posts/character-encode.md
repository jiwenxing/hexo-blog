title: 关于字符编码和java中的乱码问题总结
categories: Coding
tags: [Java]
toc: false
date: 2016-02-19 15:53:20
---

`web` 开发不可避免会碰到字符编码的问题，因此很有必要对其中涉及的知识点做一次系统的梳理。首先需要了解当前主要的字符集和字符编码，然后对 `Java` 中常见的编码问题进行总结。<!--more-->

## 字符集与字符编码

注意字符集和编码是两个不同的概念。字符集只是字符的集合，计算机要准确的处理各种字符集文字，需要对字符集进行字符编码，以便能够识别和存储各种文字，所谓的字符编码就是以二进制的数字来对应字符集的字符。需要注意的是 **`Unicode` 只是一个符号集，它只规定了符号的二进制代码，却没有规定这个二进制代码应该如何存储**。如 `Unicode` 字符集可依不同需要以`UTF-8`、`UTF-16`、`UTF-32`等方式存储。

常见的字符集主要有：ASCII字符集、ISO 8859字符集、GB2312字符集、BIG5字符集、GB18030字符集、Unicode 字符集等。值得注意的是**在Java中，字符都是以Unicode进行存储的**。

常见的编码格式有：ASCII、ISO-8859-1、GB2312、GBK、UTF-8、UTF-16等。

> 各个国家和地区在制定编码标准的时候，“字符的集合”和“编码”一般都是同时制定的。因此，平常我们所说的“字符集”，比如：ASCII, GB2312, GBK, JIS 等，除了有“字符的集合”这层含义外，同时也包含了“编码”的含义。

### ASCII编码

ASCII码（American Standard Code for Information Interchange）是上世纪60年代，美国制定了一套字符编码，ASCII码**定长一字节来表示一个字符**，使用指定的7 位或8 位二进制数组合来表示128 或256 种可能的字符，在标准ASCII中，总共有 128 个，用一个字节的低 7 位表示，其最高位(b7)用作奇偶校验位，0~31 是控制字符如换行回车删除等；32~126 是打印字符，可以通过键盘输入并且能够显示出来。而后128个称为扩展ASCII码，扩展ASCII 码允许将每个字符的第8 位用于确定附加的128 个特殊符号字符、外来语字母和图形符号。

### ISO-8859-1（单字节编码，但是涵盖了大多西欧语言字符）

128 个字符显然是不够用的，于是 ISO 组织在 ASCII 码基础上又制定了一些列标准用来扩展 ASCII 编码。其中 ISO-8859-1 涵盖了大多数西欧语言字符，所以应用的最广泛。ISO-8859-1 仍然是单字节编码，它总共能表示 256 个字符。

### GB2312（是GBK的子集，相互兼容）

全称是《信息交换用汉字编码字符集基本集》，它是**变长多字节方案，为了兼容一字节的ASCII，汉字则用两字节表示**，总的编码范围是 A1-F7，其中从 A1-A9 是符号区，总共包含 682 个符号，从 B0-F7 是汉字区，包含 6763 个汉字。

### GBK（中文编码一般都用这个）

`汉字内码扩展规范`，主要是为了扩展 GB2312，加入更多的汉字，它的编码范围是 8140~FEFE（去掉 XX7F）总共有 23940 个码位，它能表示 21003 个汉字，它的编码是和 GB2312 兼容的，也就是说用 GB2312 编码的汉字可以用 GBK 来解码，并且不会有乱码。

同理`GB2312 `，GBK 中字符也是一个或者两个字节，单字节00–7F这个区间和ASCII是一样的；双字节字符的第一个字节在81-FE之间，通过这个可以判断是单字节还是双字节。

### UTF-16（JVM内存默认的字符存储格式）

UTF-16 具体定义了 Unicode 字符在计算机中存取方法。UTF-16 用**两个字节**来表示 Unicode 转化格式，这个是**定长的表示方法**，不论什么字符都可以用两个字节表示，两个字节是 16 个 bit，所以叫 UTF-16。UTF-16 表示字符非常方便，每两个字节表示一个字符，这个在字符串操作时就大大简化了操作，这也是 **Java 以 UTF-16 作为内存的字符存储格式**的一个很重要的原因。

### UTF-8

UTF-16 统一采用两个字节表示一个字符，虽然在表示上非常简单方便，但是也有其缺点，有很大一部分字符用一个字节就可以表示的现在要两个字节表示，存储空间放大了一倍，在现在的网络带宽还非常有限的今天，这样会增大网络传输的流量，而且也没必要。而 UTF-8 采用了一种**变长技术**，每个编码区域有不同的字码长度。不同类型的字符可以是由 **1~6 个字节组成**。

1. 如果一个字节，最高位（第 8 位）为 0，表示这是一个 ASCII 字符（00 - 7F）。可见，所有 ASCII 编码已经是 UTF-8 了。
1. 如果一个字节，以 11 开头，连续的 1 的个数暗示这个字符的字节数，例如：110xxxxx 代表它是双字节 UTF-8 字符的首字节。
1. 如果一个字节，以 10 开始，表示它不是首字节，需要向前查找才能得到当前字符的首字节

### UTF-16 vs UTF-8

Java 中的 char 类型之所以是两个字节就是因为 Java 使用了UTF-16作为内存中字符存储的格式。UTF-16 的编码效率高，字符与字节之间的转换也相对简单，适合在本地磁盘和内存之间使用，可以进行字符和字节之间快速切换；但是如果在网络上传输数据的话会遇到大尾数和小尾数字节顺序转换的问题，因此 UTF-8 更适合在网络上传输数据，而 UTF-16 更适合在内存中使用。因此开发 Java Web 应用时，强烈建议使用 UTF-8 这种编码方式。

UTF-16 是用定长 16 位（2 字节）来表示的 UCS-2 或 Unicode 转换格式，通过代理对来访问 BMP 之外的字符编码。

## Java 中涉及编码问题的场景

我们知道涉及到编码的地方一般都在字符到字节或者字节到字符的转换上，而需要这种转换的场景主要有两个，其一是 I/O 的时候，包括磁盘 I/O 和网络 I/O，其二是在内存中进行字符到字节的数据类型的转换。

> 谨记：Java 以 UTF-16（Unicode的一种编码实现，固定两字节） 作为内存的字符存储格式

### I/O 操作中存在的编码

#### 关于字节流和字符流介绍

Java 中的流是对字节序列的抽象，可以简单的认为流就是处理二进制数据。Java中的字节流处理的最基本单位为**单个字节**，它**通常用来处理二进制数据**。Java中最基本的两个字节流类是InputStream和OutputStream，它们分别代表了一组基本的输入字节流和输出字节流。

Java 中的字符流处理的最基本的单元是**Unicode码元**（UTF-16格式，大小2字节），它**通常用来处理文本数据**（图片、音乐、视频等本身就是二进制格式不需要进行字符编码）。所谓Unicode码元，也就是一个Unicode代码单元，范围是0×0000~0xFFFF。在以上范围内的每个数字都与一个字符相对应，Java中的**String类型默认就把字符以Unicode规则编码而后存储在内存中。然而与存储在内存中不同，存储在磁盘上的数据通常有着各种各样的编码方式**。使用不同的编码方式，相同的字符会有不同的二进制表示。

- 输出字符流：把要写入文件的字符序列（实际上是Unicode码元序列）转为指定编码方式下的字节序列，然后再写入到文件中；
- 输入字符流：把要读取的字节序列按指定编码方式解码为相应字符序列（实际上是Unicode码元序列）从而可以存在内存中。

#### Java 中的应用

`Reader` 类是 Java 的 I/O 中**读字符**的父类，而 `InputStream` 类是**读字节**的父类，`InputStreamReader` 类就是**关联字节到字符**的桥梁，它负责在 I/O 过程中处理读取字节到字符的转换，而具体字节到字符的解码实现它由 `StreamDecoder` 去实现，在 `StreamDecoder` 解码过程中必须由用户指定 `Charset` 编码格式。

```java
String file = "c:/stream.txt";
String charset = "UTF-8";
// 写字符换转成字节流
FileOutputStream outputStream = new FileOutputStream(file);
OutputStreamWriter writer = new OutputStreamWriter(outputStream, charset);
try {
	writer.write("这是要保存的中文字符"); //自动将字符按照指定的编码格式编码为字节流存入文件
} finally {
	writer.close();
}
// 读取字节转换成字符
FileInputStream inputStream = new FileInputStream(file);
InputStreamReader reader = new InputStreamReader(inputStream, charset);
StringBuffer buffer = new StringBuffer();
char[] buf = new char[64];
int count = 0;
try {
    // reader自动以指定的编码格式读取文件中的字节流置于内存中
	while ((count = reader.read(buf)) != -1) {
		buffer.append(buffer, 0, count);
	}
} finally {
	reader.close();
}
```


在我们的 Java 应用程序中**涉及到 I/O 操作时一定要注意指定统一的编解码 Charset 字符集**，一般不会出现乱码问题，如果不注意指定字符编码，则会取操作系统默认编码，你的应用程序的编码格式就和运行环境绑定起来了，在跨环境下很可能出现乱码问题。



### 内存中操作中的编码

在 Java 开发中除了 I/O 涉及到编码外，最常用的应该就是在内存中进行字符到字节的数据类型的转换，Java 中用 String 表示字符串，所以 String 类就提供转换到字节的方法，也支持将字节转换为字符串的构造函数。String 类的 getBytes() 方法进行编码，将字符串，转为对映的二进制，并且这个方法可以指定编码表。如果没有指定码表，该方法会使用操作系统默认码表。

在Java程序中可以使用System.getProperty("file.encoding")方式得到当前的默认编码。

```java
public static void main(String[] args) throws UnsupportedEncodingException {
	String value = System.getProperty("file.encoding");
	System.out.println("系统默认的编码为: " + value); //UTF-8
	
	String str = "I am 墨言";
	
	System.out.println(Arrays.toString(str.getBytes())); //[73, 32, 97, 109, 32, -27, -94, -88, -24, -88, -128]
	System.out.println(Arrays.toString(str.getBytes("UTF-8"))); //[73, 32, 97, 109, 32, -27, -94, -88, -24, -88, -128]
	System.out.println(Arrays.toString(str.getBytes("UTF-16"))); //[-2, -1, 0, 73, 0, 32, 0, 97, 0, 109, 0, 32, 88, -88, -118, 0]
	System.out.println(Arrays.toString(str.getBytes("GBK"))); //[73, 32, 97, 109, 32, -60, -85, -47, -44]
	System.out.println(Arrays.toString(str.getBytes("ISO-8859-1"))); //[73, 32, 97, 109, 32, 63, 63]
	
	// 编码 and 解码操作
	// 编码gbk,解码utf-8乱码。
	String str1 = new String(str.getBytes("gbk"), "utf-8");
	System.out.println(str1); //I am ī��
	
	// 编码utf-8 解码gbk，乱码
	String str2 = new String(str.getBytes("utf-8"), "gbk");
	System.out.println(str2); //I am 澧ㄨ█
	
	// gbk兼容gb2312所以，没有问题。
	String str3 = new String(str.getBytes("gb2312"), "gbk");
	System.out.println(str3); //I am 墨言	
	
	// 编码utf-16 解码utf-8，乱码
    String str4 = new String(str.getBytes("utf-16"), "utf-8");
    System.out.println(str4); //�� I   a m  X�� 
}

```

从上面的示例可以看出：

1. 我本地环境为`utf-8`编码，则默认情况下以此为编码格式
2. 所有编码格式对`ASCII`范围内的字符编码都一致。不过`utf-16`有些特殊，即使`ASCII`范围内的字符也是固定两位编码。
3. 我们发现`utf-16`编码的前两位多了个`-2 -1`，换成十六进制就是`FE FF`，这个其实是`utf-16`的`BOM`标识，代表大端还是小端，缺省BOM就是“FEFF”，可见JVM中缺省是大端法，这与Windows平台下缺省为小端法恰好相反。关于BOM的详细知识参考[3].
4. 由于大部分编码都兼容`ASCII`，因此即使编解码的规则不一致一般英文符号也不会出现乱码（utf-16会乱码），但是中文如果不是类似gbk和gb2312这种兼容格式，如果编码规则不一致则一定会出现乱码。
5. gbk和gb2312都是变长编码，`ASCII`范围内编码长度都保持一致为一个字节。   

### Java Web 涉及到的编码

有 I/O 的地方就会涉及到编码，前面已经提到了 I/O 操作会引起编码，而大部分 I/O 引起的乱码都是网络 I/O，因为现在几乎所有的应用程序都涉及到网络操作，而数据经过网络传输都是以字节为单位的，所以所有的数据都必须能够被序列化为字节。在 Java 中数据被序列化必须继承 Serializable 接口。

用户从浏览器端发起一个 HTTP 请求，需要存在编码的地方是 URL、Cookie、Parameter。服务器端接受到 HTTP 请求后要解析 HTTP 协议，其中 URI、Cookie 和 POST 表单参数需要解码，服务器端可能还需要读取数据库中的数据，本地或网络中其它地方的文本文件，这些数据都可能存在编码问题，当 Servlet 处理完所有请求的数据后，需要将这些数据再编码通过 Socket 发送到用户请求的浏览器里，再经过浏览器解码成为文本。

web 的场景下如果没有指定编码格式，则一般默认的 charset 都是`ISO-8859-1`，因此尽量使用 ASCII 字符，一定要使用中文的场景时记住显式的设置 charset。


## 总结

其实乱码问题的本质就是Encoding和Decoding用的不是一个编码，要解决乱码问题，首先要搞清楚哪些地方会引起字符到字节的编码以及字节到字符的解码，最常见的地方就是读取会存储数据到磁盘，或者数据要经过网络传输。然后针对这些地方搞清楚操作这些数据的框架的或系统是如何控制编码的，正确设置编码格式，避免使用软件默认的或者是操作系统平台默认的编码格式。


## 参考

[1] [深入分析 Java 中的中文编码问题](https://www.ibm.com/developerworks/cn/java/j-lo-chinesecoding/index.html)

[2] [理解Java中字符流与字节流的区别
](//www.importnew.com/23963.html)

[3] [字符集与编码（七）——BOM](https://my.oschina.net/goldenshaw/blog/323248)

[4] [字符编码笔记：ASCII，Unicode 和 UTF-8](//www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html)
