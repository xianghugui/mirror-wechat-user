// pages/myEvaluate/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userCommentList: [],
    total: null,
    refresh: true, //加载图标的显示
    pageIndex:0
  },

  /**
   * 图片预览
   */
  previewImage: function(e) {
    var imagePath = this.data.userCommentList[e.currentTarget.dataset.index].imagePath;
    var urls = []
    for (let i = 0, length = imagePath.length; i < length; i++) {
      urls.push(imagePath[i].resourceUrl)
    }
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: urls
    })
  },

  getMusicInfo: function() {
    if (this.data.userCommentList.length < this.data.total) {
      this.userCommentBind();
    }
  },
  //分页查询用户评论
  userCommentBind: function() {
    const that = this;
    var param = {
      pageIndex: that.data.pageIndex,
      pageSize: 10
    }
    getApp().requestGet('api/user/userComment', param, getApp().globalData.header, function(res) {
      var contentlistTem = that.data.userCommentList;
      var refresh = that.data.refresh;
      that.setData({
        userCommentList: refresh ?res.data.data.data : contentlistTem.concat(res.data.data.data),
        refresh: true,
        total: res.data.data.total
      })
    });
  },

  //跳转商品详情页
  jumpToGoodsInfo: function(e) {
    wx.navigateTo({
      url: '../productDetail/index?goodsId=' + e.currentTarget.dataset.goodsid,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.userCommentBind();
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var pageIndex = this.data.userCommentList.length;
    if (this.data.userCommentList.length < this.data.total) {
      this.setData({
        refresh: false,
        pageIndex: pageIndex
      })
      this.userCommentBind();
    }
  }
})