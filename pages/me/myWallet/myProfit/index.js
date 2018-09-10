// pages/myProfit/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    refresh:true, 
    curIndex: 1, //导航栏
    profitList: [],
    pageSize: 10,
    total: 0,
    totalRecord: 0 //总收益
  },

  // 标签切换
  tabhandle: function(e) {
    var curIndex = e.currentTarget.id;
    this.setData({
      curIndex: curIndex,
      profitList: []
    });
    this.getProfit(e.currentTarget.id)
  },

  gotoProductDetail: function(e) {
    var goodsId = e.currentTarget.dataset.goodsid;
    if (goodsId != null) {
      wx.navigateTo({
        url: '../../../productDetail/index?goodsId=' + goodsId,
      })
    }
  },

  getProfit: function(profitType) {
    var param = {
      pageIndex: this.data.profitList.length,
      pageSize: this.data.pageSize
    }
    const that = this
    getApp().requestGet('api/revised/tradeRecordPagerList/' + this.data.curIndex,
      param, getApp().globalData.header,
      function(res){
        var data = that.data.profitList
        that.setData({
          refresh: true,
          profitList: data.concat(res.data.data.data),
          totalRecord: res.data.data.data[0].totalRecord,
          total: res.data.data.total
        })
      })
  },

  lower: function(e) {
    if (this.data.profitList.length < this.data.total) {
      this.setData({
        refresh: false,
      })
      this.getProfit(this.data.curIndex)
    }
  },

  /**
   * 
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getProfit(1);
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