// pages/mywallet/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    earn: 0,
    tradingRecord: [], //交易类型(0: 付款，1：退款，2：收益，3：返现，4：提现)
    total: 0,
    transactionType: ['付款', '退款', '收益', '返现', '提现'],
    hideRefreshStatus: true
  },

  /**
   * 下拉加载
   */
  lower: function(e) {
    if (this.data.tradingRecord.length < this.data.total) {
      this.setData({
        hideRefreshStatus: false,
      })
      this.loadTransactionRecord();
    }
  },

  /**
   * 获取交易记录
   */
  loadTransactionRecord: function() {
    var that = this;
    var tradingRecord = this.data.tradingRecord;
    var param = {
      pageIndex: tradingRecord.length,
      pageSize: 10
    };
    getApp().requestFormGet('api/user/transactionRecord', param,
      function(res) {
        if (res.data.data.data.length > 0) {
          that.setData({
            hideRefreshStatus: true,
            tradingRecord: tradingRecord.concat(res.data.data.data.data),
            total: res.data.data.data.total,
            earn: res.data.data.earn
          })
        }
      }
    );
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadTransactionRecord();
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