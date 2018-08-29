// pages/confirmOrder/index.js
var shoppingStatus = 0;
var common = require('../template/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 订单查询列表
    orderList: [],

    // 用户地址
    userAddress: null,

    //自定义弹出框状态
    showModal: false,

    shoppingStatus: 0,

    goodsIdList: [],

    addressId: '',

    priceSum: 0.00, //订单总价

    //付款遮罩层状态
    showModalStatus: false,

    orderId: null, //t_order订单ID

    userEarn: 0.00, //用户账户余额
    submit: false, //是否在提交中
    disabled: false, //支付按钮状态
    orderType: 1, //订单状态 0,直接支付生成订单 1,取消支付生成订单
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this;
    var goodsIdList = JSON.parse(options.goodsIdList),
      shoppingStatus = options.shoppingStatus,
      orderList = that.data.orderList;

    this.setData({
      shoppingStatus: shoppingStatus
    });

    this.onShow();
    // 显示订单详情
    for (var count = 0, len = goodsIdList.length; count < len; count++) {
      this.showOrder(count, goodsIdList, orderList);
    }
  },

  showOrder: function(count, goodsIdList, orderList) {
    const that = this;
    getApp().requestGet('api/goods/queryGoods/' + goodsIdList[count].goodsId, {
        goodsSpecId: goodsIdList[count].goodsSpecId
      },
      getApp().globalData.header,
      function(res) {
        var quality = res.data.data.choseGoodsSpec.quality;
        orderList.push(res.data.data);
        that.setData({
          orderList: orderList,
          goodsIdList: goodsIdList,
        });
        that.addPriceSum();
      });
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
    var data = {
      addressId: that.data.addressId
    };
    //查询用户收货地址
    getApp().requestGet('api/goods/queryAllUserAddress/1', data, getApp().globalData.header, function(res) {
      res.data.data.address = res.data.data.address.replace(/,/g, ' ');
      that.setData({
        userAddress: res.data.data
      });
    });
    this.addPriceSum();
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
    const wxCurrPage = getCurrentPages();
    const wxPrevPage = wxCurrPage[wxCurrPage.length - 2];
    //取消购物车全选
    if (wxPrevPage.route == "pages/cart/index") {
      wxPrevPage.setData({
        selectAll: false
      });
    }
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
   * 生成订单
   * orderType: 0,直接支付生成订单 1,取消支付生成订单
   */
  createOrder: function(success) {
    var data = [];
    const that = this;
    //有多个订单，将每个订单，循环遍历存储进数组中传入后台，
    for (var i = 0; i < this.data.goodsIdList.length; i++) {
      data.push({
        "addressId": that.data.userAddress[0].uId,
        "goodsId": that.data.goodsIdList[i].goodsId,
        "goodsSpecId": that.data.goodsIdList[i].goodsSpecId,
        "num": that.data.goodsIdList[i].num,
        priceSum: that.data.priceSum,
        showUserId: that.data.goodsIdList[i].showUserId,
        videoId: that.data.goodsIdList[i].videoId,
        commission: that.data.goodsIdList[i].commission,
        price: that.data.orderList[i].price
      });
      //shoppingStatus 判断是否在购物车
      if (that.data.shoppingStatus == 1) {
        data[i].shoppingCartId = that.data.goodsIdList[i].id
      }
    }

    getApp().requestPost('api/goods/insertGoodsOrder/' + that.data.shoppingStatus + '/' + that.data.orderType, data, getApp().globalData.header,
      function(res) {
        that.setData({
          submit: false,
          orderId: res.data.data
        })
        success && success()
      });
  },

  // 提交订单按钮事件
  submitButton: function() {

    if (this.data.userAddress.length > 0) {
      if (!this.data.submit) {
        this.setData({
          submit: true
        })
        this.showPembayaranModal();
      }
    } else {
      wx.navigateTo({
        url: '../me/setting/address/index',
      })
    }

  },
  //------------------数量控件----------------------------

  /* 点击减号 */
  onUpdateNum: function(e) {
    this.setData({
      ['goodsIdList[' + e.detail.index + '].num']: e.detail.num
    });
    this.addPriceSum();
  },

  //跳转显示全部地址
  allAddress: function(e) {
    wx.navigateTo({
      url: '../me/setting/address/index',
    })
  },

  //计算订单总价
  addPriceSum: function() {
    var sum = 0.00;
    var orderList = this.data.orderList
    var goodsIdList = this.data.goodsIdList
    for (var i = 0; i < orderList.length; i++) {
      sum += (orderList[i].price * 100 * goodsIdList[i].num);
    }
    this.setData({
      priceSum: sum / 100
    });
  },

  //------------------支付弹出框----------------------------

  showPembayaranModal: function() {
    common.showPembayaranModal(this);
  },

  hidePembayaranModal: function() {
    common.hidePembayaranModal(this);
    if (this.data.orderType == 1) {
      this.createOrder(function() {
        wx.redirectTo({
          url: '../myOrder/index',
        })
      });
    } else {
      wx.redirectTo({
        url: '../myOrder/index',
      })
    }

  },

  //确定支付
  formSubmit: function(e) {
    const that = this;
    this.setData({
      orderType: 0
    });
    //生成订单
    this.createOrder(function() {
      var data = {
        payType: e.detail.value.payType,
        orderId: that.data.orderId
      }
      that.setData({
        disabled: true
      });

      //调用统一的微信支付接口
      common.wxPay('api/clientorder/ClientOrderBuy', data, '../myOrder/index', null, //取消支付
        function() {
          that.setData({
            disabled: false
          });
        }, 'api/clientorder/updateClientOrderBuyStatus');
    });

  },

  //跳转商品详情页
  jumpToProductDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var selectOrder = this.data.orderList[index];
    if (typeof index != 'undefined' && typeof selectOrder != 'undefined') {
      var goodsSpec = {
        color: selectOrder.choseGoodsSpec.color,
        size: selectOrder.choseGoodsSpec.size,
        curCount: this.data.goodsIdList[index].num,
        index: index
      };
      wx.navigateTo({
        url: '../productDetail/index?goodsId=' + selectOrder.uId +
          '&goodsSpecId=' + selectOrder.choseGoodsSpec.id +
          '&goodsSpec=' + JSON.stringify(goodsSpec)
      })
    }
  }
})