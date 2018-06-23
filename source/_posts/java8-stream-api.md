title: Java 8 中的 Streams API
categories: Coding
tags: [Java8]
toc: false
date: 2018-03-23 09:47:27
---


Stream 作为 Java8 的一大亮点，是对集合（Collection）对象功能的增强，它专注于对集合对象进行各种非常便利、高效的聚合操作（过滤、排序、分组、聚合等），或者大批量数据操作 (bulk data operation)。Stream API 借助于同样新出现的 Lambda 表达式，极大的提高编程效率和程序可读性。<!-- more -->

同时它提供串行和并行两种模式进行汇聚操作，并发模式能够充分利用多核处理器的优势。借助 Stream API 和 Lambda，开发人员可以很容易的编写出高性能的并发处理程序。


## Why Stream API

Stream 提供的功能都可以在集合类中实现，为什么还要定义全新的Stream API？Oracle官方给出了几个重要原因：

- 集合类持有的所有元素都是存储在内存中的，非常巨大的集合类会占用大量的内存，而Stream的元素却是在访问的时候才被计算出来，这种“延迟计算”的特性有点类似Clojure的lazy-seq，占用内存很少。

- 集合类的迭代逻辑是调用者负责，通常是for循环，而Stream的迭代是隐含在对Stream的各种操作中，例如map()。

如何理解第一条提到的`延迟计算`？下面看一个例子。

如果要表示自然数集合，显然用集合类是不可能实现的，因为自然数有无穷多个。但是Stream可以做到。自然数集合的规则非常简单，每个元素都是前一个元素的值+1，因此，自然数发生器用代码实现如下：

```java
public class NaturalSupplier implements Supplier<Long> {

	long value = 0;
	
	@Override
	public Long get() {
		this.value = value + 1;
		return this.value;
	}

}
```

反复调用get()，将得到一个无穷数列，利用这个Supplier，可以创建一个无穷的Stream：

```java
public static void main(String[] args) {
	Stream<Long> natural = Stream.generate(new NaturalSupplier()); //generate的入参是一个supplier接口的实现
	natural.map(x -> x*x).limit(10).forEach(System.out::println);
}
```

如果利用集合想得到1到10的平方，需要先创建一个1到10的 list，这个 list 是在内存中的，如果这个集合特别大则特别占用内存，但是如果利用 Stream 则只有在引用的时候才会去计算。

同时利用 Stream API，可以设计更加简单的数据接口。例如，生成斐波那契数列，完全可以用一个无穷流表示。可以就看到用 Stream 表示 Fibonacci 数列，其接口比任何其他接口定义都要来得简单灵活并且高效。

```java
class FibonacciSupplier implements Supplier<Long> {

    long a = 0;
    long b = 1;

    @Override
    public Long get() {
        long x = a + b;
        a = b;
        b = x;
        return a;
    }
}

public class FibonacciStream {

    public static void main(String[] args) {
        Stream<Long> fibonacci = Stream.generate(new FibonacciSupplier());
        fibonacci.limit(10).forEach(System.out::println);
    }
}
```

## 创建流

创建流的方式有很多，最常用的有：集合类转换为流、通过数组创建流、通过文件创建流以及通过函数创建流，示例如下:

```java
//集合->流
Sets.newHashSet().stream();
Lists.newArrayList().stream();	

// 数组->流
String[] strs = {"A", "B", "C", "D"};
Stream<String> stream = Arrays.stream(strs);

// 文件->流
try {
	Stream<String> fileStream = Files.lines(Paths.get("d://a.txt"), Charsets.UTF_8);
	List<String> lines = fileStream.filter(s -> s!=null && s.startsWith("K_")).collect(Collectors.toList());
	System.out.println(lines);
} catch (IOException e) {
	e.printStackTrace();
}

// 函数创建流
// 1. iteartor  接受Function参数，0 为seed，n -> n + 2 为 Function 接口的抽象方法 R apply(T t) 的实现； 从0开始打印51个偶数
Stream.iterate(0, n -> n + 2).limit(51).forEach(System.out::println);  
// 2. generate  接受Supplier参数，() -> "Hello Man!" 为 Supplier接口的抽象方法 T get()的实现; 重复打印10个"Hello Man!"
Stream.generate(() -> "Hello Man!").limit(10).forEach(System.out::println);

```



## 使用流（中间处理 intermediate）

一个流可以后面跟随零个或多个 intermediate 操作，Stream API 中常用的流操作有以下这些：

- filter()：对流的元素过滤
- map()：将流的元素映射成另一个类型
- distinct()：去除流中重复的元素
- sorted()：对流的元素排序
- forEach()：对流中的每个元素执行某个操作
- peek()：与forEach()方法效果类似，不同的是，该方法会返回一个新的流，而forEach()无返回
- limit()：截取流中前面几个元素
- skip()：跳过流中前面几个元素
- toArray()：将流转换为数组
- reduce()：对流中的元素归约操作，将每个元素合起来形成一个新的值
- collect()：对流的汇总操作，比如输出成List集合
- anyMatch()：匹配流中的元素，类似的操作还有allMatch()和noneMatch()方法
- findFirst()：查找第一个元素，类似的还有findAny()方法
- max()：求最大值
- min()：求最小值
- count()：求总数

```java
// 去重
List<String> strings = Arrays.asList("d", null, "a", "c", "f", "a", "x", "n");
strings.stream().filter(s -> s!=null).distinct().forEach(System.out::println);

// 筛选(对流的元素过滤)
apples.stream().filter(apple -> apple.getWeight()>2).forEach(System.out::println);

// 排序(对流的元素排序)
apples.stream().sorted((Apple a, Apple b) -> Float.valueOf(a.getWeight()).compareTo(b.getWeight())).forEach(System.out::println);

// 映射(将流的元素映射成另一个类型), 将实体Apple列表映射为其属性产地的列表
List<String> origins = apples.stream().map(apple -> apple.getOrigin()).collect(Collectors.toList());

// 查找和匹配(将流的元素映射成另一个类型)
System.out.println("-------查找任意元素匹配------");
System.out.println(apples.stream().anyMatch(apple -> apple.getWeight()>2 && apple.getOrigin().equals("baoji")));
System.out.println("-------查找所有元素匹配------");
System.out.println(apples.stream().allMatch(apple -> apple.getWeight()>2));
System.out.println("-------查找任意元素没有匹配------");
System.out.println(apples.stream().noneMatch(apple -> apple.getWeight()>2));
System.out.println("-------查找元素------");
System.out.println(apples.stream().filter(apple -> apple.getWeight()>2).count());
System.out.println(apples.stream().filter(apple -> apple.getWeight()>2).findFirst()); //返回满足条件第一个元素
System.out.println(apples.stream().filter(apple -> apple.getWeight()>2).findAny()); //返回满足条件任一元素，返回也是第一个元素，效率考虑推荐使用findAny


/*归约操作（求和，求最大值或最小值）*/
System.out.println("-------求和，计算所有苹果总重------");
System.out.println(apples.stream().map(Apple::getWeight).reduce((n,m) -> n+m).get()); //reduce操作接收BinaryOperator类型参数，它继承了BiFunction，接受两个类型相同的参数
//T reduce(T identity, BinaryOperator accumulator)
int value = Stream.of(1, 2, 3, 4).reduce(100, (sum, item) -> sum + item); //110, 100即为计算初始值，每次相加计算值都会传递到下一次计算的第一个参数。
//最大最小值
apples.stream().max(Comparator.comparing(Apple::getWeight)).get();
apples.stream().min(Comparator.comparing(Apple::getWeight)).get();

```


## 数据收集（终端处理terminal）

前面两部分内容分别为流式数据处理的前两个步骤：从数据源创建流、使用流进行中间处理。数据收集是流式数据处理的终端处理，与中间处理不同的是，一个流只能有一个 terminal 操作，终端处理会消耗流，也就是说，终端处理之后，这个流就会被关闭，如果再进行中间处理，就会抛出异常。数据收集主要使用 collect 方法，该方法也属于归约操作。

### SummaryStatistics

Collectors工具类为我们提供了用于汇总的方法，包括summarizingInt()，summarizingLong()和summarizingDouble()，该方法会返回一个DoubleSummaryStatistics对象，包含一系列归约操作的方法，如：汇总、计算平均数、最大值、最小值、计算总数：

```java
DoubleSummaryStatistics dss = apples.stream().collect(summarizingDouble(Apple::getWeight));
double sum = dss.getSum();          // 汇总
double average = dss.getAverage();  // 求平均数
long count = dss.getCount();        // 计算总数
double max = dss.getMax();          // 最大值
double min = dss.getMin();
```


 ### GroupingBy   

和关系数据库一样，流也提供了类似于数据库中 GROUP BY 分组的特性，由 Collectors.groupingBy() 方法提供。使用可以参考下面示例，分组方法 groupingBy() 接收一个 Function 接口作为参数。

```java
// 苹果按照产地分组，打印产自陕西的分组
Map<String, List<Apple>> originGroup = apples.stream().collect(groupingBy(Apple::getOrigin));
System.out.println(originGroup.get("shanxi"));
```

当遇到更为复杂的情况时，可以直接使用Lambda表达式来表示这个分组逻辑。

```java
// 苹果按照重量区间分组，打印大号的分组
Map<String, List<Apple>> weightGroup = apples.stream().collect(groupingBy(apple -> {
	if (apple.getWeight()<1) {
		return "small";
	}else if (apple.getWeight()<2 && apple.getWeight()>1) {
		return "medium";
	}else {
		return "big";
	}
})); 
System.out.println(weightGroup.get("big"));
```

## 流转换为其它数据结构

```
// 1. Array
String[] strArray1 = stream.toArray(String[]::new);
// 2. Collection
List<String> list1 = stream.collect(Collectors.toList());
List<String> list2 = stream.collect(Collectors.toCollection(ArrayList::new));
Set set1 = stream.collect(Collectors.toSet());
Stack stack1 = stream.collect(Collectors.toCollection(Stack::new));
// 3. String
String str = stream.collect(Collectors.joining()).toString();

```


## 总结

总之，Stream 的特性可以归纳为：

- 不是数据结构
- 它没有内部存储，它只是用操作管道从 source（数据结构、数组、generator function、IO channel）抓取数据。
- 它也绝不修改自己所封装的底层数据结构的数据。例如 Stream 的 filter 操作会产生一个不包含被过滤元素的新 Stream，而不是从 source 删除那些元素。
- 所有 Stream 的操作必须以 lambda 表达式为参数
- 不支持索引访问
- 很容易生成数组或者 List
- 惰性化
- 很多 Stream 操作是向后延迟的，一直到它弄清楚了最后需要多少数据才会开始。
- Intermediate 操作永远是惰性化的。
- 并行能力
- 当一个 Stream 是并行化的，就不需要再写多线程代码，所有对它的操作会自动并行进行的。
- 可以是无限的
- 集合有固定大小，Stream 则不必。limit(n) 和 findFirst() 这类的 short-circuiting 操作可以对无限的 Stream 进行运算并很快完成。

## 参考

- [**Java 8 中的 Streams API 详解**](https://www.ibm.com/developerworks/cn/java/j-lo-java8streamapi/)
- [Java 8新特性：全新的Stream API](https://www.liaoxuefeng.com/article/001411309538536a1455df20d284b81a7bfa2f91db0f223000)
- [Java 8新特性（二）：Stream API](https://lw900925.github.io/java/java8-stream-api.html)