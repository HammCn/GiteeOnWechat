const app = getApp()
/**
 * 页面的初始数据
 */
Page({
  data: {
    path: "",
    isMaster: 0,
    myInfo: {
      role: ""
    },
    orgInfo: {
      avatar_url: "../../res/image/logo.png",
      name: "组织名称",
      description: "一句话描述这个组织",
      members: 0,
      public_repos: 0,
      private_repos: 0
    }
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
  onShow: function () {
    this.getOrgInfo();
  },
  getOrgInfo: function () {
    var that = this;
    var url = app.config.apiUrl + "api/v5/orgs/" + that.data.path;
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
          that.setData({
            orgInfo: result.data
          });
          that.getMyInfo();
        }
      }
    });
  },
  exitOrg() {
    var that = this;
    wx.showModal({
      title: '退出组织',
      content: '是否确认退出当前组织?',
      showCancel: true,
      confirmText: "退出",
      confirmColor: "#ff4500",
      cancelText: "返回",
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在退出',
          })
          var url = app.config.apiUrl + "api/v5/user/memberships/orgs/" + that.data.path;
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
                  title: '退出失败',
                  content: "组织所有者无法退出组织！",
                  showCancel: false,
                });
              } else {
                wx.showModal({
                  title: '退出成功',
                  content: '你已经成功退出组织' + that.data.orgInfo.name,
                  showCancel: false,
                  confirmText: "返回",
                  success(res) {
                    wx.navigateBack();
                  }
                });
              }
            }
          });

        }
      }
    });
  },
  getMyInfo() {
    var that = this;
    var url = app.config.apiUrl + "api/v5/user/memberships/orgs/" + that.data.path;
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
          var isMaster = 0;
          if (result.data.role == 'admin') {
            isMaster = 1;
          }
          that.setData({
            myInfo: result.data,
            isMaster: isMaster
          });
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
      title: "我在码云上发现一个叫" + that.data.orgInfo.name + "的组织...",
      path: '/pages/orgs/index?path=' + that.data.path
    }
  }
})