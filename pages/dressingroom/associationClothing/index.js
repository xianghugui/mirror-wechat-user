// pages/dressingroom/associationClothing/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoInfo: null, //视频信息(店铺id，视频id，视频图片Src)
    goodsInfo: null, //商品信息(商品id，商品图片Src)
    disable: false, //按钮禁用
  },

  /**
   * 确认秀衣
   */
  submit: function (e) {
    this.setData({
      disable: true
    })
    var that = this
    var videoId = this.data.videoInfo.videoId;
    var goodsId = this.data.goodsInfo.goodsId;
    getApp().requestFormGet('api/revised/videoAssociationGoods/' + videoId + '/' + goodsId,
      {},
      function (res) {
        that.setData({
          disable: false
        })
        wx.redirectTo({
          url: '../index?navigationBar=false',
        })
      }
    )
  },

  /**
   * 选择商品
   */
  selectGoods: function (e) {
    var videoInfo = this.data.videoInfo;
    videoInfo.videoImageUrl = encodeURIComponent(videoInfo.videoImageUrl);
    if(this.data.goodsInfo !== null){
      videoInfo.goodsId = this.data.goodsInfo.goodsId;
    }
    wx.redirectTo({
      url: 'selectGoods/index?videoInfo=' + JSON.stringify(videoInfo),
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var videoInfo = JSON.parse(options.videoInfo);
    videoInfo.videoImageUrl = decodeURIComponent(videoInfo.videoImageUrl);
    this.setData({
      videoInfo: videoInfo,
      disable: videoInfo.goodsId === null || videoInfo.goodsId < 0 ? false : true
    })
    if (options.goodsInfo) {
      var goodsInfo = JSON.parse(options.goodsInfo);
      this.setData({
        goodsInfo: goodsInfo,
        disable: videoInfo.goodsId === goodsInfo.goodsId ? true : false
      })
    }
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

  },
})