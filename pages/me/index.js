// pages/me/index.js
var JMCommon = require('../../utils/JMCommon.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    earn: 0.00,
    agentNum: 0,
    tryNum: 0,
    showModalStatus: null, //获取用户头像名称授权弹框
    userHeader: null,
    userName: null,
    openId: null,
    hasUnread: false, //是否有未读消息
  },
  gotoMyWallet: function(e) {
    wx.navigateTo({
      url: 'myWallet/index',
    })
  },
  gotoRepresent: function(e) {
    if (this.data.agentNum == 0) {
      wx.navigateTo({
        url: '../gotoRepresent/index',
      })
    } else {
      wx.navigateTo({
        url: '../represent/index',
      })
    }

  },
  gotoTryOrder: function(e) {
    wx.navigateTo({
      url: '../dressingroom/index',
    })
  },
  gotoVideoOrder: function(e) {
    wx.navigateTo({
      url: '../videoOrder/index'
    })
  },
  gotoMyOrder: function(e) {
    wx.navigateTo({
      url: '../myOrder/index'
    })
  },
  gotoRefundOrder: function(e) {
    wx.navigateTo({
      url: '../refundOrder/index'
    })
  },
  getUserInfo: function(e) {
    var data = JSON.parse(e.detail.rawData)
    this.setData({
      showModalStatus: true,
      userHeader: data.avatarUrl,
      userName: data.nickName
    })
    var param = {
      avatar: data.avatarUrl,
      name: data.nickName
    }
    getApp().requestFormPut('api/user/update', param, function() {
      getApp().globalData.userAuthorization = true;
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this;
    getApp().requestGet('api/user/home', null,
      getApp().globalData.header,
      function(res) {
        var data = res.data.data
        that.setData({
          earn: data.earn == null ? 0 : data.earn,
          agentNum: data.agentNum == null ? 0 : data.agentNum,
          tryNum: data.tryNum == null ? 0 : data.tryNum,
          openId: data.openId
        })
        var param = {};
        if (that.data.userHeader != null && data.avatar != that.data.userHeader) {
          param.avatar = that.data.userHeader
        }
        if (that.data.userName != null && data.userName != that.data.userName) {
          param.name = that.data.userName
        }
        if (param.avatar || param.name){
          //更新用户名头像，名称
          getApp().requestFormPut('api/user/update', param);
        }
      }
    );
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.data.showModalStatus === null || !this.data.showModalStatus) {
      getApp().userAuthorization(function() {
        that.setData({
          showModalStatus: true
        })
        wx.getUserInfo({
          lang: 'zh_CN',
          success: function(res) {
            that.setData({
              userHeader: res.userInfo.avatarUrl,
              userName: res.userInfo.nickName
            })
          }
        })
      }, function() {
        that.setData({
          showModalStatus: false
        })
      });
    }
    var hasUnread = getApp().globalData.hasUnread
    this.setData({
      hasUnread: hasUnread
    })
    if (!hasUnread) {
      wx.hideTabBarRedDot({
        index: 3,
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})