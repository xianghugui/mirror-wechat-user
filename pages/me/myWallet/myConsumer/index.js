// pages/myConsumer/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curIndex:0,
    consumerList: [],
    pageSize: 8,
    total: 0
  },
  // 标签切换
  tabhandle: function (e) {
    var curIndex = e.currentTarget.id;
    this.setData({
      curIndex: curIndex,
      consumerList: []
    });
    this.getConsumer(this.data.curIndex)
  },
  gotoProductDetail: function (e) {
    wx.navigateTo({
      url: '../../../productDetail/index?goodsId=' + e.currentTarget.dataset.goodsid
    })
  },
  getConsumer: function (consumerType) {
    var param = {
      pageIndex: this.data.consumerList.length,
      pageSize: this.data.pageSize
    }
    const that = this
    getApp().requestGet('api/user/queryUserConsume/' + consumerType,
      param, getApp().globalData.header,
      function (res) {
        if (res.data.data.total == 0) {
          return
        }
        var data = that.data.consumerList
        that.setData({
          consumerList: data.concat(res.data.data.data),
          total: res.data.data.total
        })
      })
  },
  upper: function (e) {
    this.setData({
      consumerList: []
    });
    this.getConsumer(this.data.curIndex)
  },
  lower: function (e) {
    this.getConsumer(this.data.curIndex)
  },
  /**
   * 
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getConsumer(0)
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