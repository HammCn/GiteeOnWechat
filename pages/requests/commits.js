const app = getApp()
var base64Helper = require('../../utils/Base64.js');
/**
 * 页面的初始数据
 */
Page({
  data: {
    namespace: "",
    path: "",
    number: "",
    isGetingData: false,
    commitList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    wx.showLoading({
      title: '数据加载中',
    });
    app.loadFont();
    var that = this;
    if (e.number) {
      that.setData({
        number: e.number,
        namespace: e.namespace,
        path: e.path,
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
        that.getCommits();
      } else {
        app.loginFirst();
      }
    });
  },
  /**
   * 下拉刷新事件
   */
  onPullDownRefresh() {
    this.getCommits();
  },
  getCommits: function () {
    var that = this;
    if (that.isGetingData) {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      return;
    }
    wx.request({
      url: app.config.apiUrl + "api/v5/repos/" + that.data.namespace + "/" + that.data.path + "/pulls/" + that.data.number + "/commits",
      method: "GET",
      data: {
        access_token: app.access_token,
      },
      success: function (result) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (!result.data.hasOwnProperty("message")) {
          that.setData({
            commitList: result.data
          });
        } else {
          wx.showModal({
            title: '读取Commit失败',
            content: result.data.message,
            showCancel: false,
          });
        }
      }
    });
  },
  onShareAppMessage: function (res) {}
})