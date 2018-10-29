


//app.js
var JMCommon = require('utils/JMCommon.js');
App({
  BASE_URL: 'https://mirror.lmlm.cn/',
  // BASE_URL: 'http://localhost:8080/',
  globalData: {
    header: {
      'Cookie': ''
    },
    userId: null,
    appId: 'wxd93e04f3989aad51',
    key: '0528YIMEIOU1425mirrorZXWL2018318',
    hasUnread: false, //是否有未读消息
    userLat: '', //经度
    userLon: '', //纬度
    userAuthorization: false
  },
  requestGet: function(url, data, header, successCallback, failCallback) {
    this.requestMethod(url, 'GET', data, header, successCallback, failCallback)
  },
  requestFormGet: function(url, data, successCallback, failCallback) {
    this.requestMethod(url, 'GET', data, {
        Cookie: this.globalData.header.Cookie,
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCallback, failCallback)
  },
  requestPost: function(url, data, header, successCallback, failCallback) {
    this.requestMethod(url, 'POST', data, this.globalData.header, successCallback, failCallback)
  },
  requestFormPost: function(url, data, successCallback, failCallback) {
    this.requestMethod(url, 'POST', data, {
        Cookie: this.globalData.header.Cookie,
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCallback, failCallback)
  },
  requestDel: function(url, data, header, successCallback, failCallback) {
    this.requestMethod(url, 'DELETE', data, header, successCallback, failCallback)
  },
  requestPut: function(url, data, header, successCallback, failCallback) {
    this.requestMethod(url, 'PUT', data, header, successCallback, failCallback)
  },
  requestFormPut: function(url, data, successCallback, failCallback) {
    this.requestMethod(url, 'PUT', data, {
        Cookie: this.globalData.header.Cookie,
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCallback, failCallback)
  },
  requestMethod: function(url, method, data, header, successCallback, failCallback) {
    var that = this
    wx.request({
      url: that.BASE_URL + url,
      data: data,
      method: method,
      header: header,
      complete: function(res) {
        if (res.data.success) {
          successCallback && successCallback(res)
        } else {
          if (failCallback) {
            failCallback(res)
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }
      }
    })
  },

  //授权
  userAuthorization: function() {
    const _self = this;
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          _self.globalData.userAuthorization = true
        }
      }
    })
  },

  registered: function(data, successCallback) {
    const that = this
    // 登录
    wx.login({
      success: res => {
        var that = this
        data.code = res.code
        that.requestPut('api/user/registered', data, {
          'content-type': 'application/x-www-form-urlencoded'
        }, function(res) {
          that.globalData.header.Cookie = 'JSESSIONID=' + res.data.data.session;
          that.globalData.userId = res.data.data.userId
          console.log('已登录')
          JMCommon.JMinit(that.globalData.userId);
          successCallback && successCallback(res);
        })
      }
    })
  },

  onLaunch: function() {
    var that = this
    setInterval(function() {
      wx.login({
        success: res => {
          that.requestPut('api/user/registered', {
            code: res.code
          }, {
            'content-type': 'application/x-www-form-urlencoded'
          }, function(res) {
            that.globalData.header.Cookie = 'JSESSIONID=' + res.data.data.session;
          })
        }
      })
    }, 300000);
    this.userAuthorization();
  },



})