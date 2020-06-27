const app = getApp()

/**
 * 页面的初始数据
 */
Page({
  data: {
    //分页开始
    page: 1,
    isMaster: false,
    path: "",
    isGetingData: false,
    list: [],
    login: false
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
    if (e.path) {
      that.setData({
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
    if (e.isMaster) {
      that.setData({
        isMaster: true
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
    var url = app.config.apiUrl + "api/v5/orgs/" + that.data.path + "/members";
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
    var that = this;
    if (that.data.isMaster) {
      //管理员 弹出选择器
      wx.showActionSheet({
        itemList: [
          '查看主页',
          '踢出成员',
          '设为管理',
          '取消管理'
        ],
        success: function (res) {
          switch (res.tapIndex) {
            case 0:
              wx.navigateTo({
                url: '../user/detail?login=' + e.mark.login,
              });
              break;
            case 2:
              wx.showLoading({
                title: '正在操作',
              });
              var url = app.config.apiUrl + "api/v5/orgs/" + that.data.path + "/memberships/" + e.mark.login;
              wx.request({
                url: url,
                method: "PUT",
                data: {
                  access_token: app.access_token,
                  role: 'admin'
                },
                success: function (result) {
                  wx.hideLoading();
                  if (result.data.hasOwnProperty("message")) {
                    wx.showModal({
                      title: '操作失败',
                      content: "你可以尝试重新登录或稍后再试",
                      showCancel: false,
                    });
                  } else {
                    that.getList();
                  }
                }
              });
              break;
            case 3:
              wx.showLoading({
                title: '正在操作',
              });
              var url = app.config.apiUrl + "api/v5/orgs/" + that.data.path + "/memberships/" + e.mark.login;
              wx.request({
                url: url,
                method: "PUT",
                data: {
                  access_token: app.access_token,
                  role: 'member'
                },
                success: function (result) {
                  wx.hideLoading();
                  if (result.data.hasOwnProperty("message")) {
                    wx.showModal({
                      title: '操作失败',
                      content: "你可以尝试重新登录或稍后再试",
                      showCancel: false,
                    });
                  } else {
                    that.getList();
                  }
                }
              });
              break;
            case 1:
              wx.showModal({
                title: '踢出成员',
                content: '是否确定踢出当前选中的成员?',
                showCancel: true,
                confirmText: "踢出",
                confirmColor: "#ff4500",
                cancelText: "返回",
                success(res) {
                  if (res.confirm) {
                    wx.showLoading({
                      title: '正在踢出',
                    })
                    var url = app.config.apiUrl + "api/v5/orgs/" + that.data.path + "/memberships/" + e.mark.login;
                    wx.request({
                      url: url,
                      method: "DELETE",
                      data: {
                        access_token: app.access_token,
                      },
                      success: function (result) {
                        wx.hideLoading();
                        if (result.data.hasOwnProperty("message")) {
                          wx.showModal({
                            title: '操作失败',
                            content: "你可以尝试重新登录或稍后再试",
                            showCancel: false,
                          });
                        } else {
                          that.getList();
                        }
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
    } else {
      wx.navigateTo({
        url: '../user/detail?login=' + e.mark.login,
      });

    }
  }
})