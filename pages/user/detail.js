const app = getApp()
/**
 * 页面的初始数据
 */
Page({
  data: {
    userInfo: {},
    login: "",
    showFollowBtn: false,
    defaultInfo: {
      avatar_url: "../../res/image/logo.png",
      name: "　　",
      bio: "　　",
      followers: 0,
      following: 0,
      stared: 0,
      watched: 0
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this;
    that.setData({
      userInfo: that.data.defaultUserInfo,
    });
    if (e.login) {
      that.setData({
        login: e.login,
      });
      wx.showLoading({
        title: '用户读取中',
      });
    } else {
      wx.showModal({
        title: '参数错误',
        content: '系统发生错误，无法为你读取数据',
        showCancel: false,
        success(res) {
          wx.navigateBack();
        }
      });
    }
  },
  /**
   * 页面显示事件
   */
  onShow: function () {
    var that = this;
    app.getUserInfo(function (result) {
      if (result) {
        that.getDetail(false);
      } else {
        app.loginFirst();
      }
    });
  },
  /**
   * 下拉刷新事件
   */
  onPullDownRefresh() {
    this.getDetail();
  },
  getDetail: function (loading = true) {
    var that = this;
    if (loading) {
      wx.showLoading({
        title: '用户读取中',
      });
    }
    wx.request({
      url: app.config.apiUrl + "api/v5/users/" + that.data.login,
      method: "GET",
      success: function (result) {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (result.data.hasOwnProperty("id")) {
          that.setData({
            userInfo: result.data
          });
          that.checkFollowed();
        } else {
          wx.stopPullDownRefresh();
          wx.hideLoading();
          wx.showModal({
            title: '数据获取失败',
            content: result.data.message,
            showCancel: false,
            success(res) {
              wx.navigateBack();
            }
          });
        }
      }
    });
  },
  addFollow: function () {
    var that = this;
    wx.showLoading({
      title: '关注中',
    });
    wx.request({
      url: app.config.apiUrl + "api/v5/user/following/" + that.data.login,
      method: "PUT",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        access_token: app.access_token,
      },
      success: function (result) {
        wx.hideLoading();
        if (result.data.hasOwnProperty("message")) {
          wx.showModal({
            title: '关注失败',
            content: "仔细想想，你是不是已经关注过这位大佬了？",
            showCancel: false,
            success(res) {}
          });
        } else {
          wx.showModal({
            title: '关注成功',
            content: "现在可以在好友动态中查看这位大佬的骚操作啦~",
            showCancel: false,
            success(res) {
              that.getDetail();
            }
          });
        }
      }
    });
  },
  checkFollowed: function () {
    var that = this;
    wx.request({
      url: app.config.apiUrl + "api/v5/user/following/" + that.data.login,
      method: "GET",
      data: {
        access_token: app.access_token
      },
      success: function (result) {
        if (result.data.hasOwnProperty("message")) {
          that.setData({
            showFollowBtn: true,
          });
        } else {
          that.setData({
            showFollowBtn: false,
          });
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
      path: '/pages/user/detail?login=' + that.data.login
    }
  }
})