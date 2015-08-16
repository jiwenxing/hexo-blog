title: 用最小时间复杂度判断数组中是否存在两元素之和为指定值
date: 2014-05-20 13:50:15
categories: Coding
tags: [Algorithm,Java] 
---

##问题描述
在数组中找是否存在其和为指定值得两个数，有则返回true，无则false
##分析
显然可以通过二重遍历查找，其时间复杂度为O(n^2),能否改进使其复杂度降低到O(nlogn)甚至O(n)呢？
<!-- more -->
##思路一
其实一看到O(nlogn)就应该马上联想到快速排序，因为这就是它的时间复杂度，那么能否用在这里呢，显然可以：
先将数组快速排序，再从两段数值和开始找，大了则从末端向前移动，小了则从初始向后移动，最终复杂度：O(nlogn)+O(n)=O(n*logn)

``` java
public class Demo1 {
	public static void main(String arg[]){
   	    int arr[] = {1,3,6,8,9,5,2,4,6};
        Demo1.disp(arr);
        System.out.println(Demo1.hasSum(arr, 20));
    }
	
	public static boolean hasSum(int arr[], int sum){  //设置为static便可以使用类名直接调用函数
		boolean res = false;
		int i, j;
		if(arr.length<2) return res;  //一定要注意初始条件判断，任何时候都不要忽略
		else{
			Demo1.quickSort(arr,0,arr.length-1);
			Demo1.disp(arr);  //观察排序结果是否正确
			i = 0;
			j = arr.length-1;
			while(i<j&&arr[i]<sum){
				if(arr[i]+arr[j]>sum) j--;
				else if(arr[i]+arr[j]<sum) i++;
				else return true;
			}
			return false;
		}
	}
	
	public static void quickSort(int a[], int start, int end){
		int i, j, temp;
		//start = 0;
		//end = a.length-1;
		if(start<end){
			i = start;
			j = end;
			temp = a[i];
			while(i<j){
				while(i<j&&a[j]>temp) j--;
				if(i<j){
					a[i] = a[j]; i++;
				}
			    while(i<j&&a[i]<temp) i++;
				if(i<j){
					a[j] = a[i]; j--;
				}
			}
		a[i] = temp;	
		if(i-1>start) quickSort(a,start,i-1);
		if(j+1<end) quickSort(a,j+1,end);
		}
	}
}
```
##思路二
针对Demo1的情况，假设数组元素各不相同的话能否做到时间复杂度为O(n)，并返回两个数组元素的下标时间复杂度要求较高的情况下一般都应该想到hash。具体思路：
扫描一遍数组，得到数组对应的哈希表；第二次扫描该表，检查sum与当前元素的差值是否在哈希表中，而哈希表的查找是常数时间，因此时间复杂度O(n)
```java
public class Demo2 {
    
	public static void main(String arg[]){
	    int arr[] = {1,3,6,8,9,5,2,4};
	    int result[]=Demo2.hasSum2(arr, 17);
        System.out.println(10+"是第"+result[0]+"和第"+result[1]+"个元素之和");
    }
	
	
	public static int[] hasSum2(int arr[],int sum){
		int res[] = {-1,-1};//初始化返回值
		if(arr.length<2) return res;//初始条件判断，注意不要忘
		HashMap<Integer,Integer> hm = new HashMap<Integer,Integer>(); //建立哈希表
		for(int i=0;i<arr.length;i++){  //第一遍遍历初始化哈希表，注意用法
			hm.put(arr[i], i);
		}
		for(int i=0;i<arr.length;i++){  //第二遍遍历，查找符合条件的值
			if(hm.containsKey(sum-arr[i])&&sum!=2*arr[i]){ //注意这里的第二个判断语句
				res[0] = i;
				res[1] = hm.get(sum-arr[i]);//注意哈希表的一些用法
				return res;
			}
		}
		return res;
	}
}
```

##总结
一般对于程序效率的提升无非就是从O(n^2)到O(n*logn)甚至到O(n)，而通常O(nlogn)都与快排有关，即可以应用快速排序对问题进行预处理降低其时间复杂度，而要达到O(n)一般除了一些特定的巧妙算法，就必然是与哈希结构相关。
<br>



----------
![](http://7u2eve.com1.z0.glb.clouddn.com/blogpic/E___0109GD00SIGT.gif)