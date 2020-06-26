const app = getApp()
/**
 * 页面的初始数据
 */
Page({
  data: {
    login: "",
    name: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  doFormSubmit: function (e) {
    var that = this;
    if (!e.detail.value.content) {
      wx.showModal({
        title: '发送失败',
        content: '难道你就没有什么想说的吗？',
        showCancel: false,
      });
      return;
    }
    wx.showLoading({
      title: '正在发送消息',
    });
    wx.request({
      url: app.config.apiUrl + "/api/v5/notifications/messages",
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        access_token: app.access_token,
        username: that.data.login,
        content: e.detail.value.content + "　　#消息来自码云仓库小程序"
      },
      success: function (result) {
        wx.hideLoading();
        if (result.data.hasOwnProperty("message")) {
          wx.showModal({
            title: '发送失败',
            content: result.data.message,
            showCancel: false,
          });
        } else {
          wx.showModal({
            title: '发送成功',
            content: '你的私信已经成功发送给对方！',
            showCancel: false,
            success: function () {
              wx.navigateBack();
            }
          });
        }
      }
    });
  },
  onLoad: function (e) {
    app.loadFont();
    var that = this;
    if (e.login && e.name) {
      that.setData({
        login: e.login,
        name: e.name
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
      if (!result) {
        app.loginFirst();
      }
    });
  },
})