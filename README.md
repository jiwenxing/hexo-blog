# Introduction
该仓库是对自己博客源码的备份，主题为[maupassant](https://github.com/tufu9441/maupassant-hexo)，但做了一些个性化的改动，比如添加了头像以及相册等功能。如果你也喜欢可以按照以下步骤使用。

# Instructions
## fork该仓库  

将该仓库fork至你的github，便可用该仓库作为自己博客的备份，以后再任何地方使用任何电脑只需将该仓库clone至本地便可以写文章发文章了
   
## 克隆fork后的仓库至电脑 

```git
git clone https://github.com/jiwenxing/blogbackup.git  myblog   
```

## 进入该文件夹安装hexo, jade and sass等modules 

```git
npm install
```

## 本地预览    

```git
hexo g
hexo s
```
这时候便可以访问`localhost:4000`访问预览了，不出意外你看到全是我的文章，将`\source\_posts`下的文章全部删除，这时候便可以写自己的文章了

## 部署至github pages

如果本地预览无误，这时候便可以部署到github上去了，首先需要配置一下你的github仓库信息，将根目录下`_config.yml`如下的配置都改成自己的github仓库地址
```yml
deploy:
  type: git
  repository: https://github.com/jiwenxing/jiwenxing.github.io.git
  branch: master
#backup
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

## 备份博客源码

备份博客源码可以让你随时随地写文章发文章，即使换了电脑也很方便的clone下来即可。每次在公司编辑文章后使用以下指令便可以将markdown的源文章备份下来，回到家后pull以下接着写非常方便。

```git
hexo backup     
git push origin master
```

# Reference 
1. https://github.com/coneycode/hexo-git-backup
2. https://github.com/tufu9441/maupassant-hexo
