// pages/refundOrder/index.js
var app = getApp();
//引入公共模块文件
var common = require('../template/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //退款单状态，0:申请退货退款 1：退货中 2：商家确认收货  3:完成退款请求 4：退款请求关闭（用户操作)
    title: [{
      name: '购物单',
      checked: true
    }, {
      name: '询价单',
    }],
    status: ['待退货', '退货中', '退款中', '完成退款', '请求关闭'],
    pageSize: 10,
    orderList: [],
    total: null,
    //标记状态
    index: 0,
    nowDate: null, //用来和提醒时间比较，用户一天之内不能重复提醒
    refresh: true, //加载图标的显示
  },

  //点击导航栏
  titleClick: function(e) {
    var data = this.data.title
    var index = e.currentTarget.dataset.index
    for (let i = 0; i < data.length; i++) {
      data[i].checked = false
    }
    data[index].checked = true
    this.setData({
      index: index,
      title: data,
      orderList: []
    })
    //调用查询接口
    this.getOrder(index + 1)
  },


  cancel: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index
    wx.showModal({
      title: '提示',
      content: '确定要取消订单么',
      success: function(res) {
        if (res.confirm) {
          common.cancelRefund(e.currentTarget.dataset.id);
          var orderList = that.data.orderList;
          orderList.splice(index, 1);
          that.setData({
            orderList: orderList
          });
        }
      }
    })
  },


  //退货
  gotoRefund: function(e) {
    var data = this.data.orderList[e.currentTarget.dataset.index]
    common.jumpRefundAddress(data.refundId, data.type, './delivery/');
  },


  //获取订单
  getOrder: function(orderType) {
    var that = this
    var param = {
      pageIndex: that.data.orderList.length,
      pageSize: that.data.pageSize
    }
    getApp().requestGet('api/clientrefund/showClientRefund/' + orderType, param, getApp().globalData.header,
      function(res) {
        var data = res.data.data
        var orderList = that.data.orderList
        that.setData({
          refresh: true,
          orderList: orderList.concat(data.data),
          total: data.total,
          nowDate: parseInt(new Date().getTime() / 1000) - 259200000
        })
      });
  },

  //提醒发货
  shipment: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    var status = e.currentTarget.dataset.status;
    var showPrompt = '';
    app.requestFormGet('api/refundexchange/' + e.currentTarget.dataset.id +
      '/showRefundsInfo', {
        orderType: this.data.orderList[index].type
      },
      function(res) {
        var orderInfo = res.data.data
        common.refundReceipt(orderInfo.phone, orderInfo.name, orderInfo.applicationTime, orderInfo.refundId,
          function() {
            app.requestFormPut('api/clientrefund/clientRemindTime', {
                id: orderInfo.refundId
              },
              function(res) {
                wx.showToast({
                  title: '已提醒商家发货',
                  icon: 'none'
                })
                var data = that.data.orderList
                data[index].remindTime = parseInt(new Date().getTime() / 1000)
                that.setData({
                  orderList: data
                })
              })
          },
          function() {

          });
      })
  },

  //跳转详情页面
  jumpOrderInfo: function(e) {
    var goodsList = this.data.orderList[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: './orderInfo/index?orderId=' + e.currentTarget.dataset.id + '&size=' + goodsList.size + '&num=' + goodsList.num + '&imageSrc=' + goodsList.imageSrc + '&goodsName=' + goodsList.goodsName + '&orderType=' + this.data.index + '&index=' + e.currentTarget.dataset.index + '&color=' + goodsList.color
    })
  },

  //上拉加载数据
  lower: function() {
    if (this.data.orderList.length < this.data.total) {
      this.getOrder(this.data.index + 1);
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var data = this.data.title,
      index;
    if (typeof options.index == 'undefined') {
      index = 0;
    } else {
      index = parseInt(options.index);
    }
    for (let i = 0; i < data.length; i++) {
      data[i].checked = false
    }
    data[index].checked = true
    this.setData({
      index: index,
      title: data,
      orderList: []
    })
    //调用查询接口
    this.getOrder(index+1)
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