// pages/videoOrder/index.js
//引入公共模块文件
var common = require('../template/index.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  //订单状态（0,待报价.1待付款，2待发货，3待收货，4退回，5订单完成，6用户取消，7缺货）
  data: {
    curVideoSrc: null,
    title: [{
      name: '全部',
      checked: true
    }, {
      name: '待报价',
    }, {
      name: '待购买',
    }, {
      name: '待发货',
    }, {
      name: '待收货'
    }],
    status: ['待报价', '待付款', '待发货', '待收货', '退回', '订单完成', '用户取消', '缺货'],
    url: [null, 0, 1, 2, 3],
    pageSize: 5,
    orderList: [],
    total: null,
    //付款遮罩层状态
    showModalStatus: false,
    priceSum: null, //支付价格
    //标记导航栏状态
    tabIndex: 0,
    //标记订单
    orderIndex: 0,
    userEarn: 0.00, //用户余额
    addressId: null,
    nowDate: null, //用来和提醒时间比较，用户一天之内不能重复提醒
    refresh: true, //加载图标的显示
    disabled: false, //支付按钮状态
  },

  videoPlay: function(e) {
    var videoSrc = this.data.orderList[e.currentTarget.dataset.index].videoSrc.resourceUrl;
    videoSrc = videoSrc.substr(0, videoSrc.length - 4);
    wx.navigateTo({
      url: 'video/index?videoSrc=' + videoSrc,
    })
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
      tabIndex: index,
      title: data,
      orderList: [],
      total: 0
    })
    //调用查询接口
    this.getOrder(this.data.url[index])
  },
  lower: function(e) {
    if (this.data.orderList.length != this.data.total) {
      this.setData({
        refresh: false,
      })
      this.getOrder(this.data.url[this.data.tabIndex])
    }
  },
  receipt: function(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '您确定已收到货么',
      success: function(res) {
        if (res.confirm) {
          app.requestPut('api/clientvideoorder/' + e.currentTarget.dataset.id + '/ClientConfirmReceipt', null, app.globalData.header,
            function(res) {
              var data = that.data.orderList
              data[e.currentTarget.dataset.index].status = 5
              that.setData({
                orderList: data
              })
            });
        }
      }
    })
  },
  cancel: function(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要取消订单么',
      success: function(res) {
        if (res.confirm) {
          app.requestPut('api/clientvideoorder/' + e.currentTarget.dataset.id + '/ClientCancelOrder', null, app.globalData.header,
            function(res) {
              that.onShow();
            });
        }
      }
    })
  },

  gotoRefund: function(e) {
    let index = e.currentTarget.dataset.index;
    var selectOrder = this.data.orderList[index];
    //订单类型： 0：购买，1：试衣，2：询价
    selectOrder.orderType = 2
    if (selectOrder != null) {
      common.gotoRefund(selectOrder.orderId, 2, selectOrder.status, '../Refund/');
    }
    this.setData({
      orderList: []
    });
    this.getOrder(this.data.url[this.data.tabIndex]);
  },

  //获取订单
  getOrder: function (status) {
    var that = this
    var param = {
      pageIndex: that.data.orderList.length,
      pageSize: that.data.pageSize
    }
    if(status !== null){
      param.status = status
    }
    app.requestFormGet('api/clientvideoorder/showClientVideoOrders', param,
      function(res) {
        var data = res.data.data
        var orderList = that.data.orderList
        var date = parseInt(new Date().getTime() / 1000)
        that.setData({
          refresh: true,
          orderList: orderList.concat(data.data),
          total: data.total,
          nowDate: date - 86400000,
        })
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh();
      });
  },

  //立即购买点击事件
  buy: function(e) {
    var index = e.currentTarget.dataset.index;
    const that = this;
    var count = 0;
    //收货地址
    app.requestFormGet('api/goods/queryAllUserAddress/0', {}, function(res) {
      if (res.data.data.length < 1) {
        wx.navigateTo({
          url: '../me/setting/address/index'
        })
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
          url: '../me/setting/address/index'
        })
      } else {
        that.setData({
          orderIndex: index,
          priceSum: that.data.orderList[index].price
        });
        common.showPembayaranModal(that);
      }
    });
  },

  hidePembayaranModal: function() {
    common.hidePembayaranModal(this);
  },

  formSubmit: function(e) {
    var data = {
      payType: e.detail.value.payType,
      id: this.data.orderList[this.data.orderIndex].orderId,
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
        var orderList = that.data.orderList
        orderList[that.data.orderIndex].status = 2
        that.setData({
          orderList: orderList
        })
      },
      'api/clientvideoorder/updateClientVideoOrderBuyStatus');
  },

  //提醒发货
  remind: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    app.requestFormGet('api/videoOrder/' + e.currentTarget.dataset.id + '/showOrderInfo', {},
      function(res) {
        var orderInfo = res.data.data
        common.shipment(orderInfo.phone, orderInfo.name, orderInfo.createTime, orderInfo.videoOrderId,
          function (res) {
            wx.showToast({
              title: '已提醒商家发货',
              icon: 'none'
            })
            app.requestFormPut('api/clientvideoorder/clientRemindTime', {
              id: orderInfo.videoOrderId
            },
              function (res) {
                var data = that.data.orderList
                data[index].remindTime = parseInt(new Date().getTime() / 1000)
                that.setData({
                  orderList: data
                })
              })
          },
          function (res) {
            console.log(res)
          }
        );
      })
  },

  //跳转订单详情
  jumpOrderInfo: function(e) {
    var i = e.currentTarget.dataset.id;
    var data = this.data.orderList[i];
    if (data != null) {
      wx.navigateTo({
        url: './orderInfo/index?orderInfo=' + JSON.stringify(data),
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getOrder(this.data.url[this.data.tabIndex])
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

  onPullDownRefresh() {
    var that = this;
    that.setData({
      orderList: [],
      nowDate: parseInt(new Date().getTime() / 1000) - 86400000
    });
    wx.showNavigationBarLoading() //在标题栏中显示加载
    setTimeout(function() {
      that.getOrder(that.data.url[that.data.tabIndex]);
    }, 1000);
  }
})