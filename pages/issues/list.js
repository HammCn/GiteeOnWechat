const app = getApp()

/**
 * 页面的初始数据
 */
Page({
  data: {
    namespace: "",
    path: "",
    type: 'mine',
    filter_value: "all",
    filter_name: "我全部的",
    filterList: [{
        "filter_name": "我全部的",
        "filter_value": "all"
      },
      {
        "filter_name": "我创建的",
        "filter_value": "created"
      },
      {
        "filter_name": "我负责的",
        "filter_value": "assigned"
      }
    ],
    state_value: "all",
    state_name: "所有进程",
    stateList: [{
      "state_name": "所有进程",
      "state_value": "all"
    }, {
      "state_name": "已开启的",
      "state_value": "open"
    }, {
      "state_name": "进行中的",
      "state_value": "progressing"
    }, {
      "state_name": "已完成的",
      "state_value": "closed"
    }, {
      "state_name": "已拒绝的",
      "state_value": "rejected"
    }],
    order_value: "desc",
    order_name: "倒序排列",
    orderList: [{
        order_value: "desc",
        order_name: "倒序排列",
      },
      {
        order_value: "asc",
        order_name: "升序排列",
      }
    ],
    sort_value: "created",
    sort_name: "创建时间",
    sortList: [{
        sort_value: "created",
        sort_name: "创建时间",
      },
      {
        sort_value: "updated",
        sort_name: "更新时间",
      }
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
    if (e.namespace && e.path) {
      that.setData({
        namespace: e.namespace,
        path: e.path,
        type: 'repo'
      });
      wx.setNavigationBarTitle({
        title: '仓库的Issue',
      })
    }
    wx.showLoading({
      title: '数据加载中',
    });
  },
  /**
   * 页面显示事件
   */
  onShow: function () {
    var that = this;
    app.getUserInfo(function (result) {
      if (result) {
        that.getList(false);
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
    console.log(e.mark);
    var that = this;
    wx.showActionSheet({
      itemList: [
        '查看Issue',
        '进入仓库',
        '查看用户',
        '修改状态',
        '评论Issue',
        '删除Issue',
      ],
      success: function (res) {
        switch (res.tapIndex) {
          case 1:
            wx.navigateTo({
              url: '../repos/detail?namespace=' + e.mark.repo.namespace.path + "&path=" + e.mark.repo.path,
            })
            break;
          case 2:
            wx.navigateTo({
              url: '../user/detail?login=' + e.mark.user.login,
            })
            break;
          default:
            wx.showToast({
              title: '即将上线'
            });
        }
      }
    });
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
    var url = app.config.apiUrl + "api/v5/user/issues";
    switch (that.data.type) {
      case 'repo':
        url = app.config.apiUrl + "api/v5/repos/" + that.data.namespace + "/" + that.data.path + "/issues";
        break;
      default:
    }
    that.isGetingData = true;
    wx.request({
      url: url,
      method: "POST",
      data: {
        access_token: app.access_token,
        filter: that.data.filter_value,
        state: that.data.state_value,
        sort: that.data.sort_value,
        direction: that.data.order_value,
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
  },
  /**
   * 选择器更改事件
   * @param {object} e 
   */
  filterChanged: function (e) {
    var that = this;
    var menuList = [];
    for (var i in that.data.filterList) {
      menuList.push(that.data.filterList[i].filter_name);
    }
    wx.showActionSheet({
      itemList: menuList,
      success: function (ret) {
        that.setData({
          filter_name: that.data.filterList[ret.tapIndex].filter_name,
          filter_value: that.data.filterList[ret.tapIndex].filter_value,
          page: 1,
        });
        that.getList();
      }
    });
  },
  /**
   * 选择器更改事件
   * @param {object} e 
   */
  stateChanged: function (e) {
    var that = this;
    var menuList = [];
    for (var i in that.data.stateList) {
      menuList.push(that.data.stateList[i].state_name);
    }
    wx.showActionSheet({
      itemList: menuList,
      success: function (ret) {
        that.setData({
          state_name: that.data.stateList[ret.tapIndex].state_name,
          state_value: that.data.stateList[ret.tapIndex].state_value,
          page: 1,
        });
        that.getList();
      }
    });
  },
  /**
   * 选择器更改事件
   * @param {object} e 
   */
  sortChanged: function (e) {
    var that = this;
    var menuList = [];
    for (var i in that.data.sortList) {
      menuList.push(that.data.sortList[i].sort_name);
    }
    wx.showActionSheet({
      itemList: menuList,
      success: function (ret) {
        that.setData({
          sort_name: that.data.sortList[ret.tapIndex].sort_name,
          sort_value: that.data.sortList[ret.tapIndex].sort_value,
          page: 1,
        });
        that.getList();
      }
    });
  },
  /**
   * 选择器更改事件
   * @param {object} e 
   */
  orderChanged: function (e) {
    var that = this;
    var menuList = [];
    for (var i in that.data.orderList) {
      menuList.push(that.data.orderList[i].order_name);
    }
    wx.showActionSheet({
      itemList: menuList,
      success: function (ret) {
        that.setData({
          order_name: that.data.orderList[ret.tapIndex].order_name,
          order_value: that.data.orderList[ret.tapIndex].order_value,
          page: 1,
        });
        that.getList();
      }
    });
  }
})