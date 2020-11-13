# vscode-nstree - 图形化操作快速生成项目目录结构树

平日里项目开发过程中或者项目初期开发结束后，经常会需要把项目目录结构列出来以供后人和以后的自己快速查阅。通常的方式是使用 [md格式](https://github.com/nostarsnow/webpack-multi-seed#%E7%9B%AE%E5%BD%95)。 生成这种格式的md一般是通过`cmd tree`或者`npm`包来过滤文件生成树结构再一一添加注释。这种方法好吗？总结一下我认为的优缺点。

> 优点：好吧没什么优点，聊胜于无。

> 缺点：添加过滤文件的配置生成麻烦、生成后手动删除麻烦、添加注释麻烦、有修改或扩展后再次对齐空格写注释麻烦。最关键的是，后人看起来也极其麻烦！

如果一种方法可以按照git目录那种文件树展示就好了，可惜git上文件树后面跟的是该文件最后修改的`commit message`，既然如此，那就在自己来做一个吧！该项目目前仅为vscode版本。支持git网页也很容易，可惜网页不支持。之后可以配套个油猴插件。

该文档和下面的在线 demo 中有大量的 apng 动态图片，请使用 chrome 等浏览器访问，否则图片不会动呀不会动！

> [在线 demo。包含所有功能演示](https://nostarsnow.github.io/vscode-nstree/) 

先放一张大效果图

![效果图](https://static.zuhaowan.com/static/zhwfe/static/nostar/nstree/demo.jpg)


## 功能介绍

以下文档中含有大量的 apng 动态图片。如果你是通过浏览器访问，请使用chrome等浏览器（我懒得检测做兼容）。

### 快速复制基于当前项目中的文件路径


vscode自带的复制路径和复制相对路径实在不好用，因此我又重新写了一个。简单来说就是首先找到当前文件的项目根目录。（通过`package.json/.git/.svn`等文件来确定，可以通过设置来配置）

![快速复制基于当前项目中的文件路径](https://static.zuhaowan.com/static/zhwfe/static/nostar/nstree/copyPath.png)


### 初始化项目的目录结构

初始化的时候请不要右击项目文件夹，因为文件夹名字是不固定的。要右击项目下的文件。初始化的时候会默认读取项目根路径下的`package.json`中的`name`字段作为项目名称。

![初始化项目的目录结构](https://static.zuhaowan.com/static/zhwfe/static/nostar/nstree/pluginInit.png)

### 打开已有的项目目录结构

其实和上面初始化是一个方法。也可以通过打开文件后右击或者打开文件后通过`ctrl+alt+p`选择命令一样可以。如果没有会创建。

![从vscode中打开](https://static.zuhaowan.com/static/zhwfe/static/nostar/nstree/openFromVs.png)


### 搜索过滤

支持检索文件名或文件注释。该检索仅展示过滤，不影响导出等功能。

![搜索过滤](https://static.zuhaowan.com/static/zhwfe/static/nostar/nstree/filter.png)

### 从目录结构中打开文件(夹)

右击目录或文件可以在菜单中选择。打开文件会直接使用`vscode`在第一窗口打开，打开文件夹会使用资源管理器打开该文件夹

![从目录结构中打开文件(夹)](https://static.zuhaowan.com/static/zhwfe/static/nostar/nstree/openFile.png)


### 编辑目录结构节点

右击目录或文件可以在菜单中选择。亦可通过[打开已有的项目目录结构](#打开已有的项目目录结构)方式从vscode中打开编辑

![从目录结构中打开文件(夹)](https://static.zuhaowan.com/static/zhwfe/static/nostar/nstree/editFile.png)

### 删除目录结构节点

仅删除目录结构中的该节点及以下所有子节点，**不会删除硬盘上的文件和文件夹**

![删除目录结构节点](https://static.zuhaowan.com/static/zhwfe/static/nostar/nstree/delFile.png)

### 检测无效路径

该方法会检测所有目录结构节点是否在硬盘中存在，并给出所有不存在的文件提示，确认删除即可删除这些不存在的节点。用于本地修改/删除了目录结构时使用。

![检测无效路径](https://static.zuhaowan.com/static/zhwfe/static/nostar/nstree/clearUnless.png)

### 导出为md格式

理论上有了该插件后不再需要md格式了。但是如果一定想要的话，也支持导出。并且导出后自带格式化的空格以及注释。

![导出为md格式](https://static.zuhaowan.com/static/zhwfe/static/nostar/nstree/exportMd.png)

## 获取项目根路径的检测方式

### 复制路径时

从当前文件或文件夹向上（包括当前目录）检测是否存在`package.json/.svn/.git`。若存在，则以存在的目录为项目根路径。检测的文件或文件夹名字可以在配置中配置。以下不再赘述

### 编辑项目目录结构时

会根据以下优先级分别检测

1. 如果当前选择文件夹下有`nstree.json`，则以当前文件夹为项目根路径

2. 从当前文件或文件夹向上（包括当前目录）检测是否存在`package.json/.svn/.git`。若存在，则以存在的目录为项目根路径。

3. 如果通过2的方式没有找到匹配文件，则会按照当前vscode打开的目录树根文件为根路径。

## 插件后叙

该插件还有很多不尽如意的地方，比如不管英文，不自动适配亮色/暗色模式，没测试过mac等其他系统，获取项目根路径方式还有待完善等等。

但是目前已经满足我的使用需求了。

仰天大笑出门去。我辈岂是蓬蒿人。嘛，最后祝您身体健康，再见。！