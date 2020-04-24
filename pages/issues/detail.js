const app = getApp()
/**
 * 页面的初始数据
 */
Page({
  data: {
    number: "",
    namespace: "",
    path: "",
    issue: null,
    issueFormShow: false,
    page: 1,
    commit: []
  },
  addComment: function (e) {
    this.setData({
      issueFormShow: true
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  hideAddForm: function () {
    this.setData({
      issueFormShow: false
    });
  },
  doCommentFormSubmit: function (e) {
    var that = this;
    if (!e.detail.value.body) {
      wx.showModal({
        title: '评论失败',
        content: '什么都不填的话就没必要发布评论了吧？',
        showCancel: false,
      });
      return;
    }
    wx.showLoading({
      title: '正在提交评论',
    });
    wx.request({
      url: app.config.apiUrl + "api/v5/repos/" + that.data.namespace + "/" + that.data.path + "/issues/" + that.data.number + "/comments",
      method: "POST",
      data: {
        ...{
          access_token: app.access_token,
          method: 'post'
        },
        ...e.detail.value
      },
      success: function (result) {
        wx.hideLoading();
        if (result.data.hasOwnProperty("message")) {
          wx.showModal({
            title: '评论失败',
            content: result.data.message,
            showCancel: false,
          });
        } else {
          wx.showModal({
            title: '评论发布成功',
            content: '你的评论已经发布成功，感谢你对这个仓库的关注',
            showCancel: false,
            success: function (res) {
              that.getComments();
            }
          });
        }
      }
    });
  },
  onLoad: function (e) {
    var that = this;
    if (e.number && e.path && e.namespace) {
      that.setData({
        number: e.number,
        namespace: e.namespace,
        path: e.path
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
        that.getDetail();
      } else {
        app.loginFirst();
      }
    });
  },
  /**
   * 下拉刷新事件
   */
  onPullDownRefresh() {
    this.setData({
      page: 1
    });
    this.getDetail();
  },
  /**
   * 上拉加载时间
   */
  onReachBottom: function () {
    if (!this.data.isGetingData) {
      this.setData({
        page: this.data.page + 1
      });
      this.getComments();
    }
  },
  getDetail: function () {
    var that = this;
    wx.showLoading({
      title: 'Issue读取中',
    });
    wx.request({
      url: app.config.apiUrl + "api/v5/repos/" + that.data.namespace + "/" + that.data.path + "/issues/" + that.data.number,
      method: "POST",
      data: {
        access_token: app.access_token,
        method: 'get'
      },
      success: function (result) {
        if (result.data.hasOwnProperty("number")) {
          that.setData({
            issue: result.data
          });
          that.getComments();
        } else {
          wx.hideLoading();
          wx.stopPullDownRefresh();
          wx.showModal({
            title: 'Issue获取失败',
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
  getComments: function () {
    var that = this;
    wx.showLoading({
      title: '评论读取中',
    });
    if (that.isGetingData) {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      return;
    }
    wx.request({
      url: app.config.apiUrl + "api/v5/repos/" + that.data.namespace + "/" + that.data.path + "/issues/" + that.data.number + "/comments",
      method: "POST",
      data: {
        access_token: app.access_token,
        page: that.data.page,
        direction: "desc",
        method: 'get'
      },
      success: function (result) {
        that.isGetingData = false;
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (that.data.page == 1) {
          that.setData({
            comments: result.data
          });
        } else {
          var _list = that.data.comments;
          for (var i = 0; i < result.data.length; i++) {
            _list.push(result.data[i]);
          }
          that.setData({
            comments: _list
          });
        }
      }
    });
  },

})