title: 深入理解Java序列化
date: 2016-02-03 16:09:42
categories: Coding
tags: [Java]
toc: true
---


平时的使用中只知道将类实现Serializable接口，传输中有个序列化和反序列化的过程，因为很少碰到关于序列化引起的问题，并没怎么关心过序列化的具体原理。最近正好有空对序列化做一些研究。<!--more-->

## 何为序列化
序列化分为两大部分：序列化和反序列化。序列化是这个过程的第一部分，将数据分解成字节流，以便存储在文件中或在网络上传输。反序列化就是打开字节流并重构对象。对象序列化不仅要将基本数据类型转换成字节表示，有时还要恢复数据。恢复数据要求有恢复数据的对象实例。如果某个类能够被序列化，其子类也可以被序列化。需要注意的是声明为static和transient类型的成员数据不能被序列化，因为static代表类的状态，transient代表对象的临时数据。

## 使用场景 
1，对象序列化可以实现分布式对象。主要应用例如：RMI要利用对象序列化运行远程主机上的服务，就像在本地机上运行对象时一样。 
2，java对象序列化不仅保留一个对象的数据，而且递归保存对象引用的每个对象的数据。可以将整个对象层次写入字节流中，可以保存在文件中或在网络连接上传递。利用对象序列化可以进行对象的"深复制"，即复制对象本身及引用的对象本身。序列化一个对象可能得到整个对象序列。

## 序列化 ID 的作用
Java的序列化机制是通过在运行时判断类的serialVersionUID来验证版本一致性的。在进行反序列化时，JVM会把传来的字节流中的serialVersionUID与本地相应实体（类）的serialVersionUID进行比较，如果相同就认为是一致的，可以进行反序列化，否则就会出现序列化版本不一致的异常。当实现java.io.Serializable接口的实体（类）没有显式地定义一个名为serialVersionUID，类型为long的变量时，Java序列化机制会根据编译的class自动生成一个serialVersionUID作序列化版本比较用，这种情况下，只有同一次编译生成的class才会生成相同的serialVersionUID。因此为了实现序列化接口的实体能够兼容先前版本，最好显式地定义一个名为serialVersionUID类型为long的变量，这样就不会存在版本不一致的问题。

## 敏感信息加密
客户端在和服务器通信时如果有一些敏感信息不便直接网络传输，可以在序列化时，对敏感属性字段进行加密，例如利用DES对称加密，只要客户端和服务器都拥有密钥，便可在反序列化时对加密信息进行读取，这样可以一定程度保证序列化对象的数据安全。下面通过简单的MD5加密来演示一下。
首先新建一个对象，由于在序列化过程中虚拟机会试图调用对象类里的 writeObject 和 readObject 方法进行用户自定义的序列化和反序列化，如果没有这两个方法，则默认调用 ObjectOutputStream 的 defaultWriteObject 方法以及 ObjectInputStream 的 defaultReadObject 方法。因此可以在对象里自定义writeObject 和 readObject 方法，这样就可以完全控制对象序列化的过程，从而可以在序列化的过程中对某些数据进行加解密操作。
```java
public class Student implements Serializable{
	 private static final long serialVersionUID = 1L;
	 private String name;
	 private String password;
	 private Character sex;
	 private Integer year;
	 
	 private void writeObject(ObjectOutputStream out) {
		try {
			//序列化时对password进行base64加密
			System.out.println("password: "+password);
			byte[] nameByte = password.getBytes("utf-8");
			if (nameByte!=null) {
				password = new BASE64Encoder().encode(nameByte);  
			}
			System.out.println("encodedPassword: "+password);
			out.defaultWriteObject();
		} catch (Exception e) {
			e.printStackTrace();
		}
	 }
	 
	 private void readObject(ObjectInputStream in) {
		try {
			in.defaultReadObject();
			//反序列化时对password进行解密
			BASE64Decoder decoder = new BASE64Decoder();
			byte[] b = null;
			if (password!=null) {
				b = decoder.decodeBuffer(password);
				password = new String(b,"utf-8");
				System.out.println("decodedPassword: "+password);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	 
	@Override
	public String toString() {
		return "Student [name=" + name + ", password=" + password + ", sex="
				+ sex + ", year=" + year + "]";
	}

	public Student(String name, String password, Character sex, Integer year) {
		super();
		this.name = name;
		this.password = password;
		this.sex = sex;
		this.year = year;
	}

	public String getName() {
		return name;
	}
     ...	
}
```
然后创建一个测试主函数：
```java
public class TestSerializable {
	public static void main(String[] args) {
		try {
			//序列化
			File file = new File("E:/STUDY/src/student.out");
			ObjectOutputStream oout = new ObjectOutputStream(new FileOutputStream(file));
			Student student = new Student("jverson", "secret", 'M', 2016);
			System.out.println("origin Object:"+student);
			oout.writeObject(student);
			oout.close();
			//反序列化
			ObjectInputStream oin = new ObjectInputStream(new FileInputStream(file));
			Student deseriStudent = (Student)oin.readObject();
			oin.close();
			System.out.println("recieve Object:"+deseriStudent);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
```
运行得到以下结果，可以看到password在网络通信中被加密为c2VjcmV0，接收端接收到后对其解密得到的值secret与原值相同。
> origin Object:Student [name=jverson, password=secret, sex=M, year=2016]
password: secret
encodedPassword: c2VjcmV0
decodedPassword: secret
recieve Object:Student [name=jverson, password=secret, sex=M, year=2016]

另外可以看到序列化后的对象是一个字节数组形式：
>aced 0005 7372 0014 636f 6d2e 6a64 2e73
7475 6479 2e53 7475 6465 6e74 0000 0000
0000 0001 0300 044c 0004 6e61 6d65 7400
124c 6a61 7661 2f6c 616e 672f 5374 7269
6e67 3b4c 0008 7061 7373 776f 7264 7100
7e00 014c 0003 7365 7874 0015 4c6a 6176
612f 6c61 6e67 2f43 6861 7261 6374 6572
3b4c 0004 7965 6172 7400 134c 6a61 7661
2f6c 616e 672f 496e 7465 6765 723b 7870
7400 076a 7665 7273 6f6e 7400 0863 3256
6a63 6d56 3073 7200 136a 6176 612e 6c61
6e67 2e43 6861 7261 6374 6572 348b 47d9
6b1a 2678 0200 0143 0005 7661 6c75 6578
7000 4d73 7200 116a 6176 612e 6c61 6e67
2e49 6e74 6567 6572 12e2 a0a4 f781 8738
0200 0149 0005 7661 6c75 6578 7200 106a
6176 612e 6c61 6e67 2e4e 756d 6265 7286
ac95 1d0b 94e0 8b02 0000 7870 0000 07e0
78


## JSON实现序列化
其实将对象转换为JSON格式字符串进行进程间远程通信同样也是一种序列化方式，其明文结构一目了然，可以跨语言，属性的增加减少对解析端影响较小，但是字节数过多，依赖于不同的第三方类库。而Object Serialize是java原生支持，不需要提供第三方的类库，使用比较简单。但也存在不能跨语言，有时存在兼容性等缺点。下面对java原生序列化和Google提供的json库gson-2.1.jar对同一对象的序列化及反序列化效率做一个对比。
java原生序列化/反序列化
```java
//---测试java内置序列化和gson序列化性能---
Student student = new Student("jverson", "secret", 'M', 2016);
int MAX_LOOP = 1000000;
long start = System.currentTimeMillis();
for(int i=0; i<MAX_LOOP; i++){
	//序列化
	ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
	ObjectOutputStream oout = new ObjectOutputStream(byteStream);
	oout.writeObject(student);
	byte[] binary = byteStream.toByteArray();
	//反序列化
	ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(binary);
	ObjectInputStream oin = new ObjectInputStream(byteArrayInputStream);
	Student deseriStudent = (Student)oin.readObject();
}
long end = System.currentTimeMillis();
System.out.println("Object serialization time: "+(end-start));
```
Gson序列化/反序列化
```java
//---测试java内置序列化和gson序列化性能---
Student student = new Student("jverson", "secret", 'M', 2016);
int MAX_LOOP = 1000000;
long start = System.currentTimeMillis();
for(int i=0; i<MAX_LOOP; i++){
	//序列化
	Gson gson = new Gson();
	String stuJson = gson.toJson(student);
	//反序列化
	Student stuObject = gson.fromJson(stuJson, Student.class);
}
long end = System.currentTimeMillis();
System.out.println("Gosn serialization time: "+(end-start));
```
注意Gson使用的是[gson-2.1.jar](//grepcode.com/snapshot/repo1.maven.org/maven2/com.google.code.gson/gson/2.1)，得到测试结果如下：
>Object serialization time: 20163
Gosn serialization time: 23354

可见在针对上述Student这个对象的序列化和反序列化，java原生的序列化效率较Gson略为占优。我们发现Student对象属性都是一些基本数据类型，如果我们再加上一些对象的引用测试结果会怎么样呢？首先为对象添加一个Map类型的属性如下：
```java
Map<String, Object> parent = new HashMap<String, Object>();
parent.put("Mom", "mother");
parent.put("Dad", "father");
Student student = new Student("jverson", "secret", 'M', 2016, parent);
```

测试条件不变，得到测试结果为：
>Object serialization time: 28674
Gosn serialization time: 40533

不难发现两者的效率差距进一步扩大，但是不同Json序列化实现方式效率也不同，另外也和对象的结构和复杂程度有关，由于没有进一步测试，因此这里并没有孰优孰劣的定论。在效率要求不是很严格的场景下，我们可以根据需要灵活地使用不同的序列化方式，或者也可以使用本文类似的方法针对具体的场景进行效率测试从而选用更为高效的序列化方式。

## reference
- [Java 中的序列化Serialable高级详解](//blog.csdn.net/jiangwei0910410003/article/details/18989711)
- [Java 序列化 (Serializable) 的作用](//www.oschina.net/question/4873_23270)
- [Java 内置序列化与Gson性能比较](//www.tuicool.com/articles/2Q3M73)