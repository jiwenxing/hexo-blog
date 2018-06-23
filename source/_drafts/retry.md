title: retry
categories: Coding Thinking
tags: []
toc: true
date: 2018-05-22 19:19:35
---



```java
public class RetryTest {

	private static Integer num = 0;
	
	public static void main(String[] args) {
		Boolean result = false;
		Retryer<Boolean> retryer = RetryerBuilder.<Boolean>newBuilder()  
		        .retryIfResult(Predicates.equalTo(false))
		        .withStopStrategy(StopStrategies.stopAfterAttempt(3))
//		        .withWaitStrategy(WaitStrategies.fixedWait(2, TimeUnit.SECONDS))
		        .withWaitStrategy(WaitStrategies.incrementingWait(1, TimeUnit.SECONDS, 1, TimeUnit.SECONDS))  
		        .build(); 
		try {  
			System.out.println("aaaaaaaaaaa");
		    result = retryer.call(getTokenUserCall);  
		} catch (Exception e) {  
		    System.err.println("still failed after retry." );  
		} 
		System.out.println(result);
	}
	
	
	private static Callable<Boolean> getTokenUserCall = new Callable<Boolean>() {

		@Override
		public Boolean call() throws Exception {
			num++;
			System.out.println("calling..........num=" + num);
			if (num==4) {
				return true;
			}
			return false;
		}
		
	};
	
	
}
```

