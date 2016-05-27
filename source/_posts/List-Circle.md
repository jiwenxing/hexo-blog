title: 单链表中有环的相关问题
date: 2014-05-23 17:21:54
categories: Coding
tags: [Java]
---

问题描述：判断单链表中受否存在环，得到环的长度、连接点位置等。
<!-- more -->
给定一个单链表，只给出头结点head，求问：
 1. 判断单链表中受否存在环
 2. 得到环的长度
 3. 找到环的连接点位置
 4. 求带环链表的总长度

## 分析：
<br>
### 问题1：判断单链表中受否存在环
针对该问题有个经典解法即追赶法，设定两个指针slow、fast，从头指针开始，每次分别前进1步、2步。如存在环，则两者相遇；如不存在环，fast遇到NULL退出。

为什么说有环两个指针就一定会相遇呢？因为只要有环，指针遍历的时候就一定会进入到环内不停的循环（注意这里限定是单链表），而两个指针速度每次相差一个结点，所以fast总会有追上slow的那一刻。
<br>
### 问题2：得到环的长度
记住问题1中fast与slow的相遇点P，然后slow、fast从该点开始按照之前设定的速度在环内转圈，再次碰撞所走过的结点数就是环的长度s。这个很容易理解。
<br>
### 问题3：找到环的连接点位置
这个貌似推导有点复杂，先呈上结论：从链表头、与相遇点P分别设一个指针，每次都各走一步，两个指针必定相遇，且相遇第一点即为环入口点。证明如下：
![](http://7u2eve.com1.z0.glb.clouddn.com/blogpic/list_circle.jpg)


设链表总长度为L，头结点到环入口的距离为a，环入口到快慢指针相遇的结点距离为x，环的长度为r，慢指针总共走了s步，则快指针走了2s步。另外，快指针要追上慢指针的话快指针至少要在环里面转了一圈多(假设转了n圈加x的距离)，得到：

> s  =  a + x
> 2s = n*r + x +a   
> 把s消掉得到：
> > s =  a + x = n*r 
> >a = n*r - x

所以指针P1从头节点走了a路程到达环入口处时，指针P2从相遇结点走了n*r - x的路程正好也到达环入口处，得证！
<br>
### 问题4：求带环链表的总长度
问题3中已经求出连接点距离头指针的长度，加上问题2中求出的环的长度，二者之和就是带环单链表的长度

## 具体程序

 1. 判断单链表中受否存在环

```java
package dataStructure;

public class List_if_circle {

	public static void main(String[] args){
		
		Node a1 = new Node(1);
		Node a2 = new Node(2);
		Node a3 = new Node(3);
		Node a4 = new Node(4);  
		Node a5 = null;
		a1.next = a2;
		a2.next = a3;
		a3.next = a4;
		a4.next = a5;    //创建一个单链表a1->a2->a3->a4->null
		//Node.disp(a1);   //如果有环的话用disp输出会无限循环下去
		boolean ifCircle = List_if_circle.judge_circle(a1);
		System.out.println(ifCircle);
	}
	
	public static boolean judge_circle(Node head){
		
		if(head==null||head.next==null) 
			return false;
		Node fast = head;
		Node slow = head;
		while(fast!=null&&fast.next!=null){
			fast = fast.next.next;
			slow = slow.next;
			if(fast==slow) return true;
		}
	   return false;	
	}	
}
```

## 附注
结点定义及相关函数

```java
package dataStructure;

public class Node{

	int data;
	Node next;
	Node(int data, Node next){
		this.data = data;
		this.next = next;
	}
	Node(int data){
		this.data = data;
		this.next = null;
	}
	
	public static void disp(Node head){    //注意单链表的输出写法
		for(;head!=null;head=head.next){
			System.out.print(head.data+"->");
		}
		System.out.print("null");
		System.out.println();
	}
}
```
<br>


----------
![](http://7u2eve.com1.z0.glb.clouddn.com/blogpic/E___0109GD00SIGT.gif)