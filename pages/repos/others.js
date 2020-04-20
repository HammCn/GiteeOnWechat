const app = getApp()

/**
 * 页面的初始数据
 */
Page({
  data: {
    //分页开始
    page: 1,
    isGetingData: false,
    list: [],
    login: false,
    type: 'public'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this
    if (e.login) {
      that.setData({
        login: e.login,
        type: (e.type ? e.type : 'public')
      })
      switch (that.data.type) {
        case 'watch':
          wx.setNavigationBarTitle({
            title: "Ta的Watch仓库"
          });
          break;
        case 'star':
          wx.setNavigationBarTitle({
            title: "Ta的Star仓库"
          });
          break;
        default:
          wx.setNavigationBarTitle({
            title: "Ta的开源仓库"
          });
      }
      wx.showLoading({
        title: '数据读取中',
      });
      that.getList();
    }
  },
  /**
   * 页面显示事件
   */
  onShow: function () {
    app.getUserInfo(function (result) {
      if (!result) {
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
    this.getList();
  },
  /**
   * 上拉加载时间
   */
  onReachBottom: function () {
    if (!this.data.isGetingData) {
      this.setData({
        page: this.data.page + 1
      });
      this.getList();
    }
  },
  /**
   * 获取数据列表
   */
  getList: function (loading = true) {
    var that = this;
    if (loading) {
      wx.showLoading({
        title: '数据加载中',
      });
    }
    if (that.isGetingData) {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      return;
    }
    that.isGetingData = true;
    var url = app.config.apiUrl + "api/v5/users/" + that.data.login + "/repos";
    switch (that.data.type) {
      case 'star':
        url = app.config.apiUrl + "api/v5/users/" + that.data.login + "/starred";
        break;
      case 'watch':
        url = app.config.apiUrl + "api/v5/users/" + that.data.login + "/subscriptions";
        break;
      default:
    }
    wx.request({
      url: url,
      method: "POST",
      data: {
        access_token: app.access_token,
        q: that.data.keyword,
        page: that.data.page,
        method: 'get'
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
            success(res) {
              wx.navigateBack();
            }
          });
        } else {
          if (that.data.page == 1) {
            that.setData({
              list: result.data
            });
          } else {
            var _list = that.data.list;
            for (var i = 0; i < result.data.length; i++) {
              _list.push(result.data[i]);
            }
            that.setData({
              list: _list
            });
          }
        }
      }
    });
  }
})