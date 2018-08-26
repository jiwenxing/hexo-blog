title: Using Gitbook + Github gh-pages to Note
categories: Coding
tags: [Tools]
toc: true
date: 2018-08-26 10:04:09
---

有效的学习笔记不但可以加深思考和理解，同时还可以充分利用`艾宾浩斯记忆规律`让学习效率大大提升。写笔记或者博客是一种很好的方式，但如果是对某一个知识体系进行系统学习，这时候就需要我们能够有序的、美观的将笔记进行系统整理，便于形成知识体系同时还方便查阅，Gitbook 就是这样一个神器，能够让你像写书一样记录笔记，便捷、高效、美观，最重要的是免费、可绑定域名而且扩展性强。

<!-- more -->

## Blog vs Wiki vs Gitbook 

对于某一知识体系的学习，最初我是通过 n 篇 Blog 并通过 category 或者 tag 将其归类，慢慢的发现这样其实不太便于查阅，并且只能以时间为序。后来通过 Github 的 Wiki 解决了这个问题，Github Wiki 可以自动生成 sidebar，但是慢慢的又觉得其入口太深、样式单一，又是单独的 repository 管理也不便等等。直到我开始了解到 Gitbook，才发现 Gitbook 搭配 Github gh-pages 简直就是个完美的解决方案。

可以通过我之前不同形式的笔记来感受一下这几种笔记的区别

- [blog category 归类](https://jverson.com/categories/Network/)
- [Github Wiki](https://github.com/jiwenxing/spring-boot-demo/wiki)
- [Gitbook](https://jverson.com/spring-boot-demo/)

## Gitbook & Github gh-pages

和 Hexo 一样，GitBook 也是一个基于 Node.js 的命令行工具，只不过 Hexo 是帮你生成 Blog，而 Gitbook 则借助 Github/Git 和 Markdown 生成精美的电子书（也可以是 pdf 或者 eBook 格式）。

gh-pages 其实就是 Github 的 Project Page，Github 中创建项目仓库后随即只产生一个 master 分支，只需要再添加 gh-pages 分支就可以创建一个静态页面，通过 `user-name.github.io/repository-name` 即可访问，同时还可以绑定自己的域名。

结合 Gitbook 和 gh-pages 的这些特点，我们便可以只在一个 repository 中做 code practice 和 Gitbook 托管。下面详细介绍使用方法，注意这里以 OSX 为例。


## Using Gitbook

首先全局安装 gitbook 命令行工具。我准备在 repository 的 docs 目录下维护 Gitbook 相关文件。因此首先在创建好的 Github repository 根目录创建 docs 文件夹，并将 docs 目录初始化为 Gitbook 书籍目录

```bash
$ npm install gitbook-cli -g
$ mkdir docs
$ cd docs
$ gitbook init
$ tree
.
├── README.md
└── SUMMARY.md

0 directories, 2 files

$ gitbook serve
Live reload server started on port: 35729
Press CTRL+C to quit ...

info: 7 plugins are installed
info: loading plugin "livereload"... OK
info: loading plugin "highlight"... OK
info: loading plugin "search"... OK
info: loading plugin "lunr"... OK
info: loading plugin "sharing"... OK
info: loading plugin "fontsettings"... OK
info: loading plugin "theme-default"... OK
info: found 1 pages
info: found 0 asset files
info: >> generation finished with success in 0.6s !

Starting server ...
Serving book on http://localhost:4000
```

这时会发现 docs 目录下多出了 README.md 和 SUMMARY.md 两个 Gitbook 必须文件，其中 README.md 是对书籍的简单介绍，而 SUMMARY.md 则定义了书籍的目录结构。最后可以启动服务进行本地实时预览。gitbook serve 命令实际上会首先调用 gitbook build 编译书籍，完成以后会打开一个 web 服务器，监听在本地的 4000 端口，在浏览器打开 `http://127.0.0.1:4000` 可以看到

![](http://ochyazsr6.bkt.clouddn.com/d0fb8016c0c9475c9e9d0bb221474863.jpg)

## Deploy Gitbook

Gitbook 可以直接托管到 `gitbook.com`，但是鉴于国内访问速度堪忧，因此接下来会将其托管到 Github gh-pages。实现方法也很简单，将 docs 目录下的 md 文件 进行 build，将构建好的文件（放在 gh-pages 目录）推送到远程 gh-pages 分支即可。这些操作我们通过 nodejs 来实现，执行 `$ npm init` 将 repository 初始化为一个 nodejs 项目，修改 `package.json` 为以下内容


```json
{
  "name": "thinking-in-java",
  "version": "1.0.0",
  "description": "thinking in java",
  "main": "index.js",
  "directories": {
    "doc": "docs"
  },
  "scripts": {
    "dev": "gitbook serve ./docs ./gh-pages && npm run favicon",
    "build": "gitbook build ./docs ./gh-pages && npm run favicon",
    "deploy": "node ./scripts/deploy-gh-pages.js",
    "publish": "npm run build && npm run deploy",
    "favicon": "rm -rf ./gh-pages/gitbook/images/favicon.ico && cp ./docs/favicon.ico ./gh-pages/gitbook/images/favicon.ico",
    "port": "lsof -i :35729"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jiwenxing/thinking-in-java.git"
  },
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/jiwenxing/thinking-in-java/issues"
  },
  "homepage": "https://github.com/jiwenxing/thinking-in-java#readme",
  "dependencies": {
    "gh-pages": "^1.2.0",
    "gitbook-plugin-todo": "^0.1.3"
  }
}
```

注意 `scripts` 中的内容

- `npm run dev` 将 docs 目录下 md 文件构建到到 gh-pages 目录下，同时启动 web 服务并实时监控文件变化，适用于在书写的时候本地预览

- `npm run build` 将 docs 目录下 md 文件构建到到 gh-pages 目录下

- `npm run deploy` 执行一段脚本，利用插件 gh-pages 将 gh-pages 目录下构建好的文件 deploy 到远程仓库的 gh-pages 分支，需要提前执行 `npm i --save gh-pages` 安装插件，在 repository 根目录下创建 `scripts` 文件夹，文件夹中创建 `deploy-gh-pages.js` 文件，内容如下    
```js
'use strict';

var ghpages = require('gh-pages');

main();

function main() {
    ghpages.publish('./gh-pages', console.error.bind(console));
}
```

- `npm run publish` 将 build 和 deploy 两步合并为一步

- `npm run favicon` 主要用来替换默认的 favicon，因为试了一些设置 favicon 的插件都用不了，采用这种简单粗暴的方法也很管用，需要提前将 favicon 放在 docs 目录下

以上配置都完成后执行 `npm run publish` 即可生成书籍并推送到远程仓库，这时访问 `https://github.com/user-name/project-name` 既能看到发布的书籍，如果你之前已经在 Github 中绑定过自己的域名，则直接访问 `http://yourDomain/peoject-name` 也可访问。

![](http://ochyazsr6.bkt.clouddn.com/31d46c934bc9e1c720583d4779645617.jpg)


另外记得编辑 `.gitignore` 添加以下内容忽略一些不需要备份的文件

> node_modules
gh-pages
npm-debug.log

## Gitbook plugins

通过上面的内容基本需求都已经实现了，如果还是觉得效果比较单调或者想实现一些个性化的东西，Gitbook 提供丰富的插件来做这些事情，可以通过在 docs 目录下创建一个 `book.json` 来配置插件。

```json
{
    "author": "Jverson <i@jverson.com>",
    "description": "Thinking in Java",
    "extension": null,
    "generator": "site",
    "isbn": "",
    "links": {
        "sidebar": {
            "Jverson's Blog": "https://jverson.com"
        }
    },
    "output": null,
    "plugins": [
       "github",  // 右上角添加 Github 图片和链接
       "github-buttons", // 可以在顶部添加 Github star fork 等图标
       "disqus", // 集成 disqus 评论
       "todo", // 支持 CheckBox 的 markdown 语法，默认不支持
       "splitter", // 实现左右拖拽
       "tbfed-pagefooter", // 添加 page footer
       "page-toc-button", // 添加文章目录按钮
       "-sharing" // 屏蔽自带 sharing 插件
    ],
    "title": "Thinking in Java",
    "variables": {},
    "pluginsConfig": {
        "theme-default": {
            "showLevel": true
        },
        "github": {
            "url": "https://github.com/jiwenxing/thinking-in-java"
        },
        "github-buttons": {
            "buttons": [{
                "user": "jiwenxing",
                "repo": "thinking-in-java",
                "type": "star",
                "size": "small",
                "count": true
              }]
        },
        "disqus": {
            "shortName": "jverson"
        },
        "tbfed-pagefooter": {
            "copyright": "Copyright © jverson.com 2018",
            "modify_label": "",
            "modify_format": "YYYY-MM-DD HH:mm:ss"
        },
        "page-toc-button": {
            "maxTocDepth": 2,
            "minTocSize": 2
        }
    }
}
```

注意新增插件后需要在 docs 目录下执行 `gitbook install` 先安装插件，更多的插件使用可以参考 [Gitbook Plugins Search and Explore](https://plugins.gitbook.com/)。

## References

1. [Gitbook Documentation](https://docs.gitbook.com/)
2. [如何使用 Gitbook 来做笔记？](http://haoduoshipin.com/videos/231/)
3. [Gitbook 使用笔记](https://gitbook.zhangjikai.com/)



