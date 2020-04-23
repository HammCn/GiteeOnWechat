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
    var that = this;
    if (e.number) {
      that.setData({
        number: e.number,
        namespace: e.namespace,
        path: e.path,
      });
      wx.showLoading({
        title: '数据读取中',
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
        that.getCommits(false);
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
  getCommits: function (loading = true) {
    var that = this;
    if (that.isGetingData) {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      return;
    }
    if (loading) {
      wx.showLoading({
        title: '提交记录读取中',
      });
    }
    wx.request({
      url: app.config.apiUrl + "api/v5/repos/" + that.data.namespace + "/" + that.data.path + "/pulls/" + that.data.number + "/commits",
      method: "POST",
      data: {
        access_token: app.access_token,
        method: 'get'
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
})