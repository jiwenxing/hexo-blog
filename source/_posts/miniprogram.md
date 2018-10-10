title: 上手微信小程序开发
categories: Coding
tags: []
toc: true
date: 2018-08-10 12:21:36
---


伴随小程序和小游戏越来越火，其开发技能也逐渐变得重要起来，最近接手了一个小程序项目，对小程序有了比较深入的了解，其开发也没有想象的那么神秘，这里通过一个基于 Wepy 框架的小程序 Demo 介绍从零上手开发一个小程序的过程。
<!-- more -->


## 小程序 & 服务号 & 订阅号

我们在微信公众平台上注册账号的时候会看到有以下四个选项：服务号、订阅号、企业微信以及小程序（统称为公众号），上面简要的对其进行了描述，如果你看完以后还是一头雾水，还是不确定该选择哪一种形式的应用，可以参考[官网的详细说明](http://kf.qq.com/faq/170815aUZjeQ170815mU7bI7.html)。

![](http://
pgdgu8c3d.bkt.clouddn.com/201808221632_638.png)

总的来说，订阅号注重分享内容（每天可以发一条消息，展示在订阅号文件夹中），适用于个人及自媒体等；服务号注重服务并借助 H5 能够实现简单的交互，功能较订阅号更多，例如可以使用微信支付（每个月能发4条消息，会展示在好友对话列表里），适用于公司或组织；而小程序主要面向产品和服务，可理解为不用安装的 APP，具有接近原生 APP 的体验，适用于有较为复杂的服务和业务的公司或组织。



## 小程序 vs H5

小程序也是使用前端的一些技术 js、wxss(css)、wxml(html) 开发，那为什么小程序相较于 H5 会有几乎接近原生 APP 的使用体验呢，他们之间有什么本质的区别？

小程序是微信内的云端应用(所以无需安装)，不是原生 App，通过 WebSocket 双向通信(保证无需刷新即时通信)、本地缓存(图片与UI 本地缓存降低与服务器交互延时)以及微信底层技术优化实现了接近原生APP 的体验。

传统 H5 运行环境是浏览器，微信小程序运行环境并非完整的浏览器，虽然开发过程中用到了 H5 相关的技术，但微信小程序的运行环境是微信基于浏览器内核完全重构的一个内置解析器，针对小程序专门做了优化，配合自己定义的开发语言标准(基于 H5 进行了优化)，提升了小程序的性能。小程序会对 UI 与图片进行本地缓存，只需要对服务器请求交互数据，页面切换无需刷新和重新渲染，所以体验能够接近原生 APP 的流畅程度。

另外在系统权限方面，微信小程序能够通过微信 APP 获得更多的系统权限，比如网络通信状态、数据缓存能力等，在此微信 APP 相当于架在原有系统中的新的操作系统，小程序借助微信与系统间接交互，使得能够拥有原生 APP 的体验。而这一点恰巧是 HTML5 web 应用的不足，导致其主要用于业务逻辑与交互简单的应用中。



## 小程序的开发

### 申请账号

首先到[微信公众平台](https://mp.weixin.qq.com)申请一个小程序开发者账号，需要邮箱、手机号、身份证信息等。注册成功后登陆，可以看到

![](http://
pgdgu8c3d.bkt.clouddn.com/201808221627_842.png)

此时需要先补充小程序信息，指的注意的是小程序信息填写了以后不可更改，如果类目选择了小游戏，想使用该 AppId 再开发普通小程序就不行了，需要重新申请账号。
补充完小程序信息会发现创建者已经被自动加入到开发者列表中，另外在开发设置中也可以看到 AppID(小程序ID)了，可以使用该 ID 进行开发。


### 开发工具 & 环境搭建

开发小程序涉及到的工具及框架如下：

- **[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html)**，主要用来在开发过程中实时预览效果
- **[npm](https://www.npmjs.com/)**，管理依赖，直接安装 [node](https://nodejs.org/en/) 即可
- **[Wepy 小程序组件化开发框架](https://tencent.github.io/wepy/index.html)**，微信官网推出的类似于 Vue.js 的组件化开发框架，提高开发效率

开发者工具直接下载安装，npm 及 Wepy 通过命令行即可安装，这里以 OSX 系统为例

```bash
brew install node  // 安装 node，自带 npm
npm install wepy-cli -g  // 全局安装或更新 WePY 命令行工具
wepy init standard wepy-demo // 初始化一个 Wepy 项目，这里会用到前面申请的 AppID
npm install   // 安装依赖 
npm run dev   //开启实时编译，或者直接执行 wepy build --watch
```

此时打开微信开发者工具，导入项目即可在本地实时预览小程序如下所示。

![](http://
pgdgu8c3d.bkt.clouddn.com/201808221751_748.png)


### 原生小程序

一个原生的小程序包含一个描述整体程序的 app 和多个描述各自页面的 page。其中主体部分由三个文件组成，必须放在项目的根目录，而一个小程序页面由四个文件组成，如下所示：

```
.
├── README.md
├── app.js      // 主体逻辑
├── app.json    // 公共配置
├── app.wxss    // 公共样式表
├── pages       // 小程序页面
│   ├── index   // 页面一
│   │   ├── index.js     // 页面逻辑
│   │   ├── index.json   // 页面配置
│   │   ├── index.wxml   // 页面结构
│   │   └── index.wxss   // 页面样式表
│   └── logs    // 页面二
│       ├── logs.js
│       ├── logs.json
│       ├── logs.wxml
│       └── logs.wxss
├── project.config.json  // 开发工具配置
└── utils       // 工具类
    └── util.js
```

小程序开发框架提供了自己的视图层描述语言 WXML 和 WXSS，以及基于 JavaScript 的逻辑层框架，并在视图层与逻辑层间提供了数据传输和事件系统，能够让开发者能够专注于数据与逻辑。关于原生小程序开发见 [miniprogram-demo](https://github.com/jiwenxing/miniprogram-demo)

### Wepy 开发框架

如果要从零开发一个小程序，对于当前大多数习惯于 mvvm 架构模式（Angular、React、Vue）的开发者而言，这样的开发框架仍然有一定的学习成本，好在微信官方推出了一个类似于 vue.js 的支持组件化的小程序开发框架 WePY。

WePY 参考了 Vue 等现有框架的一些语法风格和功能特性，对原生小程序的开发模式进行了再次封装，更贴近于 MVVM 架构模式，更方便前端开发者上手。从下面 WePY 的目录结构可以看到在 WePY 中则使用了单文件模式，目录结构更清晰，开发更方便。更详细的 WePY 介绍请参考[WePY 官方文档](https://tencent.github.io/wepy/index.html)

```
├── dist                   小程序运行代码目录（该目录由WePY的build指令自动编译生成，请不要直接修改该目录下的文件）
├── node_modules           
├── src                    代码编写的目录（该目录为使用WePY后的开发目录）
|   ├── components         WePY组件目录（组件不属于完整页面，仅供完整页面或其他组件引用）
|   |   ├── com_a.wpy      可复用的WePY组件a
|   |   └── com_b.wpy      可复用的WePY组件b
|   ├── pages              WePY页面目录（属于完整页面）
|   |   ├── index.wpy      index页面（经build后，会在dist目录下的pages目录生成index.js、index.json、index.wxml和index.wxss文件）
|   |   └── other.wpy      other页面（经build后，会在dist目录下的pages目录生成other.js、other.json、other.wxml和other.wxss文件）
|   └── app.wpy            小程序配置项（全局数据、样式、声明钩子等；经build后，会在dist目录下生成app.js、app.json和app.wxss文件）
└── package.json           项目的package配置
```


### 总结

如果你不是专业的前端开发者想要自己做一个简单的小程序出来其实并没有想象的那么难，只需要稍微有些 HTML、CSS、JS 的基础，了解 mvvm 的思想，然后大概看一遍 Vue.js 以及 小程序的文档基本就可以上手了，微信对很多组件都做了封装（swiper scroll navigation etc.），也提供了丰富的 api 和详细的文档，调试工具用起来也很顺手，最重要的是开始去实践。


最后打个广告，可以扫下面二维码来体验一下我们的小程序

![](http://
pgdgu8c3d.bkt.clouddn.com/da354829ab89de3f5324abecffcaa120.jpg)




## 参考

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html)
- [小程序开发框架](https://developers.weixin.qq.com/miniprogram/dev/framework/MINA.html)
- [微信公众平台](https://mp.weixin.qq.com/?url=%2Fwxopen%2Fcategory%3Faction%3Dget%26token%3D1820933982%26lang%3Dzh_CN)
- [公众平台服务号、订阅号、企业微信、小程序的相关说明](http://kf.qq.com/faq/170815aUZjeQ170815mU7bI7.html)