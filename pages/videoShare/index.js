// pages/videoShare/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoInfo: null,
  },

  /**
   * 返回首页
   */
  goToHome: function(e){
    wx.switchTab({
      url: '../fittingShow/index',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().registered({})
    //查找最后一个"/"
    if(options.q){
      var index = options.q.lastIndexOf("%2F") + 3;
      var videoName = options.q.substr(index);
    }
    var that = this;
    getApp().requestFormGet('api/video/video/' + 20180824173532, {},
    function(res){
      var videoInfo = res.data.data[0];
      videoInfo.address = videoInfo.address.replace(/,/g, '');
      that.setData({
        videoInfo: videoInfo
      })
    })
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

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
    var videoInfo = this.data.videoInfo;
    videoInfo.videoId = videoInfo.uId;
    delete videoInfo.uId;
    videoInfo.videoUrl = videoInfo.md5;
    delete videoInfo.md5;
    videoInfo.videoImageUrl = videoInfo.imgSrc;
    delete videoInfo.imgSrc;
    videoInfo.shopName = videoInfo.name;
    delete videoInfo.name;
    return {
      title: videoInfo.goodsName,
      path: '/pages/fittingShow/fittingStoreInfo/index?videoInfo=' + JSON.stringify(videoInfo),
      // imageUrl: videoInfo.videoImageUrl
    }
  }
})