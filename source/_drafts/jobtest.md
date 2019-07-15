title: 两道笔试题
date: 2015-01-28 22:30:58
categories: Coding
tags: [Java]
---

最近参加了某电子商务网站的招聘，先是一个笔试，一道常规编程题和一道关于二叉树的算法题；两天之后又一个机试，让现场电脑上编程，同样是一道常规编程和一道关于双向循环链表的算法题。
<!-- more -->
## 笔试题1

### 问题描述
有一个文本文件，其中第一行的数字代表行数，接下来每一行都是一组时间数据，举例如下：
```
3
07:55 19:30 08:48 05:30 21:10
13:23 07:35 23:22 14:13 12:01
11:10 14:00 02:56 06:30 22:10
```
其中第一行数字3代表共有3行时间数据，后面每行都是五组时间值。要求计算每行中的每个时间所对应的时钟与分钟指针之间的夹角，并将其按照大小排序，输出其中角度值位于中间的那个时间值。

### 问题分析
该题考察了IO操作（读取文本）、字符串操作、排序及简单的算法（计算指针夹角），虽然涉及东西较多，但都比较基础，只要平时多练习一些基本操作，应该问题不大。另外里面还涉及到集合类HashMap的使用，一定要多练习。

### 代码样例
以下代码只测试了一个数据样本，不保证没有bug（应该问题不大）

```
package xxx.test;
import java.io.*;
import java.util.HashMap;
public class MedianTime {
	public static void main(String[] args){				
		String str[] = null;   //用于存储每行数据，将try代码块中读取的变量赋给其，从而可在try外部使用
		int rowNum = 0;  //行数
		try{                                    //try内定义的变量作用域只在try内部
			File file = new File("f:/time.txt");	
			BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(file)));
			rowNum = Integer.parseInt(br.readLine()); //第一行为行数
			System.out.println("total timedata lines: "+rowNum);
			String[] strs = new String[rowNum];  //注意strs时局部变量，只能在try内部使用
			for(int i=0;i<rowNum;i++){
				strs[i] = br.readLine();
				System.out.println("the "+i+"th line is: "+strs[i]);
			}
			str = strs;  //将局部变量strs赋给try外部变量str
			br.close();
		}catch(Exception e){
			System.out.println("读取文件异常！");
			e.printStackTrace();
		}
				
        for(int j=0;j<rowNum;j++){   //这里对每一行时间数据分别处理
        	String timeArray[] = str[j].split(" ");
        	MedianTime.dispMedian(timeArray);  //用于计算并显示角度排在中间的时间
        }             
	}
	
	public static void dispMedian(String[] str){		
		int hh, mm;
		int angle[] = new int[str.length];
		HashMap<Integer,String> hm = new HashMap<Integer,String>();//由于排序后时间和其角度的关系将被破坏，因此用HashMap将其对应关系保存起来
		System.out.print("the angle of time is:");
		for(int i=0;i<str.length;i++){
			String hhmm[] = str[i].split(":");
			hh = Integer.parseInt(hhmm[0]);
			if(hh>=12)  
				hh = hh-12;  //注意时钟大于12时要处理
			mm = Integer.parseInt(hhmm[1]);
			//System.out.println(hh+":"+mm+"  ");
			angle[i] = Math.abs((hh*30+mm/2)-mm*6); //计算指针夹角			
			if(angle[i]>180)   //按照指针之间的较小角度计算
				angle[i] = 360-angle[i];
			hm.put(angle[i], str[i]);
			System.out.print(angle[i]+"  ");	
		}
		System.out.println();
		MedianTime.angleSort(angle);//对指针夹角排序
		int medianAngle = angle[angle.length/2]; //得到夹角中间值
		String medianTime = hm.get(medianAngle); //找到该夹角对应时间并输出
		System.out.println("the median time of this line:  "+medianTime);

	}
		
	public static void angleSort(int timeAngle[]){  //对指针夹角冒泡排序
		for(int i=0;i<timeAngle.length;i++)
			for(int j=0;j<timeAngle.length-i-1;j++){
				if(timeAngle[j]>timeAngle[j+1]){
					int temp = timeAngle[j];
					timeAngle[j] = timeAngle[j+1];
					timeAngle[j+1] = temp;
				}	
			}	
	}	
}
```
### 样例输出

```
total timedata lines: 3
the 0th line is: 07:55 19:30 08:48 05:30 21:10
the 1th line is: 13:23 07:35 23:22 14:13 12:01
the 2th line is: 11:10 14:00 02:56 06:30 22:10
the angle of time is:93  45  24  15  145  
the median time of this line:  19:30
the angle of time is:97  17  151  12  6  
the median time of this line:  07:35
the angle of time is:85  60  112  15  115  
the median time of this line:  11:10
```

## 机试题1
### 问题描述
有个文本文件中存储了一组营业额数据，第一行代表天数，后面每行代表那一天的营业额。如果定义某一天的营业额波动为：
>sale_wave(i) = min|D(i) - D(j)|       （j between 1 and i）

举例如下：
```
6
5
1
2
5
4
6
```
第一行6代表有6天的销售数据，后面的6行则记录了每天的营业额，以第五天为例，可知当天的营业额波动值为：
>sale_wave(5) = min|D(5) - D(j)| = min|-1, 3, 2, -1| = 1

最后求这些天的营业额波动之和，即sum(sale_wave(i))

### 问题分析
和上题差不多，同样考察了IO、排序及其他的一些比较基础的编程技能，而算法就是已知的，因此这类题目主要考察编程的熟练程度。

### 代码样例
```
package xxx.test;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
public class Test1 {
	public static void main(String[] args){		
		int days = 0;
		int daysales[] = null;
		try{                                    
			File file = new File("f:/sale.txt");	
			BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(file)));
			days = Integer.parseInt(br.readLine());
			System.out.println(days);
			int[] day_sales = new int[days];
			for(int i=0;i<days;i++){
				day_sales[i] = Integer.parseInt(br.readLine());
				System.out.println(day_sales[i]);
			}
			daysales = day_sales;
			br.close();
		}catch(Exception e){
			System.out.println("读取文件异常！");
			e.printStackTrace();
		}
//		for(int i=0;i<daysales.length;i++){
//			System.out.print(daysales[i]+" ");
//		}
		int minWave = calSumWave(daysales);
		System.out.println("每天的最小波动值之和为："+minWave);
	}
	static int calSumWave(int a[]){	
		int sumWave = 0;
		int dayMinWave[] = new int[a.length];
		int sub[] = null;
		for(int i=0;i<a.length;i++){
			if(i==0){
				dayMinWave[i] = a[0];
				//System.out.print(" "+dayMinWave[i]);
			}else if(i==1){
				dayMinWave[i] = Math.abs(a[1]-a[0]);
				//System.out.print(" "+dayMinWave[i]);
			}
			else{
				for(int j=0;j<i-1;j++){
					
					    sub = new int[i-1];
						sub[j] = Math.abs(a[i]-a[j]);
						//System.out.print(" "+sub[j]);					
				}				
				//System.out.println(sub.length);
				dayMinWave[i] = findMin(sub);	
			}
		}
		for(int k=0;k<a.length;k++){
			sumWave = sumWave + dayMinWave[k];
		}	
		return sumWave;
	}	
	static int findMin(int a[]){
		int minIndex = 0;
		for(int m=1;m<a.length;m++){
			if(a[m]<a[minIndex]){
				minIndex = m;
			}
		}	
		return a[minIndex];
	}	
}
```

### 样例输出
```
6
5
1
2
5
4
6
每天的最小波动值之和为：12
```

## 总结
很庆幸每次只做出了其中一道也被算作通过了，但是还是暴露了很多问题，实现必须对一些例如IO、排序之类的基本操作达到非常熟练，这样才能很快的完成以上这样的题目，从而留更多的时间去思考第二道算法题，而算法题则需要灵活的思维和更多的技巧，而这更需要平时的积累和总结来提升，所以，骚年，继续努力，下次你可不一定有这么幸运了！

![](//
jverson.oss-cn-beijing.aliyuncs.com/blogElement/totoroAbout.jpg)
<br><br>