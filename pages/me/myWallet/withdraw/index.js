// pages/me/myWallet/withdraw/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    earn: 0,
    price: 0
  },
  submit: function(e) {
    const _self = this;
    if ((this.data.earn - e.detail.value.price) < 0) {
      this.showMessage('超出可用余额')
      return
    } else if (e.detail.value.price == 0) {
      this.showMessage('请输入提现金额')
      return
    } else if (e.detail.value.price < 1 || e.detail.value.price > 2000) {
      this.showMessage('提现金额大于1小于2000')
      return
    }
    getApp().requestPost('api/user/insertGetMoney/' + e.detail.value.price + '/微信', {}, getApp().globalData.header,
      function(res) {
        const wxCurrPage = getCurrentPages(); //:获取当前页面的页面栈
        const wxPrevPage = wxCurrPage[wxCurrPage.length - 2]; //:获取上级页面的page对象
        var earn = _self.data.earn - e.detail.value.price;
        wxPrevPage.setData({
          earn: earn
        });
        wx.navigateBack({
          delta: 1
        })
        wx.showToast({
          title: '提现成功',
          icon: 'success',
          duration: 1000
        })
      })
  },
  showMessage: function(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      earn: options.earn
    })
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