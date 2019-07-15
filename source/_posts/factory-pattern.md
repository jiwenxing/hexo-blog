title: 工厂设计模式实践
categories: Coding
tags: [Java]
date: 2017-03-26 15:50:46
---

经常有类似这样的需求：对外提供一个接口（例如向音箱提供一个nlu接口），而这个接口会有多个实现，例如购物的nlu和音乐的nlu分别就是不同的实现类，而且这些实现类会有很多公共的实现，这时应该怎么去设计这个系统使得最大程度的复用代码，并且以后新增业务的代价最小？这里就可以用到工厂设计模式。<!-- more -->

## 设计目标

我们希望设计一种扩展灵活，易于维护的系统，对于新的业务接入，不需要开发大量的重复代码（例如只添加一个实现类，重写必要的方法即可），系统调用方也不需要做太大的改动。

## 系统结构

我们还是以智能音箱接入的nlu接口为例，没有抽象之前的做法就是每新增一个业务，就对外新增一个接口，这样做的弊端就是重复代码多，耦合严重，不利于扩展。

而使用工厂模式进行抽象后的思路是：使用接口暴露公共的方法，使用抽象类来提供公共的实现，不同的业务实现该抽象类并实现抽象类中的抽象方法，使用工厂类针对不同的业务（利用调用参数中的某个字段区分）返回不同的实现类（处理器）。

### 公共接口

对外提供的公共接口应该是一个标准化的接口，其中的入参会有一个callerSource的属性标识调用方属于哪个业务，方便工厂类返回对应的processor。

```java
public interface SmartGeneralNLUService {
	/**
	 * get NLU result
	 */
	DomainInfo getInfo(InputText inputText) throws ServiceException;
}
```

### 公共接口实现

该实现类相当于一个请求分发器，调用工厂类来获取对应的真正的nlu实现类来处理请求

```java
@Service("smartGeneralNLUService")
public class SmartGeneralNLUServiceImpl implements SmartGeneralNLUService {

	@Autowired
	private NLUServiceFactory nluServiceFactory;
	
	@Override
	public DomainInfo getInfo(InputText inputText) throws ServiceException {
		CallerEnum callerSourceEnum = CallerEnum.getEnumByCallerSource(inputText.getCallerSource());
		if (callerSourceEnum == null) {
			throw new ServiceException("unrecognized callerSource", Status.INVALID_ARGUMENT);
		}
		NLUBaseService processor = nluServiceFactory.getProcessor(callerSourceEnum);
		return processor.getDomainInfo(inputText);
	}

}
```

### 工厂类的实现

工厂在这里面起的作用，就是隐藏了具体实现类创建过程的复杂度，工厂模式抽象了对象创建的具体细节，创建的时候只需要用特定函数封装特定接口的创建细节。

```java
@Service("nluServiceFactory")
public class NLUServiceFactory implements ApplicationContextAware {
	private Map<CallerEnum, NLUBaseService> processorMap;
	
	public NLUBaseService getProcessor(CallerEnum caller){
		return processorMap.get(caller);
	}
	
	@Override
	public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
		Map<String, NLUBaseService> clinetMap = applicationContext.getBeansOfType(NLUBaseService.class);
		processorMap = new HashMap<CallerEnum, NLUBaseService>(clinetMap.size());
		for (NLUBaseService processor : clinetMap.values()) {
			processorMap.put(processor.getProcessorEnum(), processor);
		}
	}
}
```
这里的实现原理就是通过实现`ApplicationContextAware`接口从而可以在该Bean被初始化后获取到`ApplicationContext`实例，而有了`ApplicationContext`实例便可以获取到spring容器中所有定义的bean，从而可以获取到抽象类`NLUBaseService`的所有实现类并将其以callerSource为key存入到一个map当中，这样只要知道callerSource便可以获取到其对应的处理器（实现类）。


### 抽象基类完成公共代码

因为每个实现类的处理流程都一致，其中有很多重复的逻辑或方法调用（比如记录日志），此时可以先创建一个抽象基类，提取出公共的方法以便实现类去继承，而其中业务各异的方法则定义为抽象方法由各个实现类去实现。

```java
public abstract class NLUBaseService {

	public DomainInfo getDomainInfo(InputText inputText) throws ServiceException {
		// step1: preprocessInputText
		preprocessInputText(inputText);
		// step2: extractDomainInfo
		DomainInfo domainInfo = extractDomainInfo(inputText);
		// step3：log
		logDomainInfo(inputText, domainInfo.getAction(), "", "");
		return domainInfo;
	}

	/**
	 * extract domain/action info by specified matching rules
	 */
	protected abstract DomainInfo extractDomainInfo(InputText inputText);

	/**
	 * get caller source ENUM by caller source constant
	 */
	public abstract CallerEnum getProcessorEnum();

	/**
	 * process templete matching result
	 */
	protected void processMatchingResult(DomainInfo domainInfo, String sequence) {
		// ...
	}

	/**
	 * parameters completeness check & text preprocessing
	 */
	private void preprocessInputText(InputText inputText) throws ServiceException {
		//
	}

	/**
	 * log nlu result to hbase
	 */
	private void logDomainInfo(InputText inputText, ActionType action, String triageInfos, String isChange) {
		//...
	}
}
```

注意实现类里的`getDomainInfo`及`getProcessorEnum`是暴露给工厂方法调用的，而前者的处理分为三个步骤，只有step2是根据业务在每个实现类中有不同实现的，因此将该方法定义为抽象的以在实现类中提供实现，而step1,3在每个实现类中都是一样的，所有其实现抽取到基类中。另外还有注意权限修饰符的使用，需要实现类继承的方法使用`protected`修饰，提供外部调用的方法用`public`修饰，而只在基类中调用的方法则使用`private`修饰即可。

### 实现类完成特定的业务实现

之后每新增一个业务只需要添加一个实现类，实现类中只需要重写业务互异的方法`extractDomainInfo`和`getProcessorEnum`即可，例如

```java
@Service
public class MusicNLUServiceImpl extends NLUBaseService {
	
	@Override
	protected DomainInfo extractDomainInfo(InputText inputText) {
		// 。。。
		return domainInfo;
	}

	@Override
	public CallerEnum getProcessorEnum() {
		return CallerEnum.MUSIC;
	}
}
```

## 总结

通过上面的例子会发现，设计系统时使用恰当的设计模式可以使代码更简洁、系统更容易扩展、也更易维护，让体力劳动变成一种艺术，将有限的时间投入到创造当中，而不是无止境的重复工作。

## 参考

1. [如何设计一种网关类型的服务端架构](//www.jianshu.com/p/648c5031bcf1)