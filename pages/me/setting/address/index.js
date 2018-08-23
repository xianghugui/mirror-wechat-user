// pages/me/setting/address/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: null
  },

  //选择地址
  selectAddress: function (e) {
    const that = this;
    var addressId = e.currentTarget.dataset.id;
    var addressList = this.data.addressList;
    for (let i = 0; i < addressList.length; i++) {
      addressList[i].selected = false;
      if (addressList[i].uId == addressId) {
          addressList[i].selected = true;
      }
    }
    const wxCurrPage = getCurrentPages();//获取当前页面的页面栈
    const wxPrevPage = wxCurrPage[wxCurrPage.length - 2];//获取上级页面的page对象
    if (wxPrevPage.route == "pages/confirmOrder/index") {
      //修改上级页面的数据
      wxPrevPage.setData({
        addressId: addressId,//addressId为上级页面的某个数据
      })
    }
    this.setData({
      addressList: addressList
    });
  },
  radioChange: function (e) {
    var addressList = this.data.addressList
    for (let i = 0; i < addressList.length; i++) {
      addressList[i].checked = false
      if (addressList[i].uId == e.detail.value) {
        addressList[i].checked = true
      }
    }
    this.setData({
      addressList: addressList,
      time: Date.parse(new Date())
    })
    getApp().requestPost('api/user/insertAddress/' + e.detail.value,
      { "status": 1 }, getApp().globalData.header,
      function (res) {
        wx.showToast({
          title: '已设为默认地址',
          icon: 'success',
          duratin: 1000,
        })
      });
  },
  editBind: function (e) {
    var address = this.data.addressList[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: '../editaddress/index?address=' + JSON.stringify(address)
    })
  },
  delBind: function (e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定删除么？',
      success: function (res) {
        if (res.confirm) {
          //执行删除
          var addressList = that.data.addressList
          addressList.splice([e.currentTarget.dataset.index], 1)
          that.setData({
            addressList: addressList
          })
          getApp().requestPut('api/user/deleteAddress/' + e.currentTarget.dataset.addressid, null, getApp().globalData.header,
            function (res) {
              wx.showToast({
                title: '地址已删除',
                icon: 'success',
                duration: 1000
              })
            })
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    var that = this
    var header = getApp().globalData.header
    getApp().requestGet('api/goods/queryAllUserAddress/0', null,
      getApp().globalData.header,
      function (res) {
        var data = res.data.data
        for (let i = 0; i < data.length; i++) {
          data[i].address = data[i].address.replace(/,/g, ' ')
          if (data[i].status == 1) {
            data[i].checked = true
          }
          data[i].selected = false;
        }
        that.setData({
          addressList: data
        })
      });
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