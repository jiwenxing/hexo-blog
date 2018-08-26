title: Java 8 中的 Lambda 表达式
categories: Coding
tags: [Java8]
toc: false
date: 2018-03-20 19:19:34
---

Lambda 表达式作为 JDK8 引入的一个重要的特性，它主要是替换了原有匿名内部类的写法，也就是简化了匿名内部类的写法，通过引入新的语法形式提高了程序的可读性和可维护性。

## 行为参数化

先通过一个场景来看看什么叫做行为参数化：我们希望筛选出绿色的苹果，常规的实现方式如下（列举了三种不同的遍历写法，主要是为了炫技）：

```java
//常规方法：筛选出绿色的苹果
public static List<Apple> filterGreenApples(List<Apple> apples){
	/*写法1，常规遍历*/
	List<Apple> filterApples = Lists.newArrayList();
	for (Apple apple : apples) {
		if (Color.GREEN.equals(apple.getColor())) {
			filterApples.add(apple);
		}
	}

	/*方法2，JDK8 lambda遍历*/
	List<Apple> filterApples = Lists.newArrayList();
	apples.forEach(apple -> {
		if (Color.GREEN.equals(apple.getColor())) {
			filterApples.add(apple);
		}
	});

	/*写法3：使用JDK8 stream*/
	List<Apple> filterApples = apples.stream().filter(apple -> Color.GREEN.equals(apple.getColor())).collect(Collectors.toList());

	return filterApples;
}
```

看起来这样做没什么问题，但是需求千变万化，如果突然需要筛选红色的苹果怎么办，当然这时你可以复制一个方法改一下颜色即可，那如果又需要根据某个特定重量做一些筛选呢，这时不但要改筛选条件，还需要添加入参。也就是说如果筛选条件频繁变化，有没有更加合理的处理方式，比如说我们将筛选条件当做参数传进来（因为筛选条件千变万化），其余的代码模板化，而不是在模板代码中去实现筛选条件。且看下方代码：

```java
//1. 定义一个函数式接口（后面会详细讲解函数式接口）
@FunctionalInterface
public interface AppleFilter {

	boolean accept(Apple apple);
	
	public static List<Apple> filterApplesByAppleFilter(List<Apple> apples, AppleFilter filter) {
		List<Apple> filterApples = Lists.newArrayList();
		for (final Apple apple : apples) {
			if (filter.accept(apple)) {
			    filterApples.add(apple);
			}
		}
		return filterApples;
	}
}

//2. 使用匿名类的方式在调用的位置传入筛选条件
public static void main(String[] args) {
	Apple[] appleArr = {
		new Apple(Color.GREEN, 2.2f, "baoji"), 
		new Apple(Color.GREEN, 1.2f, "shanxi"), 
		new Apple(Color.RED, 1.5f, "xinjiang"),
		new Apple(Color.YELLOW, 2.5f, "tianjin")
	};
	List<Apple> apples = Arrays.asList(appleArr);
	
	List<Apple> filterApples = AppleFilter.filterApplesByAppleFilter(apples, new AppleFilter() {
		@Override
		public boolean accept(Apple apple) {
			return Color.GREEN.equals(apple.getColor()) && apple.getWeight()>2;
		}
	});
	filterApples.forEach(System.out::println);	
}
```

这种实现将行为进行了抽象化，在具体调用的位置将筛选条件（行为或者函数）作为参数传递到方法中，这就是**行为参数化**的一种实现。行为参数化简单的说就是函数的主体仅包含模板类通用代码，而一些会随着业务场景而变化的逻辑则以参数的形式传递到函数之中，采用行为参数化可以让程序更加的通用，以应对频繁变更的需求。

这里使用了匿名内部类的方式传递行为，这样的设计在 jdk 内部也经常采用，比如 Java.util.Comparator，java.util.concurrent.Callable 等，使用这一类接口的时候，我们都可以在具体调用的地方用匿名类来指定函数的具体执行逻辑。

在 Java 8 之前，如果想将行为传入函数，仅有的选择就是匿名类，需要6行代码。而定义行为最重要的那行代码，却混在中间不够突出。JAVA8 之后 Lambda 表达式取代了匿名类，取消了模板，允许用函数式风格编写代码。这样可读性更好，表达更清晰。通过 lambda 表达式简化后一行代码搞定：

```java
List<Apple> filterApples = AppleFilter.filterApplesByAppleFilter(apples, (Apple apple) -> Color.GREEN.equals(apple.getColor()) && apple.getWeight()>2);
filterApples.forEach(System.out::println);
```

##  lambda 表达式

我们可以将 lambda 表达式定义为一种简洁、可传递的匿名函数，它没有具体的函数名称，不属于某个特定的类，但具备参数列表、函数主体、返回类型，以及能够抛出异常。 lambda 表达式本质上就是一个函数（函数式接口中的抽象方法实现），而且可以像参数一样进行传递，从而极大的简化代码的编写。格式定义如下：

> 格式一： 参数列表 -> 表达式
格式二： 参数列表 -> {表达式集合}

需要注意的是，lambda 表达式隐含了 return 关键字，所以在单个的表达式中，我们无需显式的写 return 关键字，但是当表达式是一个语句集合的时候，则需要显式添加 return，并用花括号`{}`将多个表达式包围起来，下面看几个例子：

```java
// 返回给定字符串的长度，隐含return语句
(String s) -> s.length() 
// 始终返回42的无参方法
() -> 42
// 包含多行表达式，则用花括号括起来
(int x, int y) -> {
	int z = x * y;
	return x + z;
}
```

## 函数式接口

lambda 表达式的使用需要借助于函数式接口，也就是说只有函数式接口出现地方，我们才可以将其用lambda表达式进行简化。

函数式接口定义为*只具备一个抽象方法的接口*。Java8 在接口定义上的改进就是引入了默认方法，使得我们可以在接口中对方法提供默认的实现，但是不管存在多少个默认方法，只要具备一个且只有一个抽象方法（default 默认方法、static 静态方法以及继承 Object 的方法都不算抽象方法），那么它就是函数式接口，例如上面写的`AppleFilter`接口。

在定义函数式接口时可以为该接口添加 `@FunctionalInterface` 注解，用于标记该接口是函数式接口，不过这个注解是可选的，当添加了该接口之后，编译器就限制了该接口只允许有一个抽象方法，不符合条件时会在编译期报错，所以推荐为函数式接口添加该注解。

下面是 JDK 自带的函数式接口 Comparator 的示例：
```java
@FunctionalInterface
public interface Comparator<T> {

	int compare(T o1, T o2);

	boolean equals(Object obj);

	default Comparator<T> reversed() {
        return Collections.reverseOrder(this);
    }

    //...
}
```

## 类型推断

可以将 lambda 表达式中的参数类型隐去，编译器也可以根据上下文正确判断，例如将前面代码的第二个入参`(Apple apple)`的类型隐去程序也能正确处理。

```java
List<Apple> filterApples = AppleFilter.filterApplesByAppleFilter(apples, apple -> Color.GREEN.equals(apple.getColor()) && apple.getWeight()>2);
```


## 使用示例

### 用 lambda 表达式实现 Runnable

```java
private static void runableByLambda() {
	//普通写法
	new Thread(new Runnable() {
		@Override
		public void run() {
			System.out.println("hahaha");
		}
	}).start();
	
	//lambda 文艺写法
	new Thread(() -> System.out.println("hehehe")).start();
}
```

观察 `Runnable` 接口会发现它就是一个函数式接口

```java
@FunctionalInterface
public interface Runnable {
    /**
     * When an object implementing interface <code>Runnable</code> is used
     * to create a thread, starting the thread causes the object's
     * <code>run</code> method to be called in that separately executing
     * thread.
     * <p>
     * The general contract of the method <code>run</code> is that it may
     * take any action whatsoever.
     *
     * @see     java.lang.Thread#run()
     */
    public abstract void run();
}
```

### 用 lambda 表达式迭代列表

```java
private static void iterateListByLambda(List<Apple> apples) {
	//普通方式
	for (Apple apple : apples) {
		System.out.println(apple);
	}
	
	//文艺方式-lambda
	apples.forEach(apple -> System.out.println(apple));
	
	//更文艺方式-lambda & method reference 方法引用
	apples.forEach(System.out::println);
}
```
这里之所以能这么写是因为 forEach 接受一个实现 Consumer 接口的参数，而 Consumer 接口则是一个函数式接口。

```java
// forEach 方法源码
default void forEach(Consumer<? super T> action) {
    Objects.requireNonNull(action);
    for (T t : this) {
        action.accept(t);
    }
}

// Consumer 接口源码
@FunctionalInterface
public interface Consumer<T> {

    void accept(T t);

    default Consumer<T> andThen(Consumer<? super T> after) {
        Objects.requireNonNull(after);
        return (T t) -> { accept(t); after.accept(t); };
    }
}
```

可以看到 Consumer 接口抽象方法没有返回值，与之对应的是有返回值的 Function 接口。另外还有一个 Supplier 接口，只有返回值，没有入参，使用过程中可以按照需要挑选，大部分情况不需要自己定义函数式接口。

```java
@FunctionalInterface
public interface Function<T, R> {

    /**
     * Applies this function to the given argument.
     *
     * @param t the function argument
     * @return the function result
     */
    R apply(T t);
    // ...
}

@FunctionalInterface
public interface Supplier<T> {

    /**
     * Gets a result.
     *
     * @return a result
     */
    T get();
}
```


### 使用 JDK 提供的 Predicate 函数式接口

```java
// 使用 Predicate 写一个 filter 方法
public static List<Apple> filter(List<Apple> apples, Predicate<Apple> condition) {
	List<Apple> filterApples = null;
    for(Apple apple: apples)  {
        if(condition.test(apple)) {
        	if (filterApples==null) {
        		filterApples = Lists.newArrayList();
			}
        	filterApples.add(apple);
        }
    }
    return filterApples;
}

// 直接调用
private static void filterApplesByPredicate(List<Apple> apples) {
	Apple.filter(apples, apple -> Color.GREEN.equals(apple.getColor()) && apple.getWeight()>2);
}

// Predicate 接口定义
@FunctionalInterface
public interface Predicate<T> {

    boolean test(T t);

    // ...
}
```

这里其实和示例中的写法一样，只是不用自己定义 `AppleFilter` 函数式接口，而直接使用了 JDK 提供的 Predicate 函数式接口，不难发现两个接口的抽象方法定义一致，因此没必要重复造轮子，而且 Predicate 接口提供了更多的默认方法。



## 参考

- [深入浅析JDK8新特性之Lambda表达式](https://www.jb51.net/article/95933.htm)
- [Java8 lambda表达式10个示例](http://www.importnew.com/16436.html)