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
    type: 'mine',
    login: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    if (e.other) {
      this.setData({
        type: 'friends',
        login: app.userInfo.login
      });
      wx.setNavigationBarTitle({
        title: '好友动态'
      });
    } else if (e.login) {
      this.setData({
        type: 'user',
        login: e.login
      });
      wx.setNavigationBarTitle({
        title: '用户动态'
      });
    } else {
      this.setData({
        type: 'mine',
        login: app.userInfo.login
      });
      wx.setNavigationBarTitle({
        title: '我的动态'
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
  itemClick: function (e) {
    var that = this;
    var menuList = [];
    if (that.data.type == 'friends') {
      menuList = [
        '进入仓库', '用户信息'
      ];
    } else {
      menuList = ['进入仓库'];
    }
    // console.log(e.mark.type);
    // console.log(e.mark.payload);
    switch (e.mark.type) {
      case 'PushEvent':
        menuList.push('查看提交');
        break;
      case 'IssueCommentEvent':
        menuList.push('查看Issue评论');
        break;
      case 'IssueEvent':
        menuList.push('查看Issue');
        break;
      case 'PullRequestEvent':
        menuList.push('查看PullRequest');
        break;
      default:
    }
    var pathArray = e.mark.repo.split('/');
    wx.showActionSheet({
      itemList: menuList,
      success: function (res) {
        switch (menuList[res.tapIndex]) {
          case "进入仓库":
            wx.navigateTo({
              url: '../repos/detail?namespace=' + pathArray[0] + "&path=" + pathArray[1],
            })
            break;
          case "用户信息":
            wx.navigateTo({
              url: '../user/detail?login=' + e.mark.login,
            })
            break;
          case "查看提交":
            wx.navigateTo({
              url: '../commits/detail?hash=' + e.mark.payload.after + '&namespace=' + pathArray[0] + "&path=" + pathArray[1],
            })
            break;
          case "查看Issue评论":
            wx.navigateTo({
              url: '../issues/detail?number=' + e.mark.payload.issue.number + '&namespace=' + pathArray[0] + "&path=" + pathArray[1],
            })
            break;
          case "查看Issue":
            wx.navigateTo({
              url: '../issues/detail?number=' + e.mark.payload.number + '&namespace=' + pathArray[0] + "&path=" + pathArray[1],
            })
            break;
          case "查看PullRequest":
            wx.navigateTo({
              url: '../requests/commits?number=' + e.mark.payload.number + '&namespace=' + pathArray[0] + "&path=" + pathArray[1],
            })
            break;
          default:
        }
      }
    })
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
    var url = app.config.apiUrl + "api/v5/users/" + that.data.login + "/events";
    switch (that.data.type) {
      case 'friends':
        url = app.config.apiUrl + "api/v5/users/" + that.data.login + "/received_events";
        break;
      case 'user':
        url = app.config.apiUrl + "api/v5/users/" + that.data.login + "/events/public";
        break;
      default:
    }
    wx.request({
      url: url,
      method: "POST",
      data: {
        access_token: app.access_token,
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