const app = getApp()
/**
 * 页面的初始数据
 */
Page({
  data: {
    userInfo: {},
    enterprises: [],
    orgs: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.showLoading({
      title: '数据加载中',
    });
    app.loadFont();
  },
  onShow: function () {
    var that = this;
    app.getUserInfo(function (result) {
      if (result) {
        that.getMyCops();
      } else {
        app.loginFirst();
      }
    });
  },
  onPullDownRefresh() {
    this.getMyCops();
  },
  getMyCops: function () {
    var that = this;
    var url = app.config.apiUrl + "api/v5/user/namespaces";
    wx.request({
      url: url,
      method: "GET",
      data: {
        access_token: app.access_token,
      },
      success: function (result) {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (result.data.hasOwnProperty("message")) {
          wx.showModal({
            title: '获取失败',
            content: "你可以尝试重新登录或稍后再试",
            showCancel: false,
            success(res) {
              wx.navigateBack();
            }
          });
        } else {
          var enterprises = [];
          var orgs = [];
          for (var index in result.data) {
            switch (result.data[index].type) {
              case 'group':
                orgs.push(result.data[index]);
                break;
              case 'enterprise':
                enterprises.push(result.data[index]);
                break;
              default:
            }
          }
          that.setData({
            enterprises: enterprises,
            orgs: orgs
          })
        }
      }
    });
  },
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: "我在码云上发现一个叫" + that.data.userInfo.name + "的大佬...",
      path: '/pages/user/detail?login=' + that.data.userInfo.login
    }
  }
})