const app = getApp()
/**
 * 页面的初始数据
 */
Page({
  data: {
    userInfo: {},
    isLogin: false,
    defaultInfo: {
      avatar_url: "../../res/image/logo.png",
      name: "点击登录",
      bio: "登录即可享受更多优质的服务",
      followers: 0,
      following: 0,
      stared: 0,
      watched: 0
    }
  },
  comming: function () {
    wx.showToast({
      title: '即将上线 敬请期待'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    // wx.navigateTo({url:'../user/detail?login=ld'});//拿红薯的帐号做页面测试
    wx.showLoading({
      title: '数据加载中',
    });
    that.setData({
      userInfo: that.data.defaultInfo
    });
    wx.setNavigationBarTitle({
      title: app.product.name,
    });
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '版本更新',
        content: '你已经更新至最新版本，请点击确定重启最新版本',
        showCancel: false,
        success: function (res) {
          updateManager.applyUpdate()
        }
      })
    });
    updateManager.onUpdateFailed(function () {});
  },
  onShow: function () {
    this.getUserInfo();
  },
  ifNeedLogin: function () {
    if (!this.data.isLogin) {
      app.login();
    }else{
      wx.navigateTo({
        url: '../user/motify',
      })
    }
  },
  getUserInfo: function () {
    var that = this;
    app.getUserInfo(function (result) {
      wx.hideLoading();
      if (result) {
        that.setData({
          userInfo: app.userInfo,
          isLogin: true
        });
      } else {
        that.setData({
          userInfo: that.data.defaultInfo,
          isLogin: false
        });
      }
    });
  },
  openSetting: function () {
    wx.showActionSheet({
      itemList: ['修改资料', '关于我们', '退出登录'],
      success: function (ret) {
        switch (ret.tapIndex) {
          case 0:
            wx.navigateTo({
              url: '../user/motify',
            });
            break;
          case 1:
            wx.navigateTo({
              url: '../about/index',
            });
            break;
          case 2:
            var that = this;
            wx.showModal({
              title: '退出提醒',
              content: '是否退出当前登录的码云帐号？',
              showCancel: true,
              confirmText: "退出",
              confirmColor: "#ff4500",
              cancelText: "返回",
              success(res) {
                if (res.confirm) {
                  app.logout();
                  app.login();
                }
              }
            });
            break;
          default:
        }
      }
    });
  },
  showMyActivity: function () {
    wx.showActionSheet({
      itemList: ['我的通知', '我的私信'],
      success: function (ret) {
        switch (ret.tapIndex) {
          case 0:
            wx.navigateTo({
              url: '../activity/notifications',
            });
            break;
          case 1:
            wx.navigateTo({
              url: '../activity/mails',
            });
            break;
          default:
        }
      }
    });
  },
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: "我在码云上发现一个叫" + that.data.userInfo.name + "的大佬...",
      path: '/pages/user/detail?login=' + that.data.userInfo.login
    }
  }
})