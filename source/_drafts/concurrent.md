title: Java模拟并发请求
categories: Coding
tags: [Concurrent, 并发]
toc: true
date: 2016-05-24 20:15:04
---

最近遇到一个bug，之前线上正常运行了几个月的接口突然出现偶尔失败的情况，查日志发现MD5计算的签名错误，而且都是在有并发请求时出错。检查了签名生成逻辑和线程安全感觉没有问题，于是就想在本地模拟一下并发跟一下代码寻找问题。 <!-- more -->

java.util.concurrent是从Java5开始添加的一个提供各种并发编程方法的类，


http://tutorials.jenkov.com/java-concurrency/index.html