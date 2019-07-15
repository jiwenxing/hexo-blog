[阿里云官网](https://help.aliyun.com/document_detail/50452.html?spm=5176.8465980.home.dtool_util.4e7014509o2VOl)下载 ossutilmac64

执行`chmod 755 ossutilmac64` 增加可执行权限


AccessKeyID：
LTAIpzF7dXUDOzVn
AccessKeySecret：
Ofszo0o7RLizcMZxgWcNeBwLorCedt

[访问控制ram管理控制台](https://ram.console.aliyun.com/)创建用户，并添加授权，这时会生成对应的授权信息

./ossutil config -e oss.aliyuncs.com(end_point) -i your_id -k your_key

./ossutil config -e oss-cn-beijing.aliyuncs.com -i LTAIpzF7dXUDOzVn -k Ofszo0o7RLizcMZxgWcNeBwLorCedt

mv ossutil /usr/local/bin 将其移动到这个目录（这个目录在环境变量中，执行命令时可以直接输ossutil，而不用加./）

上传文件
./ossutil cp testData.json oss://jverson

![](https://jverson.oss-cn-beijing.aliyuncs.com/16e88238244502f585c4f6c0e9719d29.jpg)


