title: 判断一个正整数是否为2的阶次方
date: 2014-05-22 15:31:43
categories: Coding
tags: [Algorithm,Java]
---

问题描述：希望从键盘得到一个数，判断其是否为2的阶次方数，例如4是2的2次方，而9则不是2的整数次方。
<!-- more -->
## 分析
这个问题乍一看不难，确实也不难，很容易就能想到常规的解决方法，但是有没有更好的方法呢，比如O(1)的复杂度即可判读

## 方法一
最常规的方法即将该整数转换为浮点型，然后使用该数对2重复做除法运算直到结果小于2，判断除法所得商如果为1.0则为真，其他则为假。时间复杂度为O(log2(n))。

```java
	public static void powerOf2(int n){
		float a = (float) n;
		if(a>0){
			while(a>=2.0){
				a = a/2;
			}
			if(a==1.0) System.out.println(n+" is power of 2!");
			else System.out.println(n+" is not power of 2!");
		}else
			System.out.println("input illegal");	
	}
```

## 方法二
有木有更巧妙地方法呢？如果你对数字敏感就会意识到计算机都是以二进制表示数字的，而不难发现符合本题条件(2的整数次方)的整数都具有这一特征：将该数转化为二进制，其第一位为1，其余位都为0，进一步就会找到判决条件a&(a-1)==0。

```java
	public static void main(String[] args){
		System.out.println("input a positive number:");
		Scanner  sc = new Scanner(System.in);
		int a = sc.nextInt();
		sc.close();
		//Demo3.powerOf2(a);
		if(a>0){
			if((a&(a-1))==0){
				System.out.println(a+" is power of 2!");
			}else
				System.out.println(a+" is not power of 2!");
		}else
			 System.out.println("input illegal");
	}
```
## 扩展-小白鼠喝药水问题

### 问题描述
阿里巴巴的一道笔试题：有1000个一模一样的瓶子，其中有999瓶是普通的水，有1瓶是毒药。任何喝下毒药的生命都会在一星期之后死亡。现在你只有10只小白鼠和1个星期的时间，如何检验出哪个瓶子有毒药？

### 思路
10只小白鼠，小白鼠有中毒和不中毒两种状态，从信息学的角度看，10只小白鼠可以成为一个具有10位的二进制数。即可以表示1024（0~1023）个编号。将1000个瓶子编成0~999号。将编号化成2进制表示。然后给对应的2进制上‘1’位置的小白鼠服药。这样，服用每瓶药的小白鼠位置和数量是不同的，例如编号为2（0000000010）的药只给第二只小白鼠喝。而14号药（0000001110）只给第2，3，4只小白鼠喝。最后死的小白鼠的位置为1，活得小白鼠位置为0即可得到一个十位的二进制数，而这个数即有毒药品的编号。

## 总结
会发现这两题的思路很相似，都利用了数字的二进制特征，而且都是问题得到了极大的简化，这需要对数字的敏感性。这种题属于非常规的算法题，其特点就是非常巧妙，如果没见过很难想到，偶然性较大。

<br>



----------
![](//
jverson.oss-cn-beijing.aliyuncs.com/blogpic/E___0109GD00SIGT.gif)