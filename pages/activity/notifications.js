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

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    wx.showLoading({
      title: '数据加载中',
    });
    app.loadFont();
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
    var url = app.config.apiUrl + "api/v5/notifications/threads";
    wx.request({
      url: url,
      method: "GET",
      data: {
        access_token: app.access_token,
        page: that.data.page,
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
              list: result.data.list
            });
          } else {
            var _list = that.data.list;
            for (var i = 0; i < result.data.list.length; i++) {
              _list.push(result.data.list[i]);
            }
            that.setData({
              list: _list
            });
          }
          that.setReaded();
        }
      }
    });
  },
  setReaded: function () {
    var url = app.config.apiUrl + "api/v5/notifications/threads";
    wx.request({
      url: url,
      method: "PUT",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        access_token: app.access_token,
      }
    });
  },
  itemClick: function (e) {
    wx.showActionSheet({
      itemList: [
        '查看仓库',
        // '标记已读'
      ],
      success: function (res) {
        switch (res.tapIndex) {
          case 0:
            wx.navigateTo({
              url: '../repos/detail?namespace=' + e.mark.namespace + "&path=" + e.mark.path,
            })
            break;
          case 1:
            wx.showLoading({
              title: '操作中',
            });
            var url = app.config.apiUrl + "api/v5/notifications/threads/" + e.mark.id;
            wx.request({
              url: url,
              method: "POST",
              header: {
                "content-type": "application/x-www-form-urlencoded"
              },
              data: {
                access_token: app.access_token,
                _method: 'patch'
              },
              success: function (result) {
                wx.hideLoading();
                if (result.data.hasOwnProperty("message")) {
                  wx.showModal({
                    title: '标记失败',
                    content: result.data.message,
                    showCancel: false,
                  });
                } else {
                  wx.showToast({
                    title: "标记成功"
                  });
                  that.getList();
                }
              }
            });
            break;
          default:
        }
      }
    })
  }
})