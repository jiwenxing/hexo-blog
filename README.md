# Introduction
该仓库是对自己博客源码（即未生成html之前的文件）的备份，主题为[maupassant](https://github.com/tufu9441/maupassant-hexo)，但做了一些个性化的改动，比如添加了头像以及相册等功能。如果你也喜欢可以按照以下步骤使用该主题。

# Instructions

#### fork该仓库  

点击右上角的fork将该仓库fork至你的github，以后你便可用fork的仓库作为自己博客的备份，在任何地方使用任何电脑只需将该仓库clone至本地便可以写文章发文章了
   
#### 克隆fork后的仓库至电脑 

```git
git clone https://github.com/yourname/blogbackup.git  myblog   
```

#### 进入该文件夹安装modules 

使用以下命令安装`package.json`中所有必需的模块。     
```git
npm install
```

#### 本地预览    

使用以下指令首先生成整个静态站点，然后启动nodejs的server本地即可访问预览。          
```git
hexo generate
hexo server
```
启动成功后访问`localhost:4000`访问预览，不出意外你看到全是我的文章，将`\source\_posts`下的文章全部删除，这时候便可以写自己的文章了

#### 部署至github pages

如果本地预览无误，这时候便可以部署到github上去了，首先需要配置一下你的github仓库信息，将根目录下`_config.yml`如下的配置都改成自己的github仓库地址
```yml
deploy:
  type: git
  repository: https://github.com/jiwenxing/jiwenxing.github.io.git
  branch: master
backup:
    type: git
    theme: maupassant
    repository:
       github: git@github.com:jiwenxing/blogbackup.git,master
```
最后执行以下指令即可部署成功，访问`https://yourname.github.io`便可以看到你的博客了
```
hexo d -g
```

#### 备份博客源码

备份博客源码可以让你随时随地写文章发文章，即使换了电脑也很方便的clone下来即可。例如在公司编辑一篇文档，下班了还没弄完，便可以使用以下命令将文档上传备份下来，回到家后pull以下接着写非常方便。

```git
hexo backup     
git push origin master
```

#### 相册信息配置
主题里集成了instagram相册，更改相册相册配置信息请参考[Maupassant主题添加Instagram相册](http://jverson.com/2015/12/29/instagram/)


# Reference 
1. https://github.com/coneycode/hexo-git-backup
2. https://github.com/tufu9441/maupassant-hexo
