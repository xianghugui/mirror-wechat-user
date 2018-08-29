// pages/me/setting/editaddress/index.js
// 引入SDK核心类
var QQMapWX = require('../../../../static/qqmap/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    uId: null,
    address: [],
    addressInfo: null,
    phone: null,
    name: null,
    status: 0
  },
  bindRegionChange: function (e) {
    this.setData({
      address: e.detail.value
    })
  }, 
  switchChange: function (e) {
    this.setData({
      status: e.detail.value ? 1 : 0
    })
  },

  formSubmit: function (e) {
    var data = e.detail.value;
    var reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (data.userName.replace(/\s+/g, '') == ''){
      this.showMessage('请填写收货人')
      return
    }
    if (data.phone.replace(/\s+/g, '') == '') {
      this.showMessage('请填写联系电话')
      return
    }
    if (!reg.test(data.phone)) {
      this.showMessage('请填写11位正确的电话号码')
      return
    }
    if (data.address.length == 0) {
      this.showMessage('请选择地区')
      return
    }
    if (data.addressInfo.replace(/\s+/g, '') == '') {
      this.showMessage('请填写详细地址')
      return
    }
    data.address = data.address[0] + ',' + data.address[1] + ',' + data.address[2] + ',' + data.addressInfo;
    data.status = this.data.status;
    delete data.addressInfo
    var url = 'api/user/insertAddress'
    if(this.data.uId != null){
      url = 'api/user/updateAddress/' + this.data.uId
    }
    // 调用腾讯地图接口，根据地址解析经纬度
    qqmapsdk.geocoder({
      address: data.address.replace(/,/g, ''),
      success: function (res) {
        data.longtitude = res.result.location.lng;
        data.laltitude = res.result.location.lat;
      },
      complete: function (res) {
        getApp().requestPost(url, JSON.stringify(data),
          getApp().globalData.header,
          function (res) {
            wx.navigateBack({
              delta: 1
            })
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1000
            })
          })
      }
    });
  },
  showMessage: function(message){
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 1000
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.address != null) {
      wx.setNavigationBarTitle({
        title: '编辑地址'
      })
      var that = this
      var data = JSON.parse(options.address)
      var address = data.address.split(" ")
      that.setData({
        uId: data.uId,
        address: [address[0], address[1], address[2]],
        addressInfo: address[3],
        phone: data.phone,
        name: data.userName,
        status: data.status
      })
    }
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'ZTYBZ-GZZWF-5QFJI-JFLJV-WAE6Q-MQBMV'
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }
})