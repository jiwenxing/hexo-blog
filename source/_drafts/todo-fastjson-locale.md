
## fastjson 泛型反序列化
https://github.com/alibaba/fastjson/wiki/JSON_API_cn
Type type = new TypeReference<ResultVo<PageVo<EsCommentVo>>>(){}.getType();
ResultVo<PageVo<EsCommentVo>> resultVo = JSONObject.parseObject(resultJson, type);


## 国际化

org/springframework/spring-webmvc/5.0.6.RELEASE/spring-webmvc-5.0.6.RELEASE.jar!/org/springframework/web/servlet/view/freemarker/spring.ftl

在页面head标签中引入 <#import "/spring.ftl" as spring>

ftl中使用 <@spring.message "index.title"/>

properties 中 spring.messages.basename=i18n/messages

创建 i18n 文件夹 messages_en_US.properties， messages_zh_CN.properties， messages.properties

LocaleConf.java 

https://www.cnblogs.com/tibit/p/9869389.html