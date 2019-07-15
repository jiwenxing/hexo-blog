title: Nginx 配置自签名证书支持 https
categories: Coding
tags: [Https]
toc: true
date: 2017-03-02 20:25:43
---

当前HTTPS正在迅速普及，为了保证用户信息安全以及网站不被运营商等劫持，百度京东等很多网站已经全站切换https。由于系统上线前需要先在测试及预发布环境进行测试，而部门的静态资源测试机不支持https请求，给测试工作造成一定的不便，因此决定给nginx配置一个自签名证书。

## https原理介绍

首先简单了解一下https的工作原理，https即安全版的http，在应用层http和传输层之间添加了一层ssl/tsl层，主要用于web浏览器和服务器之间的身份认证和加密数据传输。

![](//
jverson.oss-cn-beijing.aliyuncs.com/2012072310244445.png)

1. 客户端发起https请求，值得注意的是https使用443端口，而http使用的则是80端口
2. 支持https协议的服务器需要配置ssl证书，ssl证书类似于驾驶证、护照之类的证件，由受信任的数字证书颁发机构CA，在验证服务器身份后颁发。当然如果是搭建测试环境，可以自己制作证书，只是访问的时候需要客户端验证。一份ssl证书包含一个私钥和一个公钥。
3. 服务端收到请求（需要开启443端口监听），会将数字证书（`*.crt文件`）传回给客户端，这个数字证书不但包含了用于非对称加密的公钥，还包含公钥算法、证书的颁发机构及过期时间等信息。
4. 客户端接收到数字证书后，解析验证服务器的合法性，主要包括：证书是否过期，发行服务器证书的CA 是否可靠，发行者证书的公钥能否正确解开服务器证书的“发行者的数字签名”，服务器证书上的域名是否和服务器的实际域名相匹配。如果校验没有问题，客户端将随机产生一个用于后面通讯的“对称密码”，然后用服务器的公钥（服务器的公钥从步骤三中的服务器的证书中获得）对其加密，然后将加密后的“预主密码”传给服务器。当然如果验证没通过，则会弹出提示告知用户。
5. 客户端将使用服务器公钥加密后的随机值传回给服务端。该随机值将用于后续的对称加密通信。
6. 服务端用自己的私钥（`*.key文件`）将该随机值进行解密，然后将需要返回给客户端的内容使用该随机值（密钥）进行对称加密。
7. 将加密后的内容返回给客户端。
8. 客户端使用之前生成的随机值（对称加密私钥）对内容进行解密。

## 创建自签名证书

### 安装openssl
创建自签名证书需要安装openssl，OpenSSL是一个密码库，包含主要的加密算法、ssl协议及证书封装功能等，安装步骤如下：
1. [openssl官网](https://www.openssl.org/source/)下载最新版本
2. 上传至服务器某个目录（进入该目录执行`rz`上传），例如`/usr/local/openssl`
3. 解压文件，执行`tar -zxvf openssl-1.0.2k.tar.gz`，然后进入到openssl-1.0.2k目录
4. 进行配置、编译、安装，一次执行一下命令
```bash
# ./configure  //配置
# make         //编译
# make install //安装
```

### 生成证书
生成证书的命令较为繁琐，不过网上有人公开的脚本可以自动生成证书，[点击](https://github.com/michaelliao/itranswarp.js/blob/master/conf/ssl/gencert.sh)将该脚本保存为`gencert.sh`文件上传至服务器。
在该目录下执行`./gencert.sh`,这时可能会告知没有权限，执行`chmod 777 gencert.sh`，然后再次执行`./gencert.sh`，根据提示填入域名及几次密码信息即可，多次输入的密码保持一致，貌似后面也没有用到这个密码。
执行完以后会生成以下4个文件：
>static.360buyimg.com.crt：自签名的证书
 static.360buyimg.com.csr：证书的请求
 static.360buyimg.com.key：不带口令的Key
 static.360buyimg.com.origin.key：带口令的Key

Web服务器会把`static.360buyimg.com.crt`（公钥证书）发给浏览器验证，然后用`static.360buyimg.com.key`（私钥）解密浏览器发送的数据，剩下两个文件后续没有用到。

## 配置Nginx
支持https访问需要在Nginx配置中监听443端口并配置证书路径，完成配置如下所示：
```
server {
        listen       443 ssl;
        server_name  localhost static.360buyimg.com;
        ssl_certificate      /export/servers/nginx/ssl/static.360buyimg.com.crt;
        ssl_certificate_key  /export/servers/nginx/ssl/static.360buyimg.com.key;
        ssl_session_timeout  5m;
        ssl_protocols        SSLv3 TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers          EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
        ssl_prefer_server_ciphers  on;
        error_log           /export/servers/nginx/logs/ssl_error.log;
        access_log          /export/servers/nginx/logs/ssl_access.log;
        location / {
            root /var/www/html/static.360buyimg.com;
            index  index.html index.htm;
        }
    }
```
然后重启Nginx：
```bash
# ps -ef|grep nginx   //查看Nginx进程
# kill -QUIT 2072  //杀死主进程，注意这里填主进程的进程号
# /export/servers/nginx/sbin/nginx -c /export/servers/nginx/conf/nginx.conf  //重启Nginx
```

这个时候你可能会看到如下的报错信息，这是因为nginx缺少http_ssl_module模块，需要在编译安装的时候带上`--with-http_ssl_module`参数，具体的操作方法详见[参考文档三](//unun.in/linux/173.html).
>the "ssl" parameter requires ngx_http_ssl_module in ...

## https访问
以上配置都完成以后，不出意外已经可以使用https访问资源了，但是第一次访问还是会弹出警告。可以提前将证书（生成的crt文件）导入到浏览器或者系统，这样即使第一次访问也不会警告了，注意chrome（chrome://settings/ ——>高级）、IE和系统（win+r——>certmgr.msc）使用的是同一套证书，Firefox（工具——>选项——>高级——>证书）则是独立的证书管理，另外mac系统直接双击证书文件导入到系统即可。

## 参考资料
-  [图解HTTPS](//www.cnblogs.com/zhuqil/archive/2012/07/23/2604572.html) 
-  [给Nginx配置一个自签名的SSL证书](//www.liaoxuefeng.com/article/0014189023237367e8d42829de24b6eaf893ca47df4fb5e000)
-  [已经编译安装好的nginx，添加未被编译的模块](//unun.in/linux/173.html)
-  [Nginx的启动、停止与重启](//www.cnblogs.com/codingcloud/p/5095066.html)