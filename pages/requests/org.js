const app = getApp()

/**
 * 页面的初始数据
 */
Page({
  data: {
    path: "",
    state_value: "all",
    //分页开始
    page: 1,
    isGetingData: false,
    list: [],
  },
  stateChanged: function (e) {
    this.setData({
      state_value: e.mark.state,
      page: 1
    });
    this.getList();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this;
    app.loadFont();
    wx.showLoading({
      title: '数据加载中',
    });
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
  showMenu: function (e) {
    var that = this;
    var menuList = [
      '变更记录'
    ];
    switch (e.mark.state) {
      case 'open':
        menuList = ['变更记录', '合并请求'];
        break;
      default:
    }
    wx.showActionSheet({
      itemList: menuList,
      success: function (res) {
        switch (menuList[res.tapIndex]) {
          case '合并请求':
            if (!e.mark.mergeable) {
              wx.showModal({
                title: '无法自动合并',
                content: '该PullRequest存在冲突，请手动合并！',
                showCancel: false,
                success: function (res) {}
              });
              return;
            }
            wx.showModal({
              title: '合并请求',
              content: '你是否确认已查看过变更记录后合并这个请求？',
              showCancel: true,
              confirmText: "合并",
              cancelText: "取消",
              success(res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: '正在合并请求',
                  });
                  wx.request({
                    url: app.config.apiUrl + "api/v5/repos/" + that.data.namespace + "/" + that.data.path + "/pulls/" + e.mark.number + "/merge",
                    method: "PUT",
                    header: {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    data: {
                      access_token: app.access_token,
                    },
                    success: function (result) {
                      wx.hideLoading();
                      if (!result.data.hasOwnProperty("sha")) {
                        wx.showModal({
                          title: '合并失败',
                          content: result.data.message,
                          showCancel: false,
                        });
                      } else {
                        wx.showModal({
                          title: '合并成功',
                          content: '这个Pull Request自动合并成功！',
                          showCancel: false,
                          success: function (res) {
                            that.getList();
                          }
                        });
                      }
                    }
                  });
                }
              }
            });
            break;
          case '变更记录':
            wx.navigateTo({
              url: "../requests/commits?namespace=" + that.data.namespace + "&path=" + that.data.path + "&number=" + e.mark.number,
            })
            break;
          default:
        }
      }
    });
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
    var url = app.config.apiUrl + "api/v5/repos/" + that.data.namespace + "/" + that.data.path + "/pulls";
    var postData = {
      access_token: app.access_token,
      state: that.data.state_value,
      page: that.data.page,
    };
    that.isGetingData = true;
    wx.request({
      url: url,
      method: "GET",
      data: postData,
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
  onShareAppMessage: function (res) {}
})