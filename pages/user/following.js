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
    if (e.login) {
      that.setData({
        login: e.login
      });
      wx.setNavigationBarTitle({
        title: "Ta的关注"
      });
    } else {
      wx.setNavigationBarTitle({
        title: '我的关注'
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
        that.getList();
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
  getList: function () {
    var that = this;
    if (that.isGetingData) {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      return;
    }
    that.isGetingData = true;
    var url = app.config.apiUrl + "api/v5/user/following";
    if (that.data.login) {
      url = app.config.apiUrl + "api/v5/users/" + that.data.login + "/following";
    }
    wx.request({
      url: url,
      method: "GET",
      data: {
        access_token: app.access_token,
        page: that.data.page
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
  },
  showMenu: function (e) {
    console.log(e);
    var that = this;
    if (that.data.login) {
      wx.navigateTo({
        url: '../user/detail?login=' + e.mark.login,
      });
    } else {
      wx.showActionSheet({
        itemList: ['查看主页', '取消关注'],
        success: function (ret) {
          switch (ret.tapIndex) {
            case 0:
              wx.navigateTo({
                url: '../user/detail?login=' + e.mark.login,
              });
              break;
            case 1:
              wx.showModal({
                title: '取关提醒',
                content: '是否确认对这个用户取关？',
                showCancel: true,
                confirmText: "取关",
                confirmColor: "#ff4500",
                cancelText: "返回",
                success(res) {
                  if (res.confirm) {
                    wx.showLoading({
                      title: '正在取消',
                    });
                    var url = app.config.apiUrl + "api/v5/user/following/" + e.mark.login;
                    wx.request({
                      url: url,
                      method: "DELETE",
                      header: {
                        "content-type": "application/x-www-form-urlencoded"
                      },
                      data: {
                        access_token: app.access_token,
                      },
                      success: function (result) {
                        wx.hideLoading();
                        wx.showModal({
                          title: '取消成功',
                          content: '你已经成功取消了对这个用户的关注',
                          showCancel: false,
                          success: function (res) {
                            that.setData({
                              page: 1
                            });
                            that.getList();
                          }
                        });
                      }
                    });
                  }
                }
              });
              break;
            default:
          }
        }
      });
    }
  }
})