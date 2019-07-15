title: Git学习笔记
date: 2015-07-15 23:21:42
categories: Coding
tags: [GitHub,Git]
toc: true
---

虽然很早就接触github，但对git的版本控制并不了解，最近开始学习使用git，对其使用简单做一些整理。<!-- more -->

## git 介绍
`Git`是一个开源的分布式版本控制系统，用以有效、高速的处理从很小到非常大的项目版本管理。关于她的特点[`Git`官网](//www.git-scm.com/)是这么介绍的：   

> Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.  

![](https://github.com/jiwenxing/learngit/blob/master/aboutgit.png?raw=true)

总之，对于开源项目来说，使用Git可以极大地提高了开发效率、扩大了开源项目的参与度、 增强了版本控制系统的安全性，选择Git已是大势所趋。

以下为本人学习`git`过程中的一些练习和笔记，相关参考：[廖雪峰的Git教程](//www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000)

## git 本地仓库常用操作

### git 创建本地仓库
    $ mkdir learngit  //创建文件夹  
    $ cd learngit  
    $ pwd   //查看当前目录  
    /Users/michael/learngit
    
    $ git init //将当前文件夹变成git仓库，init后目录下会多出.git文件（默认隐藏） 可以用ls -ah查看  
    Initialized empty Git repository in /Users/michael/learngit/.git/
    
    $ git log //显示从最近到最远的提交日志 如果出现end标记可以按q退出历史记录列表  
    $ git log --pretty=oneline
    
    $ git reset --hard HEAD^  //回退上个版本  
在`Git`中，用`HEAD`表示当前版本，上一个版本就是`HEAD^`，上上一个版本就是`HEAD^^`，当然往上`100`个版本写`100`个`^`比较容易数不过来，所以写成`HEAD~100`。

### 回退后又想恢复怎么办？
    $ git reset --hard commit_id //即可，但是怎么知道上次回滚的commit_id呢？  
    $ git reflog  
    289f53a HEAD@{0}: reset: moving to HEAD^  
    ba423b7 HEAD@{1}: commit: add a line  
    289f53a HEAD@{2}: commit: add file test.txt  
    0aa4371 HEAD@{3}: commit: create new file  
    339d5bb HEAD@{4}: commit: add a line  
    906ce38 HEAD@{5}: commit (initial): add file readme.txt 
 
`git reflog`可以查看命令历史，于是我们知道 `add a line` 的`commit_id`是`ba423b7`

### git 的撤销修改
1，如果只是在本地做了一些修改，没有执行`commit`也没有`add`操作，使用`git status`可以看到红色字体提示 `modified: <file>  `
   这时如果不想保存本地修改，即丢弃工作区修改，直接执行`git checkout -- <file>`即可（`git status`有提示）  
2，如果已经执行了`add`还没有`commit`想回滚，可以执行`$ git reset HEAD readme.txt`将暂存区修改内容回退到工作区，如果还想撤回本地修改，执行步骤1即可  
3，如果已经`commit`，想回滚到之前的某个版本  
	执行` $ git reset --hard HEAD^ ` //回退上个版本  
	在Git中，用HEAD表示当前版本，上一个版本就是HEAD^，上上一个版本就是HEAD^^，当然往上100个版本写100个^比较容易数不过来，所以写成HEAD~100。  

**小结：**   
场景1：当你改乱了工作区某个文件的内容，想直接丢弃工作区的修改时，用命令`git checkout -- file`。  
场景2：当你不但改乱了工作区某个文件的内容，还添加到了暂存区时，想丢弃修改，分两步，第一步用命令`git reset HEAD file`，就回到了场景1，第二步按场景1操作。  
场景3：已经提交了不合适的修改到版本库时，想要撤销本次提交，参考版本回退一节，不过前提是没有推送到远程库。

## git 远程仓库

### git 远程仓库基本操作
以上所讲只是在一个本地仓库里管理文件历史，我们知道`git`是一个分布式的版本控制系统，即同一个`git`仓库可以分布在不同的服务器上，很庆幸`github`这个网站便可以提供免费的仓库托管服务。

先在`github`上注册账号登陆后`Create a new repo`新建一个仓库，例如`learngit`，于是便在`github`上新建了一个空仓库  
    `$ git remote add origin https://github.com/jiwenxing/learngit.git`  
添加后，远程库的名字就是`origin`，这是`Git`默认的叫法，也可以改成别的，但是`origin`这个名字一看就知道是远程库。    

执行`$ git push -u origin master`输入用户名和密码即可将本地库的内容推送到远程`github`仓库, 其中`-u`参数只在第一次提交时使用，表示将本地`master`分支和远程`master`分支相关联，再提交时只需执行  
`    $ git push origin master `   
如果报错让你先`fetch`，可以强制推送：  
`$ git push -u origin master --force`

**注意：**  
`Git`支持多种协议，包括`ssh`和`https`，  
`ssh`路径： `git@github.com:jiwenxing/learngit.git`   
`https`路径： `https://github.com/jiwenxing/learngit.git`  
通过`ssh`支持的原生`git`协议速度最快。但是在某些特定环境ssh端口被封掉时可以采用`https`，唯一不便的是每次提交都需要输入一下用户名和密码！

### git 从远程仓库 clone
    git clone https://github.com/h5bp/html5-boilerplate.git

### git 分支管理

`git`创建并切换到新分支 
 
    jiwenxing@BJPP-ZHANGQQ3 /d/git/learngit (master)
    $ git branch dev  //创建新分支
    
    jiwenxing@BJPP-ZHANGQQ3 /d/git/learngit (master)
    $ git branch
      dev
    * master   //*代表当前分支
    
    jiwenxing@BJPP-ZHANGQQ3 /d/git/learngit (master)
    $ git checkout dev  //切换分支
    Switched to branch 'dev'
    
    jiwenxing@BJPP-ZHANGQQ3 /d/git/learngit (dev)
    $ git branch
    * dev
      master

下面我在`dev`分支下对文件`test.txt`添加一行内容后执行`add commit`操作后，再次切换到`master`分支，你会发现刚才做的修改没有了。 也就是说刚才的修改只是针对`dev`分支，对`master`分支没有影响。

    jiwenxing@BJPP-ZHANGQQ3 /d/git/learngit (dev)
    $ git checkout master  //切回到主分支
    Switched to branch 'master'
    Your branch is up-to-date with 'origin/master'.
    
    jiwenxing@BJPP-ZHANGQQ3 /d/git/learngit (master)
    $ git merge dev  //将dev分支合并到当前master主分支
    Updating daf105e..b563da8
    Fast-forward
     test.txt | 3 ++-
     1 file changed, 2 insertions(+), 1 deletion(-)
    
    jiwenxing@BJPP-ZHANGQQ3 /d/git/learngit (master)
    $ git branch -d dev //此时可以删除dev分支
    Deleted branch dev (was b563da8).
    
    jiwenxing@BJPP-ZHANGQQ3 /d/git/learngit (master)
    $ git branch
    * master

可以看到上面我们将dev分支合并到了当前`master`分支后再去看`test.txt`文件，发现刚才做的修改又出现了，这时便可以放心大胆的删除`dev`分支了。

**小结**

- 查看分支：`git branch`
- 创建分支：`git branch <name>`
- 切换分支：`git checkout <name>`
- 创建+切换分支：`git checkout -b <name>`
- 合并某分支到当前分支：`git merge <name>`
- 删除分支：`git branch -d <name>`

### git 分支冲突
    
    $ git checkout -b feature1  //创建并切换到新分支，并对test文件做修改
    fatal: A branch named 'feature1' already exists.
    $ git add test.txt  
    $ git commit -m "conflict -and"  //在新分支下提交更改
     feature1 651c38a] conflict -and  
     1 file changed, 1 insertion(+), 1 deletion(-)
    $ git checkout master  //切回到master分支，对test文件做不同的更改
    README.MD  
    Switched to branch 'master'  
    Your branch is up-to-date with 'origin/master'.  
    $ git add test.txt  
    $ git commit -m "conflict -&"  //在master下提交更改
     master 0dc1bd3] conflict -&  
     1 file changed, 1 insertion(+), 1 deletion(-)  
    $ git merge feature1  //在master分支下合并feature1分支上的更改，显示冲突
    CONFLICT (content): Merge conflict in test.txt  
    Automatic merge failed; fix conflicts and then commit the result.

在不同分支上对同一文件分别做了不同的更改，合并分支的时候就会报冲突，而这时`test.txt`文件的内容也变成了如下：

    I am totoro~
    who are you？
    I am totoro~
    <<<<<<< HEAD
    Creating a new branch is quick & simple.
    =======
    Creating a new branch is quick AND simple.
    >>>>>>> feature1

`Git`用`<<<<<<<`，`=======`，`>>>>>>>`标记出不同分支的差异内容，`<<<<<<<`标记冲突开始，后面跟的是当前分支中的内容。HEAD指向当前分支末梢的提交。`=======`之后，`>>>>>>>`之前是要`merge`过来的另一条分支上的代码。`>>>>>>>`之后的`feature1`是该分支的名字。

手动在文件中将差异内容做一下修改，再次`add`、`commit`即可解决冲突，完事还可以查看分支的合并情况：

    $ git log --graph --pretty=oneline --abbrev-commit
    7f9c092 conflict solved
     \
      * 651c38a conflict -and
      | 0dc1bd3 conflict -&
     /
      cfb3522 readme revise4
      b563da8 branch test
      daf105e readme revise3
      002f01d revise2 readme.md
      5697575 revise readme.md
      28d49b7 add a pic
      ca373c6 add two files


**注意：**  
合并分支指令`$ git merge feature1`默认使用的是`fast forward`模式，这样合并并不记录合并历史，而使用指令`$ git merge --no-ff -m "merge with no-ff" dev`则是使用普通模式合并代码，合并后有历史记录，建议采用后一种。

### git 分支管理策略

> 注：该部分内容参考自文章[《Git 分支管理详解》](//www.oschina.net/question/31384_157479)

团队开发中应该如何充分应用`git`的分支功能呢，通常一个项目较为规范的分支策略如下：

- 主分支`master`：代码库应该有一个、且仅有一个主分支。所有提供给用户使用的正式版本，都在这个主分支上发布。  
  ![](//static.oschina.net/uploads/img/201406/05112016_Jfp8.png)
- 开发分支`dev`：进行日常开发工作，这个分支可以用来生成代码的最新代码版本。如果想正式对外发布，就在`Master`分支上，对`Dev`分支进行"合并"。  
  ![](//static.oschina.net/uploads/img/201406/05112016_HYVm.png)  
- 功能分支`feature`：开发某种特定功能，从`Dev`分支上面分出来的；开发完成后，要再并入`Dev`。
  ![](//static.oschina.net/uploads/img/201406/05112016_v2ve.png)
- 预发布分支`release`：预发布分支，它是指发布正式版本之前（即合并到`Master`分支之前），我们可能需要有一个预发布的版本进行测试。预发布分支是从Develop分支上面 分出来的，预发布结束以后，必须合并进`Dev`和`Master`分支。
- `bug`分支`fixbug`：软件正式发布以后，难免会出现bug。这时就需要创建一个分支，进行`bug`修补。修补`bug`分支是从`Master`分支上面分出来的。修补结束以后，再合并进`Master`和`Dev`分支。
   ![](//static.oschina.net/uploads/img/201406/05112016_PIf1.png)
  
## 使用`github`参与开源项目

访问自己感兴趣的项目主页（例如`bootstrap`项目`https://github.com/twbs/bootstrap`）， 点右上角的`“Fork”`就在自己的账号下克隆了一个`bootstrap`仓库，然后，**从自己的账号下`clone`**：  

    git clone https://github.com/jiwenxing/bootstrap.git

**注意** 只有从自己的账号下`clone`仓库，才能推送修改。  
如果你想修复`bootstrap`的一个`bug`，或者新增一个功能，立刻就可以开始干活，干完后，往自己的仓库推送。如果你希望`bootstrap`的官方库能接受你的修改，你就可以在`GitHub上`发起一个`pull request`。

**小结：**  

- 在`GitHub`上，可以任意`Fork`开源仓库；
- 自己拥有`Fork`后的仓库的读写权限；
- 可以推送`pull request`给官方仓库来贡献代码。

## 结语
虽然很久之前就开始用`github`，并在上面搭建了博客，但是从没用过其版本控制功能，很多东西也没有完全搞明白，希望在以后的工作中慢慢用起来，后面也会根据自己的实际应用进行更新。