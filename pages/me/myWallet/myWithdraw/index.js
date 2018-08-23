// pages/myWithdraw/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status:0,
    withdrawList: [],
    total: 0,
    pageSize: 10
  },
  lower: function (e) {
    if (this.data.withdrawList.length == this.data.total) {
      wx.showToast({
        title: '暂无更多数据',
        icon: 'none',
        duration: 1000
      })
      return
    }
    this.getWithdraw()
  },
  getWithdraw: function () {
    const that = this
    var param = {
      pageIndex: this.data.withdrawList.length,
      pageSize: this.data.pageSize
    }
    getApp().requestGet('api/user/queryGetMoney', param, getApp().globalData.header,
      function (res) {
        if(res.data.data.total == 0){
          return
        }
        var data = that.data.withdrawList
        that.setData({
          withdrawList: data.concat(res.data.data.data),
          total: res.data.data.total
        })
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
    this.getWithdraw()
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