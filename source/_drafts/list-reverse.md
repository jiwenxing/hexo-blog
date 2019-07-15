title: 实现单链表的逆置
date: 2014-04-22 23:23:58
categories: Coding
tags: [Java]
---

问题描述：如何实现单链表的逆置，给出完整程序，并测试结果
<!-- more -->
## 实现方法
```java
package dataStructure;
/**
 * 链表的几个操作
 * @author Jiwenxing
 */
public class Test_list {

	public static void main(String[] args){
		Node a5 = null;
		Node a4 = new Node(4, a5);
		Node a3 = new Node(3, a4);
		Node a2 = new Node(2, a3);
		Node a1 = new Node(1, a2);  //创建一个单链表a1->a2->a3->a4->null
		Test_list.disp(a1);   //输出单链表
		Node head = Test_list.reverse(a1);  //逆置
		Test_list.disp(head);	
	}
	
	static Node reverse(Node head){   //链表逆置函数
		
		if(head==null||head.next==null){   //注意先判断链表长度是否小于2
			return head;
		}
		
		Node pre, cur, nex;  //定义三个辅助结点
		pre = head;   //先把链表前两个元素赋给前两个辅助结点
		cur = head.next;
		head.next = null;  //别忘了把头结点的下个结点置空
		while(cur!=null){  //每次while逆置两个结点，从前两个开始
			nex = cur.next; //有没有发现这四句很有特点，首尾相接，实现了前两个结点的逆置
			cur.next = pre; //这里实现逆置
			pre = cur;  //这里将两个辅助结点向后平移一位以便进行下两个结点的逆转
			cur = nex;
		}
		return pre;   //此时cur为空，应返回pre为头节点
	}
	
	static void disp(Node head){    //注意单链表的输出写法
		for(;head!=null;head=head.next){
			System.out.print(head.data+"->");
		}
		System.out.print("null");
		System.out.println();
	}		
}

class Node{   //结点定义
	
	int data;
	Node next;
	Node(int data, Node next){
		this.data = data;
		this.next = next;
	}	
}

```

测试输出如下：
1->2->3->4->null
4->3->2->1->null

----------
![](//
jverson.oss-cn-beijing.aliyuncs.com/blogpic/E___0109GD00SIGT.gif)