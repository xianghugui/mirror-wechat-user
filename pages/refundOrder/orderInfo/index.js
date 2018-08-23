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

  //提醒发货
  shipment: function(e) {
    var that = this
    var orderDeatil = that.data.orderDeatil;
    var showPrompt = '';
    app.requestFormGet('api/refundexchange/' + orderDeatil.refundId +
      '/showRefundsInfo', {},
      function(res) {
        var orderInfo = res.data.data
        var data = {
          formId: e.detail.formId,
          openId: orderInfo.openId,
          express: orderInfo.expressName + '：' + orderInfo.expressNumber,
          goodsName: typeof that.data.orderDeatil.goodsName == 'undefined' ? '询价视频商品' : that.data.orderDeatil.goodsName,
          price: orderInfo.price + '',
          prompt: '买家提醒您确认收货\n买家昵称：' + orderInfo.userName + '\n买家手机：' + orderInfo.userPhone
        }
        common.refundReceipt(data);
        app.requestFormPut('api/clientrefund/clientRemindTime', {
            id: orderInfo.refundId
          },
          function(res) {
            orderDeatil.remindTime = new Date().getTime() * 1000
            that.setData({
              orderDeatil: orderDeatil
            })
          })
        const wxCurrPage = getCurrentPages(); //:获取当前页面的页面栈
        const wxPrevPage = wxCurrPage[wxCurrPage.length - 2]; //:获取上级页面的page对象
        wxPrevPage.setData({
          ['orderList[' + that.data.index + '].remindTime']: new Date().getTime() * 1000
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