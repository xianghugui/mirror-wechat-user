// pages/dressingroom/index.js
var common = require('../template/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isActionCollapse: false,
    items: [],
    pageIndex: 0,
    pageSize: 8,
    total: null,
    navigationBar: true, //true：我的试衣库， false我的试衣秀
    videoShowList: [], // 试衣秀
    videoShowTotal: null, // 试衣秀总数
    refresh: true, //加载图标的显示
    deleteIndex: null
  },

  /**
   * 人脸识别
   */
  facehandle: function(e) {
    wx.navigateTo({
      url: '../faceRetrieval/index',
    })
  },

  /**
   * 我的试衣库
   */
  leftTabbar: function(e) {
    this.setData({
      items: [],
      deleteIndex: null,
      navigationBar: true
    })
    this.queryVideoList();
  },
  /**
   * 我的试衣秀
   */
  rightTabbar: function(e) {
    this.setData({
      videoShowList: [],
      navigationBar: false
    })
    this.getUserVideoShow()
  },
  /**
   * 加载试衣秀
   */
  getUserVideoShow: function(e) {
    var that = this
    var param = {
      pageIndex: this.data.videoShowList.length,
      pageSize: this.data.pageSize
    }
    getApp().requestFormGet('api/revised/userVideoShowList', param,
      function(res) {
        var videoShowList = that.data.videoShowList
        var data = res.data.data.data;
        that.setData({
          refresh: true,
          videoShowList: videoShowList.concat(data),
          videoShowTotal: res.data.data.total
        })
      })
  },

  /**
   * 查询视频列表
   */
  queryVideoList: function() {
    var that = this
    var param = {
      pageIndex: that.data.items.length,
      pageSize: that.data.pageSize
    }
    getApp().requestGet('api/video/queryUserVideo',
      param, getApp().globalData.header,
      function(res) {
        var items = that.data.items;
        var data = res.data.data.data;
        that.setData({
          items: items.concat(data),
          total: res.data.data.total
        })
      });
  },

  /**
   * 我的试衣秀下拉刷新
   */
  videoShowLower: function(e) {
    if (this.data.videoShowList.length < this.data.videoShowTotal) {
      this.setData({
        refresh: false,
      })
      this.getUserVideoShow();
    }
  },

  //长按删除视频
  showDeleteIcon: function(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      deleteIndex: index
    });
  },

  bindTouchStart: function(e) {
    this.startTime = e.timeStamp;
  },

  bindTouchEnd: function(e) {
    this.endTime = e.timeStamp;
  },

  /**
   * 进入我试衣秀
   */
  toMyVideoShow: function(e) {
    var allVideoArray = this.data.videoShowList,
      pageType = 0;
    allVideoArray = common.recodeForURL(allVideoArray);
    wx.navigateTo({
      url: '../fittingShow/fittingShowInfo/index?allVideoArray=' +
        JSON.stringify(allVideoArray) + '&index=' + e.currentTarget.dataset.index,
    })
  },

  /**
   * 进入我试衣库
   */

  toMyVideoKu: function(e) {
    //判断是否是长按
    if (this.endTime - this.startTime < 350 && this.data.deleteIndex == null) {
      var allVideoArray = this.data.items,
        pageType = 1;
      allVideoArray = common.recodeForURL(allVideoArray);
      wx.navigateTo({
        url: '../fittingShow/fittingStoreInfo/index?allVideoArray=' +
          JSON.stringify(allVideoArray) + '&index=' + e.currentTarget.dataset.index,
      })
    }
  },

  /**
   * 取消删除
   */

  cancelDelete: function() {
    if (this.data.deleteIndex != null) {
      var index = this.data.deleteIndex;
      this.setData({
        deleteIndex: null
      });
    }
  },

  deleteVideo: function() {
    const that = this;
    var index = this.data.deleteIndex;
    var items = that.data.items;
    getApp().requestDel('api/video/' + items[index].videoId, null,
      getApp().globalData.header,
      function() {
        items.splice(index, 1);
        that.setData({
          items: items
        });
        wx.showToast({
          title: '已删除',
          icon: 'success',
          duration: 1000
        })
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (typeof options.navigationBar !== 'undefined'){
      this.setData({ navigationBar: false})
      this.getUserVideoShow();
    }else{
      this.queryVideoList();
    }
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

  },
  /**
   * 用户分享
   */
  onShareAppMessage: function() {

  }
})