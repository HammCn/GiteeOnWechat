const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    path: "",
    orgInfo: {}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this;
    wx.showLoading({
      title: '数据加载中',
    });
    app.loadFont();
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    app.getUserInfo(function (result) {
      wx.hideLoading();
      if (result) {
        that.getOrgInfo();
      } else {
        app.loginFirst();
      }
    });
  },
  /**
   * 点击修改资料按钮事件
   * @param {object}} e 
   */
  formSubmit: function (e) {
    var that = this;
    wx.showLoading({
      title: '保存中',
    });
    wx.request({
      url: app.config.apiUrl + "api/v5/orgs/" + that.data.path,
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        ...{
          access_token: app.access_token,
          _method: 'patch'
        },
        ...e.detail.value
      },
      success: function (result) {
        wx.hideLoading();
        if (result.data.hasOwnProperty('id')) {
          wx.showModal({
            title: '修改成功',
            content: '组织信息已经修改成功！',
            showCancel: false,
            success: function (res) {
              wx.navigateBack();
            }
          })
        } else {
          wx.showModal({
            title: '保存失败',
            content: result.data.message,
            showCancel: false
          })
        }
      }
    });
  },
  getOrgInfo() {
    var that = this;
    console.log(that.data);

    wx.showLoading({
      title: '获取信息中',
    })
    wx.request({
      url: app.config.apiUrl + "api/v5/orgs/" + that.data.path,
      method: "GET",
      data: {
        access_token: app.access_token,
      },
      success: function (result) {
        wx.hideLoading();
        if (result.data.hasOwnProperty('id')) {
          that.setData({
            orgInfo: result.data
          });
        } else {
          wx.showModal({
            title: '修改失败',
            content: '获取组织信息失败，无法修改',
            showCancel: false,
            success: function () {
              wx.navigateBack();
            }
          })
        }
      }
    });

  },
})