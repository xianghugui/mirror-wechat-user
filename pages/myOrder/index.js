// pages/myOrder/index.js
//引入公共模块文件
var app = getApp();

var common = require('../template/index.js');
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */

  //状态0:待付款， 1 待派单，2：待发货，3：待收货，4：待评价，5：已评价，6：退款/退货，7：订单关闭
  data: {
    title: [{
      name: '全部',
      checked: true
    }, {
      name: '待付款',
    }, {
      name: '待发货',
    }, {
      name: '待收货',
    }, {
      name: '待评价'
    }],
    status: ['待付款', '待发货', '待发货', '待收货', '待评价', '已评价', '退款/退货', '关闭订单', '订单已取消'],
    url: [null, 0, 2, 3, 4],
    pageSize: 10,
    orderList: [],
    total: null,
    //标记导航栏状态
    tabIndex: 0,
    orderIndex: null, //标记订单index
    //付款遮罩层状态
    showModalStatus: false,
    priceSum: null, //支付价格
    userEarn: 0.00, //用户余额
    nowDate: null, //用来和提醒时间比较，用户一天之内不能重复提醒
    refresh: true, //加载图标的显示
    disabled: false, //支付按钮状态
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
          app.requestPut('api/clientorder/' + e.currentTarget.dataset.id + '/ClientConfirmReceipt', null, app.globalData.header,
            function(res) {
              if (res.data.success) {
                var data = that.data.orderList
                data[e.currentTarget.dataset.index].status = 4
                that.setData({
                  orderList: data
                });
              }
            });
        }
      }
    })
  },

  //取消订单
  cancel: function(e) {
    var that = this;
    var orderList = this.data.orderList;
    wx.showModal({
      title: '提示',
      content: '确定要取消订单么',
      success: function(res) {
        if (res.confirm) {
          app.requestPut('api/clientorder/' + e.currentTarget.dataset.id + '/ClientCancelOrder', {}, {
            'content-type': 'application/json'
          }, function(res) {
            orderList.splice(e.currentTarget.dataset.index, 1);
            that.setData({
              orderList: orderList
            });
          });
        }
      }
    });
  },

  //退款
  gotoRefund: function(e) {
    if (e.currentTarget.dataset.id != null) {
      wx.navigateTo({
        url: '../Refund/index?orderId=' + e.currentTarget.dataset.id + '&orderType=0&status=' + e.currentTarget.dataset.status
      })
    }
  },

  //商品评论
  goodsComment: function(e) {
    var selectOrder = this.data.orderList[e.currentTarget.dataset.index];
    selectOrder.orderType = 0;
    common.goodsComment(selectOrder, '../goodsComment/');
  },

  //获取订单
  getOrder: function(status, refresh) {
    var that = this
    var param = {
      pageIndex: refresh ? 0 : that.data.orderList.length,
      pageSize: that.data.pageSize,
    }
    if (status !== null) {
      param.status = status
    }
    app.requestFormGet('api/clientorder/showClientOrders', param,
      function(res) {
        var data = res.data.data
        var orderList = that.data.orderList
        var date = parseInt(new Date().getTime() / 1000)
        that.setData({
          refresh: true,
          orderList: refresh ? data.data : orderList.concat(data.data),
          total: data.total,
          nowDate: date - 86400000,
        })
      });
  },

  //页面跳转
  jumpOrderInfo: function(e) {
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: './orderInfo/index?orderInfo=' + JSON.stringify(this.data.orderList[index]),
    })
  },

  //立即购买
  buy: function(e) {
    const that = this;
    var orderIndex = e.currentTarget.dataset.index;
    that.showPembayaranModal();
    that.setData({
      orderIndex: orderIndex,
      priceSum: (that.data.orderList[orderIndex].price * 100 * that.data.orderList[orderIndex].num) / 100
    })
  },

  //提醒发货
  shipment: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    app.requestFormGet('api/order/' + e.currentTarget.dataset.id +
      '/showOrderInfo', {},
      function(res) {
        var orderInfo = res.data.data
        common.shipment(orderInfo.phone, orderInfo.name, orderInfo.createTime, orderInfo.orderId,
          function(res) {
            wx.showToast({
              title: '已提醒商家发货',
            })
            app.requestFormPut('api/clientorder/clientRemindTime', {
                id: orderInfo.orderId
              },
              function(res) {
                var data = that.data.orderList
                data[index].remindTime = parseInt(new Date().getTime() / 1000)
                that.setData({
                  orderList: data
                })
              })
          },
          function(res) {
            console.log(res)
          });
      })
  },

  //显示支付弹出框
  showPembayaranModal: function() {
    common.showPembayaranModal(this);
  },

  //隐藏支付弹出框
  hidePembayaranModal: function() {
    common.hidePembayaranModal(this);
  },

  //微信支付
  formSubmit: function(e) {
    //支付类型，主订单id t_order
    var data = {
      id: this.data.orderList[this.data.orderIndex].orderId,
      // orderId: this.data.orderList[this.data.orderIndex].parentId,
      price: this.data.orderList[this.data.orderIndex].price,
      payType: e.detail.value.payType,
      goodsId: this.data.orderList[this.data.orderIndex].goodsId,
      num: this.data.orderList[this.data.orderIndex].num
    }

    this.setData({
      disabled: true
    });

    //调用统一的微信支付接口
    var that = this;
    common.wxPay(
      'api/clientorder/ClientOrderBuy', //微信支付请求api
      data, // 需要支付订单数据
      null, //支付成功跳转URL null 表示支付成功之后不做页面跳转
      function() {
        that.hidePembayaranModal()
        var data = that.data.orderList
        data[that.data.orderIndex].status = 1
        that.setData({
          orderList: data
        })
      }, // 当支付成功后需调用该方法隐藏支付弹出框
      function(){
        that.setData({
          disabled:false
        });
      },
      'api/clientorder/updateClientOrderBuyStatus' // 支付成功之后调用的更改订单状态接口api
    );

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    var that = this
    that.getOrder(that.data.url[that.data.tabIndex], true)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      orderList: [],
      nowDate: parseInt(new Date().getTime() / 1000) - 86400000
    });
    this.getOrder(this.data.url[this.data.index])
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  onHide: function() {}


})