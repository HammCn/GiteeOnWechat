const app = getApp()
/**
 * 页面的初始数据
 */
Page({
  data: {
    isLogin: false,
    friendList: [],
    userInfo: {},
    myList: [],
    per_page: 10
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    wx.showLoading({
      title: '数据加载中',
    });
    app.loadFont();
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
  login() {
    app.login();
  },
  onPullDownRefresh() {
    var that = this;
    app.getUserInfo(function (result) {
      if (result) {
        that.setData({
          isLogin: true
        });
        wx.showLoading({
          title: '更新中',
        });
        that.getActivitys();
      } else {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    });
  },
  onShow: function () {
    var that = this;
    app.getUserInfo(function (result) {
      if (result) {
        that.setData({
          isLogin: true
        });
        that.getActivitys();
      } else {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    });
  },
  itemClick: function (e) {
    var that = this;
    var menuList = [];
    if (e.mark.listType == "friends") {
      menuList = [
        '进入仓库', '用户信息'
      ];
    } else {
      menuList = ['进入仓库'];
    }
    switch (e.mark.type) {
      case 'PushEvent':
        menuList.push('查看提交');
        break;
      case 'IssueCommentEvent':
        menuList.push('查看Issue评论');
        break;
      case 'IssueEvent':
        menuList.push('查看Issue');
        break;
      case 'PullRequestEvent':
        menuList.push('查看PullRequest');
        break;
      default:
    }
    var pathArray = e.mark.repo.split('/');
    wx.showActionSheet({
      itemList: menuList,
      success: function (res) {
        switch (menuList[res.tapIndex]) {
          case "进入仓库":
            wx.navigateTo({
              url: '../repos/detail?namespace=' + pathArray[0] + "&path=" + pathArray[1],
            })
            break;
          case "用户信息":
            wx.navigateTo({
              url: '../user/detail?login=' + e.mark.login,
            })
            break;
          case "查看提交":
            wx.navigateTo({
              url: '../commits/detail?hash=' + e.mark.payload.after + '&namespace=' + pathArray[0] + "&path=" + pathArray[1],
            })
            break;
          case "查看Issue评论":
            wx.navigateTo({
              url: '../issues/detail?number=' + e.mark.payload.issue.number + '&namespace=' + pathArray[0] + "&path=" + pathArray[1],
            })
            break;
          case "查看Issue":
            wx.navigateTo({
              url: '../issues/detail?number=' + e.mark.payload.number + '&namespace=' + pathArray[0] + "&path=" + pathArray[1],
            })
            break;
          case "查看PullRequest":
            wx.navigateTo({
              url: '../requests/commits?number=' + e.mark.payload.number + '&namespace=' + pathArray[0] + "&path=" + pathArray[1],
            })
            break;
          default:
        }
      }
    })
  },
  /**
   * 获取数据列表
   */
  getActivitys: function (isMine = false) {
    var that = this;
    if (that.isGetingData) {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      return;
    }
    that.isGetingData = true;
    var url = app.config.apiUrl + "api/v5/users/" + app.userInfo.login + "/received_events";
    if (isMine) {
      url = app.config.apiUrl + "api/v5/users/" + app.userInfo.login + "/events";
    }
    wx.request({
      url: url,
      method: "GET",
      data: {
        access_token: app.access_token,
        // per_page: that.data.per_page,
        // page: 1
      },
      success: function (result) {
        that.isGetingData = false;
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (result.data.hasOwnProperty("message")) {
          wx.showModal({
            title: '获取失败',
            content: "你可以尝试重新登录或稍后再试",
            showCancel: false,
            success(res) {}
          });
        } else {
          if (isMine) {
            that.setData({
              myList: result.data
            });
          } else {
            that.setData({
              friendList: result.data
            });
          }
          if (!isMine) {
            that.getActivitys(true);
          }
        }
      }
    });
  },
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
    }
    if (that.data.isLogin) {
      return {
        title: "我在码云上发现一个叫" + app.userInfo.name + "的大佬...",
        path: '/pages/user/detail?login=' + app.userInfo.login,
        imageUrl: '/res/image/share.jpg',
      }
    }
  }
})