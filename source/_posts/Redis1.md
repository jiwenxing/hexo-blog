title: Redis几种数据结构的基本操作
date: 2014-06-12 23:50:15
categories: Coding
tags: [Redis] 
---

Redis的命令总是很难记，每次用到都去网上查一下，最近得空整理一下，一方面加深印象，另一方面再用的时候也方便查阅。<!-- more --> 

*参考：*

 1. [Redis 命令参考-中文版](http://redisdoc.com/)
 2. [ Redis Command Reference](http://redis.io/commands)
 3. [Redis Documentation](http://redis.io/documentation)




### set的基本操作

[添加](#setadd)   [查询](#setsee)     [删除](#setdel)    [集合关系操作](#setrelation)

#### <span id = "setadd">添加数据</span>

> sadd key  value1 value2 value3...

    dev:0>sadd test:set:01 "hello"
    1     //1表示成功插入一条数据
    dev:0>sadd test:set:01 "redis"
    1
    dev:0>sadd test:set:01 "hello" "world"
    1     //这里我虽然一次插入两个value，但是返回1，因为"hello"已存在
    dev:0>smembers test:set:01   //查看该key下的value分布：smembers key（see members）
    "world"
    "redis"
    "hello"

#### <span id = "setsee">查询数据</span>

 - 获取set指定key的所有member

> smembers key   //abbr. of "see members"

    dev:0>smembers test:set:01
    "world"
    "redis"
    "hello"

 - 判断值是否是set的member。如果值是返回1，否则返回0

> sismember key member  //abbr. of "see is member"

    dev:0>sismember test:set:01 "hello"
    1
    dev:0>sismember test:set:01 "hi"
    0

 - 返回set的member个数，如果set不存在，返回0

> scard key

    dev:0>smembers test:set:01
    "hell"
    "world"
    "hello"
    "redis"
    "worl"
    dev:0>scard test:set:01
    5

 - 从set中返回一个随机member

> srandmember key  //abbr. of "see random member"，随机抽奖

    dev:0>srandmember test:set:01
    "world"

#### <span id = "setdel">删除数据</span>

 - 随机删除指定key的一个value

> spop key   //set pop

    dev:0>spop test:set:01
    "redis"
    dev:0>smembers test:set:01
    "world"
    "hello"
    "worl"
    "hell"

 - 删除指定key的指定value

> srem key member [member ...] 

    dev:0>srem test:set:01 "hell" 1
    dev:0>smembers test:set:01
    "world"
    "hello"
    "worl"

 - 将source key中的members移动到destination key中

> smove source_key destination_key member

    dev:0>smembers test:set:01
    "world"
    "hello"
    "worl"
    dev:0>smembers test:set:001
    "world"
    "redis"
    "hi"
    dev:0>smove test:set:01 test:set:001 "hello"
    1
    dev:0>smembers test:set:001
    "world"
    "hello"
    "redis"
    "hi"
    dev:0>smembers test:set:01
    "world"
    "worl"

#### <span id = "setrelation">集合关系操作</span>

 - 多个set的并集

> sunion key1 key2 key3...  //注意只是求并集，并没有将其存储

    dev:0>smembers set2
    "ache"
    "ello"
    "edis"
    "orld"
    dev:0>smembers set1
    "world"
    "cache"
    "redis"
    "hello"
    dev:0>sunion set1 set2
    "world"
    "cache"
    "redis"
    "hello"
    "orld"
    "edis"
    "ello"
    "ache"

 - 求并集并将结果存储到set

> sunionstore destination key [key ...]

    dev:0>smembers set1
    "world"
    "redis"
    dev:0>smembers set2
    "ache"
    "orld"
    dev:0>sunionstore all set1 set2
    4
    dev:0>smembers all
    "world"
    "ache"
    "redis"
    "orld"

 - 多个set求交集

> sinter key[key...]  
> sinterstore destination key [key ...] 

    dev:0>smembers set1
    "world"
    "redis"
    dev:0>smembers set2
    "redis"
    "ache"
    dev:0>sinter set1 set2
    "redis"

 - set中在其他set中不存在member

>  sdiff key[key ...]  
>  sdiffstore destination key[key...]

    dev:0>smembers set1
    "world"
    "redis"
    dev:0>smembers set2
    "redis"
    "ache"
    dev:0>sdiff set1 set2
    "world"

### sorted set的基本操作

[添加](#zsetadd)   [查询](#zsetsee)   [更新](#zsetupdate)    [删除](#zsetdel)    [集合关系操作](#setrelation)

#### <span id = "zsetadd">添加/查询数据</span>

> zadd key score member [[score member] [score member] ...]

    local:0>zadd zset:set1 111 redis  
    local:0>zadd zset:set1 110 hello
    local:0>zrange zset:set1 0 -1  
    hello  
    redis


#### <span id = "zsetsee">查询数据</span>

> 语法：zrange key start stop [withscores]
> 解释：返回有序集key中指定范围[通过索引 start stop]的member[及其score]；

    local:0>zrange zset:set1 0 -1  
    hello  
    redis
    local:0>zrange zset:set1 0 -1 withscores 
	hello   
	110
	redis
	111
**注意：**返回数据自动按照score排序，start参数0表示第一个元素开始；stop参数-1表示至最后一个元素，-2表示至倒数第二个元素

>语法： zcount key min max 
>解释：统计key中score值介于min 和max之间的member个数

    local:0>zrange zset:set1 0 -1 withscores
    hello
    110
    redis
    111
    local:0>zcount zset:set1 0 200
    2
    local:0>zcount zset:set1 0 110
    1

> 语法：zscore key member 
> 解释：返回有续集key中member的score
	
	local:0>zscore zset:set1 hello
	110
> 
> 
> 语法：zrevrange key start stop [withscores]
> 解释：根据score按降序排列返回有续集key中指定范围[通过索引start stop]的member[及score]

    local:0>zrevrange zset:set1 0 -1 withscores
    redis
    111
    hello
    110

> 语法：zrangebyscore key min max [withscores] [limit offset count]
> 解释：返回有续集key中，score大于等于min并且小于等于max的member。返回结果按照score递增的次序排列。可选参数limit
> 指定返回结果的数量区间。

    local:0>zrange zset:set1 0 -1 withscores
    world
    50
    hello
    110
    redis
    111
    local:0>zrangebyscore zset:set1 0 200 limit 0 2
    world
    hello

**注意：** zrevrangebyscore参数同理返回倒序排列的指定数据

> 语法：zrevrank key member 
> 解释：根据score从高到低排序，返回member在有序集key中的index

    local:0>zrange zset:set1 0 -1
    world
    hello
    redis
    local:0>zrank zset:set1 redis
    2

> 语法：zcard key 
> 解释：返回有续集key的基数

local:0>zcard zset:set1
3

#### <span id = "zsetupdate">更新数据</span>

> 语法：zincrby key increment member
> 解释：有续集key的member增加增量increment，返回增加后的score

    local:0>zscore zset:set1 redis
    111
    local:0>zincrby zset:set1 500 redis
    611
    local:0>zscore zset:set1 redis
    611

#### <span id = "zsetdel">更新数据</span>

> 语法：zrem key member [member ...] 
> 解释：移除有续集中的一个或多个member，返回移除member的个数

    local:0>zrem zset:set1 world
    1
    local:0>zrange zset:set1 0 -1
    hello
    redis


> 语法：zremrangebyrank key start stop 
> 解释：移除有续集中指定排名范围[start stop]的元素，返回移除元素个数

    redis 127.0.0.1:6379> zrange score 0 -1
    1) "zhangsan"
    2) "lisi"
    3) "wangwu"
    4) "liuli"
    redis 127.0.0.1:6379> zremrangebyrank score 0 1
    (integer) 2
    redis 127.0.0.1:6379> zrange score 0 -1
    1) "wangwu"
    2) "liuli"

> 语法：zremrangebyscore key min max
> 解释：移除有续集中的member，移除member的score大于等于min小于等于max；返回移除元素个数

    redis 127.0.0.1:6379> zrange score 0 -1 withscores
    1) "wangwu"
    2) "249"
    3) "liuli"
    4) "400"
    redis 127.0.0.1:6379> zremrangebyscore score 248 250
    (integer) 1
    redis 127.0.0.1:6379> zrange score 0 -1 withscores
    1) "liuli"
    2) "400"

<br>
String、Hash以及List未完待续。。。