// pages/message/messageInfo/index.js
//引入公共模块文件
var common = require('../../template/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messageInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var messageId = options.messageId
    const _self = this;
    getApp().requestFormGet('api/message/queryMessageInfo/'+options.messageId,{},function(e){
      var messageInfo = e.data.data;
      messageInfo.content = common.textParsing(messageInfo.content);
      messageInfo.createTime = common.formatDateTime(messageInfo.createTime);
        _self.setData({
          messageInfo: messageInfo
        });
    });
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})