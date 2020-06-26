const app = getApp()

/**
 * 页面的初始数据
 */
Page({
  data: {
    path: "",
    type_value: "all",
    type_name: "全部仓库",
    typeList: [{
        "type_name": "全部仓库",
        "type_value": "all"
      },
      {
        "type_name": "公开仓库",
        "type_value": "public"
      },
      {
        "type_name": "私有仓库",
        "type_value": "private"
      },
    ],
    //分页开始
    page: 1,
    isGetingData: false,
    list: []
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
    if (e.type) {
      switch (e.type) {
        case 'public':
          that.setData({
            type_value: "public",
            type_name: "公开仓库"
          });
          break;
        case 'private':
          that.setData({
            type_value: "private",
            type_name: "私有仓库"
          });
          break;
        default:
      }
    }
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
  /**
   * 查询数据
   * @param {object} e 
   */
  search: function (e) {
    this.getList();
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
    wx.request({
      url: app.config.apiUrl + "api/v5/orgs/" + that.data.path + "/repos",
      method: "GET",
      data: {
        access_token: app.access_token,
        type: that.data.type_value,
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
  /**
   * 选择器更改事件
   * @param {object} e 
   */
  typeChanged: function (e) {
    var that = this;
    var menuList = [];
    for (var i in that.data.typeList) {
      menuList.push(that.data.typeList[i].type_name);
    }
    wx.showActionSheet({
      itemList: menuList,
      success: function (ret) {
        that.setData({
          type_name: that.data.typeList[ret.tapIndex].type_name,
          type_value: that.data.typeList[ret.tapIndex].type_value,
          page: 1,
        });
        that.getList();
      }
    });
  }
})