title: win7+sygwin+eclipse的hadoop伪分布式调试环境安装
date: 2014-08-26 18:48:50
categories: Coding
tags: [Hadoop]
---

出于兴趣，花了两天时间安装hadoop的调试环境，过程中遇到各种各样的问题，但是很庆幸几乎所有遇到的问题网上都有网友分享的解决方法，因此我觉得学会分享是很重要的一件事~本文的安装过程基本按照[这篇博文](http://pengbin6755198.blog.163.com/blog/static/23254939201421043925839/)进行的，软件版本略有不同，不过影响不大，这里主要讲讲安装过程中出现的一些新状况。
<!-- more -->
## JDK安装
之前装过jdk，版本为jdk1.7.0_51，且是安装在c盘program files目录下的。原博文所提的由于hadoop不识别目录中空格因此建议不能装在该目录下，经测试其实也没有关系，后面只需建立一个目录映射的软连接即可，指令为：
```bash
$ ln -s "c:/program files/java/jdk1.7.0_21" /usr/local/jdk1.7.0_21。
```

## sygwin安装及ssh无密码登陆配置
直接下载[sygwin](http://www.cygwin.com/)按照原博文步骤安装即可，一般不会有什么问题。因为楼主是外行（刚开始连sygwin是什么都不知道⊙﹏⊙b汗），按照教程做的时候往往也只是知其然不知其所以然，因此稍微出点状况就不知道该怎么解决了，所以还是建议大家（基础概念不清楚的亲们）知道每一步怎么做的同时也能尽量知道为什么这么做。
>sygwin：Get that Linux feeling - on Windows，a large collection of GNU and Open Source tools which provide functionality similar to a Linux distribution on Windows.

ssh是一种安全协议，这里使用RSA非对称加密算法（基于困难的大素数乘积分解），可以防止远程管理过程中的信息泄露。配置ssh的过程即生成rsa密钥对并向集群各主机分发密钥，从而可以实现无密码登陆。
```bash
<span style="font-size:14px;"><span style="font-size:12px;"><span style="font-size:10px;">lenovo@Wilson ~
$ cd .ssh/
lenovo@Wilson ~/.ssh
$ ls
authorized_keys  id_rsa  id_rsa.pub  known_hosts
lenovo@Wilson ~/.ssh
$ ssh localhost
Last login: Mon Aug 25 15:14:23 2014 from ::1
lenovo@Wilson ~
$ who
lenovo   pty1         2014-08-26 13:31 (::1)</span></span></span>
```

## hadoop安装和配置
这里需要注意的就是修改conf下配置文件时，只改相关内容不要改格式，就是用记事本打开把相应的内容改过来即可。我刚开始为了便于阅读在写字板里改的，可能是改变了文档的格式，导致出错。
```bash
lenovo@Wilson ~
$ cd /home/
lenovo@Wilson /home
$ ls
hadoop-1.2.1  lenovo
lenovo@Wilson /home
$ cd hadoop-1.2.1/
lenovo@Wilson /home/hadoop-1.2.1
$ ./start-all.sh
-bash: ./start-all.sh: No such file or directory
lenovo@Wilson /home/hadoop-1.2.1
$ bin/start-all.sh
starting namenode, logging to /home/hadoop-1.2.1/libexec/../logs/hadoop-lenovo-namenode-Wilson.out
localhost: starting datanode, logging to /home/hadoop-1.2.1/libexec/../logs/hadoop-lenovo-datanode-Wilson.out
localhost: starting secondarynamenode, logging to /home/hadoop-1.2.1/libexec/../logs/hadoop-lenovo-secondarynamenode-Wilson.out
starting jobtracker, logging to /home/hadoop-1.2.1/libexec/../logs/hadoop-lenovo-jobtracker-Wilson.out
localhost: starting tasktracker, logging to /home/hadoop-1.2.1/libexec/../logs/hadoop-lenovo-tasktracker-Wilson.out
lenovo@Wilson /home/hadoop-1.2.1
$ jps
6540 JobTracker
9468 Jps
3092 NameNode
```
显示namenode,datanode,secondarynamenode,jobtracker,tasktracker启动成功，win7下cygwin中显示不全，但已启动。

## 安装配置eclipse
![](http://7u2eve.com1.z0.glb.clouddn.com/blogpic/20140826144826043.jpg)


run configuration配置，尤其注意输入输出路径的配置，因为是在集群上运行程序，文件代码都在dfs上，所以这里写的dfs上的路径，如果不确定怎么写，运行指令查看一下:
```bash
lenovo@Wilson /home/hadoop-1.2.1
$ bin/hadoop dfs -ls
Found 4 items
drwxr-xr-x   - cyg_server supergroup          0 2014-08-24 16:05 /user/cyg_server/home
drwxr-xr-x   - cyg_server supergroup          0 2014-08-24 16:30 /user/cyg_server/in
drwxr-xr-x   - cyg_server supergroup          0 2014-08-25 15:19 /user/cyg_server/input
drwxrwxrwx   - lenovo     supergroup          0 2014-08-25 16:20 /user/cyg_server/out
```
首字母为d代表其为文件夹，可以看到输入文件在目录/user/cyg_server/in下，所以在 run configuration里输入文件路径写为 hdfs://localhost:9000/user/cyg_server/in，输出则随意指定。
然后从hadoop示例中将Wordcount.java代码复制过来，运行run->run on hadoop，这时不出意外将会出现一些状况，下面介绍一下我碰到的状况：

 - namenode 安全模式异常
```bash
<span style="font-size: medium;">org.apache.hadoop.ipc.RemoteException: 
org.apache.hadoop.hdfs.server.namenode.SafeModeException: 
Cannot create file/usr/yujing/wordcount. Name node is in 
safe mode.
The ratio of reported blocks 0.0000 has not reached the 
threshold 0.9990. Safe mode will be turned off&nbsp;<span style="font-size:14px; font-family: Arial, Helvetica, sans-serif;">&nbsp;</span>
```

要解决这个问题，只需让Hadoop不处在safe mode 模式下即可，执行下面指令关闭安全模式
```
bin/hadoop dfsadmin -safemode leave
```

 - Permission denied权限不够

>error：org.apache.oozie.action.ActionExecutorException: JA002: org.apache.hadoop.security.AccessControlException: Permission denied: user=xxj, access=WRITE, inode="user":hadoop:supergroup:rwxr-xr-x


因为Eclipse使用hadoop插件提交作业时，会默认以 DrWho 身份去将作业写入hdfs文件系统中，对应的也就是 HDFS 上的/user/xxx , 我的为/user/hadoop ,   由于 DrWho 用户对hadoop目录并没有写入权限，所以导致异常的发生。他提供的解决方法为：放开 hadoop 目录的权限 ，cygwin中运行
```
$ bin/hadoop fs -chmod 777 /user/cyg_server
```

## 运行成功
```
libpath=/home/hadoop-1.2.1/lib/native/linux-i386-32
14/08/25 16:20:25 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
14/08/25 16:20:25 WARN mapred.JobClient: No job jar file set.  User classes may not be found. See JobConf(Class) or JobConf#setJar(String).
14/08/25 16:20:25 INFO input.FileInputFormat: Total input paths to process : 2
14/08/25 16:20:25 WARN snappy.LoadSnappy: Snappy native library not loaded
14/08/25 16:20:26 INFO mapred.JobClient: Running job: job_local1708565066_0001
14/08/25 16:20:26 INFO mapred.LocalJobRunner: Waiting for map tasks
14/08/25 16:20:26 INFO mapred.LocalJobRunner: Starting task: attempt_local1708565066_0001_m_000000_0
14/08/25 16:20:26 INFO mapred.Task:  Using ResourceCalculatorPlugin : null
14/08/25 16:20:26 INFO mapred.MapTask: Processing split: hdfs://localhost:9000/user/cyg_server/in/test2.txt:0+13
14/08/25 16:20:26 INFO mapred.MapTask: io.sort.mb = 100
14/08/25 16:20:26 INFO mapred.MapTask: data buffer = 79691776/99614720
14/08/25 16:20:26 INFO mapred.MapTask: record buffer = 262144/327680
14/08/25 16:20:26 INFO mapred.MapTask: Starting flush of map output
14/08/25 16:20:26 INFO mapred.MapTask: Finished spill 0
14/08/25 16:20:26 INFO mapred.Task: Task:attempt_local1708565066_0001_m_000000_0 is done. And is in the process of commiting
14/08/25 16:20:26 INFO mapred.LocalJobRunner: 
14/08/25 16:20:26 INFO mapred.Task: Task 'attempt_local1708565066_0001_m_000000_0' done.
14/08/25 16:20:26 INFO mapred.LocalJobRunner: Finishing task: attempt_local1708565066_0001_m_000000_0
14/08/25 16:20:26 INFO mapred.LocalJobRunner: Starting task: attempt_local1708565066_0001_m_000001_0
14/08/25 16:20:26 INFO mapred.Task:  Using ResourceCalculatorPlugin : null
14/08/25 16:20:26 INFO mapred.MapTask: Processing split: hdfs://localhost:9000/user/cyg_server/in/test1.txt:0+12
14/08/25 16:20:26 INFO mapred.MapTask: io.sort.mb = 100
14/08/25 16:20:26 INFO mapred.MapTask: data buffer = 79691776/99614720
14/08/25 16:20:26 INFO mapred.MapTask: record buffer = 262144/327680
14/08/25 16:20:26 INFO mapred.MapTask: Starting flush of map output
14/08/25 16:20:26 INFO mapred.MapTask: Finished spill 0
14/08/25 16:20:26 INFO mapred.Task: Task:attempt_local1708565066_0001_m_000001_0 is done. And is in the process of commiting
14/08/25 16:20:26 INFO mapred.LocalJobRunner: 
14/08/25 16:20:26 INFO mapred.Task: Task 'attempt_local1708565066_0001_m_000001_0' done.
14/08/25 16:20:26 INFO mapred.LocalJobRunner: Finishing task: attempt_local1708565066_0001_m_000001_0
14/08/25 16:20:26 INFO mapred.LocalJobRunner: Map task executor complete.
14/08/25 16:20:27 INFO mapred.JobClient:  map 100% reduce 0%
14/08/25 16:20:27 INFO mapred.Task:  Using ResourceCalculatorPlugin : null
14/08/25 16:20:27 INFO mapred.LocalJobRunner: 
14/08/25 16:20:27 INFO mapred.Merger: Merging 2 sorted segments
14/08/25 16:20:27 INFO mapred.Merger: Down to the last merge-pass, with 2 segments left of total size: 53 bytes
14/08/25 16:20:27 INFO mapred.LocalJobRunner: 
14/08/25 16:20:29 INFO mapred.Task: Task:attempt_local1708565066_0001_r_000000_0 is done. And is in the process of commiting
14/08/25 16:20:29 INFO mapred.LocalJobRunner: 
14/08/25 16:20:29 INFO mapred.Task: Task attempt_local1708565066_0001_r_000000_0 is allowed to commit now
14/08/25 16:20:29 INFO output.FileOutputCommitter: Saved output of task 'attempt_local1708565066_0001_r_000000_0' to hdfs://localhost:9000/user/cyg_server/out
14/08/25 16:20:29 INFO mapred.LocalJobRunner: reduce > reduce
14/08/25 16:20:29 INFO mapred.Task: Task 'attempt_local1708565066_0001_r_000000_0' done.
14/08/25 16:20:29 INFO mapred.JobClient:  map 100% reduce 100%
14/08/25 16:20:30 INFO mapred.JobClient: Job complete: job_local1708565066_0001
14/08/25 16:20:30 INFO mapred.JobClient: Counters: 19
14/08/25 16:20:30 INFO mapred.JobClient:   File Output Format Counters 
14/08/25 16:20:30 INFO mapred.JobClient:     Bytes Written=25
14/08/25 16:20:30 INFO mapred.JobClient:   FileSystemCounters
14/08/25 16:20:30 INFO mapred.JobClient:     FILE_BYTES_READ=1432
14/08/25 16:20:30 INFO mapred.JobClient:     HDFS_BYTES_READ=63
14/08/25 16:20:30 INFO mapred.JobClient:     FILE_BYTES_WRITTEN=206413
14/08/25 16:20:30 INFO mapred.JobClient:     HDFS_BYTES_WRITTEN=25
14/08/25 16:20:30 INFO mapred.JobClient:   File Input Format Counters 
14/08/25 16:20:30 INFO mapred.JobClient:     Bytes Read=25
14/08/25 16:20:30 INFO mapred.JobClient:   Map-Reduce Framework
14/08/25 16:20:30 INFO mapred.JobClient:     Reduce input groups=3
14/08/25 16:20:30 INFO mapred.JobClient:     Map output materialized bytes=61
14/08/25 16:20:30 INFO mapred.JobClient:     Combine output records=4
14/08/25 16:20:30 INFO mapred.JobClient:     Map input records=2
14/08/25 16:20:30 INFO mapred.JobClient:     Reduce shuffle bytes=0
14/08/25 16:20:30 INFO mapred.JobClient:     Reduce output records=3
14/08/25 16:20:30 INFO mapred.JobClient:     Spilled Records=8
14/08/25 16:20:30 INFO mapred.JobClient:     Map output bytes=41
14/08/25 16:20:30 INFO mapred.JobClient:     Total committed heap usage (bytes)=482291712
14/08/25 16:20:30 INFO mapred.JobClient:     Combine input records=4
14/08/25 16:20:30 INFO mapred.JobClient:     Map output records=4
14/08/25 16:20:30 INFO mapred.JobClient:     SPLIT_RAW_BYTES=230
14/08/25 16:20:30 INFO mapred.JobClient:     Reduce input records=4
```

怎么查看运行结果呢？
```
lenovo@Wilson /home/hadoop-1.2.1
$ bin/hadoop dfs -ls /user/cyg_server/*
drwxr-xr-x   - cyg_server supergroup          0 2014-08-24 16:05 /user/cyg_server/home/hadoop-1.2.1
-rw-r--r--   1 cyg_server supergroup         12 2014-08-24 16:30 /user/cyg_server/in/test1.txt
-rw-r--r--   1 cyg_server supergroup         13 2014-08-24 16:30 /user/cyg_server/in/test2.txt
-rw-r--r--   3 lenovo supergroup          0 2014-08-25 16:20 /user/cyg_server/out/_SUCCESS
-rw-r--r--   3 lenovo supergroup         25 2014-08-25 16:20 /user/cyg_server/out/part-r-00000
lenovo@Wilson /home/hadoop-1.2.1
$ bin/hadoop dfs -cat /user/cyg_server/out/*
hadoop  1
hello   2
world   1
```

ok,  done!
<br>

![](http://7u2eve.com1.z0.glb.clouddn.com/blogpic/E___0109GD00SIGT.gif)
<br>