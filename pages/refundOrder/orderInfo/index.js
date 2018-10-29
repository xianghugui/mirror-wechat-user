// pages/tryOrder/orderInfo/index.js
var app = getApp();
//引入公共模块文件
var common = require('../../template/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderDeatil: {},
    //退款单状 0:申请退款 1：退货中 2：商家确认收货 3:完成退款请求 4：退款请求关闭（用户操作) 5: 拒绝退款
    buttonList: ['待退货', '退货中', '退款中', '完成退款', '请求关闭', '拒绝退款', '订单已处理'],
    //商品状态
    status: 0,
    nowData: null, //用来和提醒时间比较，用户一天之内不能重复提醒
    index: null //退款列表下标
  },

  //  拒绝退款图片预览
  previewAltImage: function(e) {
    var data = this.data.orderDeatil.altImageSrc
    this.previewImageMethod(data)
  },
  //  申请退款图片预览
  previewImage: function(e) {
    var data = this.data.orderDeatil.imageSrc
    this.previewImageMethod(data)
  },
  //图片预览
  previewImageMethod: function(data) {
    if (data != null) {
      var url = []
      for (let i = 0; i < data.length; i++) {
        url.push(data[i].resourceUrl)
      }
      wx.previewImage({
        urls: url
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var orderId = options.orderId;
    var orderType = options.orderType;
    const that = this;
    getApp().requestGet('api/refundexchange/' + orderId + '/showRefundsInfo', {
      orderType: orderType
    }, {}, function(res) {
      var orderDeatil = res.data.data
      if (options.color !== "undefined") {
        orderDeatil.color = options.color
      }
      orderDeatil.size = options.size
      orderDeatil.num = options.num
      //判断是询价订单,给图片链接解码
      if(orderType === "1"){
        options.imageSrc = decodeURIComponent(options.imageSrc);
      }
      orderDeatil.goodsImage = options.imageSrc
      orderDeatil.goodsName = options.goodsName
      orderDeatil.applicationTimestamp = parseInt(new Date(orderDeatil.applicationTime).getTime() / 1000)
      that.setData({
        index: options.index,
        orderDeatil: orderDeatil,
        status: res.data.data.status,
        nowData: parseInt(new Date().getTime() / 1000) - 259200000
      });
    })
  },

  //取消退款
  cancel: function() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要取消订单么',
      success: function(res) {
        if (res.confirm) {
          common.cancelRefund(that.data.orderDeatil.refundId);
          wx.navigateBack({
            delta: 2,
          })
        }
      }
    })
  },

  //查看退货地址
  jumpToRefundAddress: function() {
    var data = this.data.orderDeatil
    common.jumpRefundAddress(data.refundId, data.type, '../delivery/');
  },

  //提醒收货
  shipment: function(e) {
    var that = this
    var orderDeatil = that.data.orderDeatil;
    app.requestFormGet('api/refundexchange/' + orderDeatil.refundId +
      '/showRefundsInfo', {
        orderType: this.data.orderDeatil.type
      },
      function (res) {
        var orderInfo = res.data.data
        common.refundReceipt(orderInfo.phone, orderInfo.name, orderInfo.applicationTime, orderInfo.refundId,
          function () {
            app.requestFormPut('api/clientrefund/clientRemindTime', {
              id: orderInfo.refundId
            },
              function (res) {
                wx.showToast({
                  title: '已提醒商家确认收货',
                  icon: 'none'
                })
                var data = that.data.orderDeatil
                data.remindTime = parseInt(new Date().getTime() / 1000)
                that.setData({
                  orderList: data
                })
              })
          },
          function () {

          });
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onRead: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  }
})