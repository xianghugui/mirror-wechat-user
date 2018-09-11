// pages/tryOrder/orderInfo/index.js
//引入公共模块文件
var app = getApp();
var common = require('../../template/index.js');
Page({

  /**
   * 页面的初始数据
   */
  //状态0:待付款， 1 待派单，2：待发货，3：待收货，4：待评价，5：已评价，6：退货，7：订单关闭
  data: {
    //订单详情
    orderDeatil: {},
    orderStatus: ["待付款", "待发货", "待发货", "待收货", "待评价", "已评价", "退款/退货", "订单关闭", "订单已取消"],
    //商品详情
    orderInfo: {},
    //付款遮罩层状态
    showModalStatus: false,
    priceSum: null, //支付价格
    userEarn: 0.00, //用户余额
    countdown: '', //倒计时
    nowDate: null, //用来和提醒时间比较，用户一天之内不能重复提醒
    disabled: false, //支付按钮状态
  },

  /**
   * 跳转到聊天界面
   */
  toChat: function(e) {
    var orderInfo = this.data.orderInfo
    //判断聊天记录中是否发送过订单详情卡片
    var messageList = wx.getStorageSync('' + orderInfo.shopUserId);
    var url = '../../chat/index?userId=' + orderInfo.shopUserId;
    var extras;
    if (typeof messageList !== 'undefined') {
      for (let i = messageList.length - 1; i > -1; i--) {
        extras = messageList[i].content.msg_body.extras
        if (typeof extras !== 'undefined') {
          if (extras.orderId !== orderInfo.orderId) {
            url += '&orderInfo=' + JSON.stringify(orderInfo);
          }
          break;
        }
      }
    } else {
      url += '&orderInfo=' + JSON.stringify(orderInfo);
    }
    wx.navigateTo({
      url: url,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var orderInfo = JSON.parse(options.orderInfo);
    this.setData({
      orderInfo: orderInfo,
    })
  },

  //微信支付
  formSubmit: function(e) {
    var data = {
      payType: e.detail.value.payType,
      price: this.data.orderInfo.price,
      id: this.data.orderInfo.orderId,
      goodsId: this.data.orderInfo.goodsId,
      num: this.data.orderInfo.num
    }

    this.setData({
      disabled: true
    });
    //调用统一的微信支付接口
    var that = this;
    common.wxPay('api/clientorder/ClientOrderBuy', data, null,
      function() {
        that.hidePembayaranModal()
        var orderDeatil = that.data.orderDeatil
        orderDeatil.status = 1
        that.setData({
          orderDeatil: orderDeatil
        })
      },
      //取消支付
      function() {
        that.setData({
          disabled: false
        });
      },
      'api/clientorder/updateClientOrderBuyStatus');

  },

  hidePembayaranModal: function() {
    common.hidePembayaranModal(this);
  },

  //立即购买
  buy: function() {
    common.showPembayaranModal(this);
  },

  //确认收货
  receipt: function() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '您确定已收到货么',
      success: function(res) {
        if (res.confirm) {
          app.requestPut('api/clientorder/' + that.data.orderDeatil.orderId + '/ClientConfirmReceipt', null, app.globalData.header,
            function(res) {
              if (res.data.success) {
                var data = that.data.orderDeatil
                data.status = 4
                that.setData({
                  orderDeatil: data,
                })
              }
            });
        }
      }
    })
  },

  //商品评论
  goodsComment: function() {
    var selectOrder = this.data.orderDeatil;
    selectOrder.orderType = 0;
    common.goodsComment(selectOrder, '../../goodsComment/');
  },

  //取消
  cancel: function() {
    common.cancel(this.data.orderDeatil.orderId, this, 1, function() {
      wx.navigateBack({
        delta: 1,
        success: function() {
          const wxCurrPage = getCurrentPages(), //获取当前页面的页面栈
            wxPrevPage = wxCurrPage[wxCurrPage.length - 2]; //获取上级页面的page对象
          wxPrevPage.getOrder(0, true);
        }
      })
    });
  },

  //退款
  gotoRefund: function() {
    common.gotoRefund(this.data.orderInfo.orderId, 0, this.data.orderInfo.status, '../../Refund/');
  },

  //提醒发货
  remind: function(e) {
    var that = this
    var orderDetail = this.data.orderDeatil;
    common.shipment(orderDetail.phone, orderDetail.name, orderDetail.createTime, orderDetail.orderId,
      function(res) {
        console.log(res)
        wx.showToast({
          title: '已提醒商家发货',
        })
        app.requestFormPut('api/clientorder/clientRemindTime', {
            id: orderInfo.orderId
          },
          function(res) {
            var data = that.data.orderList
            data[index].remindTime = new Date().getTime() * 1000
            that.setData({
              orderList: data
            })
          })
      },
      function(res) {
        console.log(res)
      }
    );
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
    const that = this;
    getApp().requestGet('api/order/' + this.data.orderInfo.orderId + '/showOrderInfo', {}, getApp().globalData.header, function(res) {
      var data = res.data.data
      data.userAddress = data.userAddress.replace(/,/g, ' ');
      that.setData({
        orderDeatil: data,
        priceSum: data.goodsPrice * data.goodsNumber,
        nowDate: parseInt(new Date().getTime() / 1000) - 86400000
      });
      //倒计时
      var status = data.status
      if (status == 3 || status == 0) {
        var endTime = new Date();
        if (status == 3) {
          //7天自动退款
          endTime = new Date(data.fahuoTime)
          endTime.setDate(endTime.getDate() + 7)
          if (endTime <= new Date()) {
            common.receipt(this.data.orderInfo.orderId, this, 1, function() {
              var data = that.data.orderDeatil
              data.status = 4
              that.setData({
                orderDeatil: data,
              })
              return;
            });
          }
        } else {
          //2小时取消订单
          endTime = new Date(data.createTime)
          endTime.setHours(endTime.getHours() + 2)
          if (endTime <= new Date()) {
            common.cancel(this.data.orderDeatil.orderId, this, 1, function() {
              wx.redirectTo({
                url: '../index',
              });
              return;
            });
          }
        }
        var countdown = common.countdown(endTime)
        that.setData({
          countdown: countdown
        });
      }
    })
  }
})