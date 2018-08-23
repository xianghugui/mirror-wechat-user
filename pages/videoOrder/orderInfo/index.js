// pages/tryOrder/orderInfo/index.js
var app = getApp();
//引入公共模块文件
var common = require('../../template/index.js');
Page({

  /**
   * 页面的初始数据
   */

  //订单状态（0,待报价.1待付款，2待发货，3待收货，4退回，5订单完成，6用户取消，7缺货）
  data: {
    closeHidden: false,
    isPlay: false,
    orderDetail: {},
    orderInfo: {},
    buttonList: [{
        status: "待报价",
        no: "取消",
        yes: "null"
      },
      {
        status: "待付款",
        no: "取消",
        yes: "立即购买"
      },
      {
        status: "待发货",
        no: "退款",
        yes: "提醒发货"
      },
      {
        status: "待收货",
        no: "退货／退款",
        yes: "确定收货"
      },
      {
        status: "退回",
        no: "null",
        yes: "null"
      },
      {
        status: "订单完成",
        no: "null",
        yes: "null"
      },
      {
        status: "用户取消",
        no: "null",
        yes: "null"
      },
      {
        status: "缺货",
        no: "null",
        yes: "null"
      }
    ],
    //付款遮罩层状态
    showModalStatus: false,
    priceSum: null, //支付价格
    showVideoModalStatus: false,
    userEarn: 0.00, //用户余额
    addressId: null,
    countdown: '', //倒计时
    nowDate: null, //用来和提醒时间比较，用户一天之内不能重复提醒
    disabled: false, //支付按钮状态
  },

  fullscreenchange: function(e) {
    var closeHidden = this.data.closeHidden;
    if (e.detail.fullScreen == true) {
      closeHidden = true;
    } else {
      closeHidden = false;
    }
    this.setData({
      closeHidden: closeHidden
    })
  },
  controltoggle: function(e) {
    this.setData({
      closeHidden: !this.data.closeHidden
    })
  },
  videoended: function(e) {
    this.setData({
      isPlay: false
    })
  },
  videoPlay: function(e) {
    var _self = this;
    this.setData({
      isPlay: true,
      closeHidden: true,
    }, function() {
      // _self.videoContext.requestFullScreen();
    })
    wx.setNavigationBarTitle({
      title: ''
    })

  },
  closeVideo: function(e) {
    this.setData({
      isPlay: false
    })
    wx.setNavigationBarTitle({
      title: '我的询价'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var orderInfo = JSON.parse(options.orderInfo);
    const that = this;
    getApp().requestGet('api/videoOrder/' + orderInfo.orderId + '/showOrderInfo', {}, getApp().globalData.header, function(res) {
      var data = res.data.data
      if (data.userAddress != null){
        data.userAddress = data.userAddress.replace(/,/g, ' ');
      }
      that.setData({
        orderDetail: data,
        orderInfo: orderInfo,
        priceSum: data.goodsPrice,
        nowDate: parseInt(new Date().getTime() / 1000) - 86400000
      });
      //倒计时
      var status = data.status
      if (status == 3 || status == 1) {
        var time
        if (status == 3) {
          //7天自动退款
          time = new Date(data.theDeliveryTime)
          time.setDate(time.getDate() + 7)
          if (time <= new Date()) {
            common.receipt(data.orderId, that, 2, function () {
              var orderDetail = that.data.orderDetail;
              orderDetail.status = 5;
              that.setData({
                orderDetail: orderDetail
              });
              return;
            });
          }
        } else {
          //2小时取消订单
          time = new Date(data.updateTime)
          time.setDate(time.getDate() + 2)
          if (time <= new Date()) {
            common.cancel(data.orderId, this, 2, function () {
              wx.navigateBack({
                delta: 1,
              });
              return;
            });
          }
        }
        var countdown = common.countdown(time)
        that.setData({
          countdown: countdown
        });
      }
    })
  },

  formSubmit: function(e) {
    var data = {
      payType: e.detail.value.payType,
      id: this.data.orderDetail.videoOrderId,
      addressId: this.data.addressId
    }

    this.setData({
      disabled: true
    });
    //调用统一的微信支付接口
    var that = this;
    common.wxPay('api/clientvideoorder/ClientPay', data, null,
      function() {
        that.hidePembayaranModal()
        var orderDetail = that.data.orderDetail
        orderDetail.status = 2
        that.setData({
          orderDetail: orderDetail
        })
      },
      'api/clientvideoorder/updateClientVideoOrderBuyStatus');

  },

  //隐藏支付弹出框
  hidePembayaranModal: function() {
    common.hidePembayaranModal(this);
  },

  yes: function() {
    var data = this.data.orderInfo;
    var that = this;
    switch (data.status) {
      case 1:
        this.buy();
        break;
      case 3:
        common.receipt(data.orderId, that, 2, function() {
          var orderDetail = that.data.orderDetail;
          orderDetail.status = 5;
          that.setData({
            orderDetail: orderDetail
          });
        });
        break;
      case 4:
        wx.redirectTo({
          url: '../../refundOrder/index'
        });
        break;
      default:
        break;
    }
  },

  no: function() {
    var data = this.data.orderInfo;
    switch (data.status) {
      case 0:
        common.cancel(data.orderId, this, 2, function() {
          wx.navigateBack({
            delta: 1,
          })
        });
        break;
      case 1:
        common.cancel(data.orderId, this, 2, function() {
          wx.navigateBack({
            delta: 1,
          })
        });
        break;
      case 2:
        common.gotoRefund(data.orderId, 2, data.status, '../../Refund/');
        break;
      case 3:
        common.gotoRefund(data.orderId, 2, data.status, '../../Refund/');
        break;
      default:
        break;
    }
  },

  //提醒发货
  remind: function(e) {
    var that = this
    var orderDetail = this.data.orderDetail;
    common.shipment(orderDetail.phone, orderDetail.name, orderDetail.createTime, orderDetail.videoOrderId,
      function(res) {
        wx.showToast({
          title: '已提醒商家发货',
          icon: 'none'
        })
        app.requestFormPut('api/clientvideoorder/clientRemindTime', {
            id: orderInfo.videoOrderId
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

  buy: function() {
    var count = 0;
    var that = this;
    //收货地址
    getApp().requestFormGet('api/goods/queryAllUserAddress/0', {}, function(res) {
      if (res.data.data.length < 1) {
        return;
      }
      var data = res.data.data
      for (let i = 0; i < data.length; i++) {
        if (data[i].status == 1) {
          that.setData({
            addressId: data[i].uId
          });
          count++;
          break;
        }
      }
      if (count == 0) {
        wx.navigateTo({
          url: '../../me/setting/address/index'
        })
      } else {
        common.showPembayaranModal(that);
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onRead: function() {
    this.videoContext = wx.createVideoContext('myVideo');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  }
})