<p align="center">
<img width="200" src="https://images.gitee.com/uploads/images/2020/0420/141521_efc8952d_145025.png"/>
</p>
<p align="center">
<a href="https://gitee.com/hamm/GiteeOnWechat/stargazers" target="_blank"><img src="https://svg.hamm.cn/gitee.svg?type=star&user=hamm&project=GiteeOnWechat"/></a>
<a href="https://gitee.com/hamm/GiteeOnWechat/members" target="_blank"><img src="https://svg.hamm.cn/gitee.svg?type=fork&user=hamm&project=GiteeOnWechat"/></a>
<img src="https://svg.hamm.cn/badge.svg?key=Platform&value=微信小程序"/>
<img src="https://svg.hamm.cn/badge.svg?key=Proxy&value=PHP-CURL"/>
</p>

### 介绍

码云微信小程序(第三方服务)是一个基于微信小程序+码云OpenAPI的代码仓库管理小工具，目前已经在小程序上架了几个版本，更多的功能正在开发中。

### 项目说明

本项目小程序客户端部分除页面UI基于WeUI以及Markdown采用了第三方库以外，未集成任何开发框架，纯微信小程序原生代码实现；服务端部分仅仅两个PHP文件做转发，没有任何的数据存储和缓存服务。

为了用户在登录时不会触发码云的异地登录检测警告，我们推荐使用码云的私人令牌进行授权。

### 使用说明

```
1. clone 本项目至本地 导入微信小程序并修改为自己的APPID
2. 部署两个PHP文件到站点内，修改对应的访问URL
3. 建议你配置一下Rewrite 隐藏index.php文件的路径，小程序中API路径看起来更舒服一些
4. 编译并运行小程序开发版 即可预览效果
```
附Nginx Rewrite Demo：
```
location / {
    if (!-e $request_filename) {
        rewrite ^(.*)$ /index.php?GiteeAPI=$1 last;
        break;
    }
}
```

### 特色功能
```
1. 手机端查看代码提交记录，评论变更的文件
2. 手机端查看码云通知/私信
3. 手机端查看/合并/关闭PR
4. 方便发起Issue、管理、查看Issue状态等
5. 查看用户主页、用户开源仓库和用户关注的仓库
6. 搜索Gitee上更多精彩的开源项目
7. 更多特色欢迎你来体验和提出，也欢迎贡献代码~
```

### TODO
[开发计划和建议反馈请点击这里提交Issue](https://gitee.com/hamm/GiteeOnWechat/issues)

### 参与贡献
```
1. Fork 本仓库
2. 新建分支 添加或修改功能
3. 提交代码
4. 新建 Pull Request
```

### 无图无真相

![Gitee on wechat](https://images.gitee.com/uploads/images/2020/0420/142209_9b22e5e6_145025.jpeg "c4b9fbea5f7f7fa2b652f784bf08b3f.jpg")