title: 网络分层结构之运输层（四）
categories: Network
tags: [network]
toc: true
date: 2016-06-15 19:57:05
---

我们平常所说的“两个主机之间通信”其实指的是两个主机之间的进程进行交换数据，即通信的真正终端不是主机而是主机中的进程。网络层的IP协议可以将数据包送到目的主机，但并未交付到具体的进程，而运输层则提供了应用进程之间的逻辑通信，同时还负责对收到的报文进行差错检查。
<!-- more -->

## 运输层的端口

协议端口号（简称端口）是运输层的概念，当网络层将数据包送达主机时必须能够知道其希望与主机的哪一个进程进行交互，而端口号即标识了具体的某一个进程，这个看上去和操作系统进程标识符的概念很类似（由于不同操作系统的标识符格式不同，在网络通信中使用端口号的概念）。但是这样的话我们在进行通信时还必须知道目的进程的端口号，而进程的创建和撤销都是动态的，这样对端口还需要一个类似dns的东西去获取目的port，显然是不可行的。因此运输层的端口号分为两类：

**1， 服务端使用的端口号（0~49151）**
服务端的端口号也分为两类：系统端口号和登记端口号。系统端口号范围是0~1023，是被IANA指派到一些特定应用的端口号，例如FTP是21，HTTP是80等。而登记端口号范围1024~49151，必须按照IANA规定程序登记方可使用。

**2， 客户端使用的端口号（49152~65535）**
这些端口号是客户端进程运行时动态选择临时使用，和服务端通信时，服务端将响应报文发回至客户端相应的临时端口号，通信结束后这个端口号可能就已经被别的客户端进程使用了。


## UDP协议

### UDP介绍

UDP只在IP层的数据报上添加了很少的功能，包括端口信息和差错检测，UDP首部只有8个字节（TCP头部有20字节），下面是一个DNS请求的UDP头部。
> User Datagram Protocol, Src Port: 52719 (52719), Dst Port: 53 (53)
    Source Port: 52719  //源端口，需要对方回信时选用，不需要时可置零
    Destination Port: 53  //目的端口，DNS服务的熟知端口
    Length: 43  //UDP数据报长度，最小值为UDP头部长度8
    Checksum: 0xac97 [validation disabled]  //校验和，校验报文是否有错，有错便丢弃

UDP协议具有以下特点
- 无连接
- 不保证可靠交付
- 面向报文，即不管应用层交下来的报文长度多少，UDP只负责添加UDP报头就直接交给网络层了，不会进行报文的拆分或者合并
- 没有拥塞控制，网络拥塞不会是主机发送速率降低
- 支持一对一，一对多，多对一和多对多
- 首部8字节，开销小

### Java程序实现

Server端实现
``` java
public class UDPServer {

	private static final int SERVER_PORT = 5000;
	private DatagramSocket datagramSocket;
	private DatagramPacket datagramPacket;
	private byte recByte[];
	private String recString;
	
	public UDPServer() {
		init();
	}
	
	public void init() {
		try {
			datagramSocket = new DatagramSocket(SERVER_PORT);  //创建UDP套接字
			recByte = new byte[1024]; 
			datagramPacket = new DatagramPacket(recByte, recByte.length); //用来接收UDP数据报的字节数组buf  
			recString = "";
			int i = 0;
			while (i==0) {
				System.out.println("listening"); 
				datagramSocket.receive(datagramPacket);  //阻塞监听接收数据
				i = datagramPacket.getLength();
				if (i>0) {
					recString = new String(recByte, 0, datagramPacket.getLength());
					System.out.println("receive: "+recString);  //打印接收到的字符
					i = 0;  //继续监听接收
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
		new UDPServer();
	}
	
}
```


Client端实现
``` java
public class UDPClient {

	private static final int CLIENT_PORT = 5001;
	private DatagramSocket datagramSocket;
	private DatagramPacket datagramPacket;
	private byte sendByte[];
	private String sendString;
	
	public UDPClient() {
		Init();
	}
	
	public void Init() {
		try {
			datagramSocket = new DatagramSocket(CLIENT_PORT); //创建UDP套接字
			sendByte = new byte[1024];
			sendString = "hello server, I am client!";
			sendByte = sendString.getBytes();
			datagramPacket = new DatagramPacket(sendByte, sendByte.length, InetAddress.getLocalHost(), 5000); //创建发送UDP报文
			datagramSocket.send(datagramPacket); //将length长的buf数据发送到指定的地址的端口号处
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public static void main(String[] args) {
		new UDPClient();
	}
	
}
```

## TCP协议

### TCP特点
- 面向连接，类似于打电话，先接通再说话，通话完需要挂断，释放连接
- 只能点对点
- 提供可靠交付，接收数据无差错、不丢失、不重复并按序到达
- 全双工
- 面向字节流

**其中关于面向字节流的理解：**
应用程序和TCP的交互以数据块（大小不等）为单位，并且发送进程和接收进程的数据块大小也没有对应关系。TCP只把应用程序交下来的数据看做一连串无结构的字节流，TCP并不关心应用程序每次把多长的报文发送至TCP缓存，而是根据对方给出的窗口值和当前网络拥塞的程度决定一个传输的报文段包含多少字节（注意和UDP区别，应用进程给出的数据块多长UDP报文就多长），如果应用进程TCP缓存的数据块太长，TCP会分段传送，如果太短，TCP则等待积累足够多的字节再传。

### TCP可靠传输原理

**1，停止等待协议**
TCP每发送完一个分组便停止发送，直到对方确认正确接收。如果长时间没有收到确认则重新发送分组（超时重传）。

**2，连续ARQ协议&滑动窗口协议**
停止等待协议一个显著的确定就是信道利用率低，可以连续的发用一个特定长度的分组，依次等待确认，每收到一个确认，发送窗口向前滑动一个分组的位置，这样信道利用率就提高了。而接收方也不是每收到一个分组就发一个确认，而是对按序到达的最后一个分组进行确认，表明到这个分组位置的所有分组都接收成功了。

**3，流量控制**
即让发送方的发送速率不能太快，要让接收方来的及接收。而这也是通过滑动窗口机制来实现的，只需规定发送方的发送窗口不能超过接收方给出的接收窗口的数值。

### TCP报文格式

下面是Wireshark截取的一段TCP头部，其中前20字节是固定的，后面还有一个4n字节的选项字段（Options），因此TCP首部的最小长度是20字节。
> Frame 52: 66 bytes on wire (528 bits), 66 bytes captured (528 bits) on interface 0
Ethernet II, Src: Hangzhou_4a:7d:df (70:f9:6d:4a:7d:df), Dst: Dell_6b:3d:e5 (b0:83:fe:6b:3d:e5)
Internet Protocol Version 4, Src: 172.20.39.7, Dst: 10.13.153.44
Transmission Control Protocol, Src Port: 80 (80), Dst Port: 19383 (19383), Seq: 0, Ack: 1, Len: 0
    Source Port: 80  //2字节
    Destination Port: 19383  //2字节
    Sequence number: 0    (relative sequence number)  //序号 4字节 TCP传送的字节流中的每一个字节都按顺序编号
    Acknowledgment number: 1    (relative ack number)  //确认号 4字节 期望收到对方下一个报文段第一个字节的序号
    Header Length: 32 bytes //
    Flags: 0x012 (SYN, ACK)
    Window size value: 14600  //窗口 2字节 指发送报文一方的接收窗口
    Checksum: 0xc07d [validation disabled]  //校验和 2字节 检验数据是否完整无误
    Urgent pointer: 0  //紧急指针 2字节 为1时有效，指明报文段中紧急字段的字节数
    Options: (12 bytes), Maximum segment size, No-Operation (NOP), No-Operation (NOP), SACK permitted, No-Operation (NOP), Window scale  //选项，最长40字节，没有时TCP头部即为20字节


### Java程序实现

Server端实现
``` java
	private static final int SERVER_PORT = 5000;
	
	public static void main(String[] args) {
		
		try {
			ServerSocket serverSocket = new ServerSocket(SERVER_PORT);
			while(true){
				Socket socket = serverSocket.accept(); //使用accept()阻塞等待客户请求，有客户请求到来则产生一个Socket对象，并继续执行
				SocketAddress clientAddress = socket.getRemoteSocketAddress();  
		        System.out.println("Handling client at " + clientAddress); //打印客户端ip
		        
				BufferedReader is = new BufferedReader(new InputStreamReader(socket.getInputStream()));
				System.out.println("recieve: " + is.readLine()); //打印客户端传输的内容
				
				OutputStream out = socket.getOutputStream(); 
				out.write("hello, I am server.".getBytes()); //向客户端返回内容
				
				socket.close(); //通信完成，关闭客户端socket连接
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
```

Client端实现
``` java
	private static final int SERVER_PORT = 5000;
	
	public static void main(String[] args) {
		try {
			Socket socket = new Socket("127.0.0.1", SERVER_PORT);
			System.out.println("Connected to server ..... Sending echo String");  
			
			InputStream in = socket.getInputStream();  
	        OutputStream out = socket.getOutputStream();  
	        byte[] data = "hello, I am Jverson.".getBytes();
	        out.write(data);
	        
	        int totalBytesLength  = 0;
	        int bytesRcvd; 
	        while (totalBytesLength < data.length) {
	        	if ((bytesRcvd = in.read(data, totalBytesLength, data.length  
	                    - totalBytesLength)) == -1)  
	            {  
	                throw new SocketException("Connection closed prematurely");  
	            }  
	              
	            totalBytesLength += bytesRcvd;
			}
	        
	        System.out.println("Received:"+new String(data));
			
			socket.close();  
		} catch (UnknownHostException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}  
	}
```