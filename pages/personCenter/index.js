// pages/personCenter/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 分享视频信息
    shareVideo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;

    if (options.videoName !== null) {
      //从二维码中获取视频名称
      var videoName = decodeURIComponent(options.videoName);
      //加载视频信息
      getApp().requestGet('api/video/video/' + videoName,{},{},function(res){
          if(res != null){
            that.setData({
              shareVideo:res.data.data[0]
            });
          }
      });
    } else {
      wx.showToast({
        title: '加载失败',
        icon:'none'
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    const that = this.data.shareVideo;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '衣魅欧',
      path: 'pages/index/index?shopName='+that.name,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '转发成功',
          icon: 'none'
        })
      },
      fail: function (res) {
        // 转发失败
        wx.showToast({
          title: '转发失败',
          icon:'none'
        })
      }
    }
  }
})