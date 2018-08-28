// pages/cart/index.js
var common = require('../template/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectAll: false,
    items: [], //购物车记录
    postCheckboxData: [], //传到确认订单的订单
    sumPrice: 0,
    total: null, // 购物车商品数量
  },

  /**
   * 全选点击事件
   */
  selectallchange: function(e) {
    var selectAll = this.data.selectAll,
      items = this.data.items,
      _self = this,
      value = e.detail.value[0],
      postCheckboxData = [];

    if (!selectAll) {
      selectAll = true;
      for (var i = 0, lenI = items.length; i < lenI; ++i) {
        //只有商品存储数量大于0时的才可以选
        if (items[i].quality > 0) {
          items[i].checked = true;
          postCheckboxData.push(items[i]);
        }
      }
    } else {
      selectAll = false;
      for (var i = 0, lenI = items.length; i < lenI; ++i) {
        items[i].checked = false;
      }
      postCheckboxData = [];
    }

    this.setData({
      selectAll: selectAll,
      items: items,
      postCheckboxData: postCheckboxData
    }, function() {
      _self.addPrice();
    });
  },

  /**
   * 单个点击事件
   */
  selectgroupchange: function(e) {
    var items = this.data.items,
      values = e.detail.value,
      _self = this,
      postCheckboxData = [];

    for (let i = 0, len = items.length; i < len; i++) {
      items[i].checked = false;
    }

    for (let i = 0, len = values.length; i < len; i++) {
      items[values[i]].checked = true;
      postCheckboxData.push(items[values[i]]);
    }

    this.setData({
      items: items,
      postCheckboxData: postCheckboxData
    }, function() {
      _self.addPrice();
    })
    if (postCheckboxData.length > 0 && values.length == items.length) {
      this.setData({
        selectAll: true
      })
    } else {
      this.setData({
        selectAll: false
      })
    }
  },

  buy: function(e) {
    if (this.data.postCheckboxData.length > 0) {
      wx.navigateTo({
        url: '../confirmOrder/index?goodsIdList=' + JSON.stringify(this.data.postCheckboxData) +
          '&shoppingStatus=1&status=2'
      })
    } else if (this.data.items.length === 0) {
      wx.showToast({
        title: '快去添加商品吧',
        icon: 'none'
      })
    } else {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
    }
  },

  loadShoppingCart: function() {
    const that = this;
    //查询购物车商品
    getApp().requestGet('api/goods/queryShoppingCart', {}, getApp().globalData.header, function(res) {
      if (res.data.code == 200) {
        that.setData({
          items: res.data.data,
          total: res.data.data.length,
          postCheckboxData: [],
          sumPrice: 0
        });
      }
    });
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
    this.loadShoppingCart();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 隐藏所有删除按钮
   */
  touchstart: function(e) {
    var items = this.data.items;
    items[e.detail.index].isOpen = false;
    this.setData({
      items: items
    })
  },

  /**
   * 删除购物车中的商品
   */
  delConversation: function(e) {
    var index = e.detail.index;
    var items = this.data.items;
    var postCheckboxData = this.data.postCheckboxData;
    var delCheck;
    const that = this;
    for (var i = 0, len = postCheckboxData.length; i < len; i++) {
      if (postCheckboxData[i].id == items[index].id) {
        delCheck = i;
      }
    }
    getApp().requestDel('api/goods/deleteGoods/' + items[index].id, {}, getApp().globalData.header, function(res) {
      items.splice(index, 1);
      postCheckboxData.splice(delCheck, 1);
      that.setData({
        items: items,
        total: items.length
      });
      that.addPrice();
    })
  },

  //------------------数量控件----------------------------

  /* 更新商品购买数量 */
  onUpdateNum: function(e) {
    const that = this;
    that.setData({
      ['items[' + e.detail.index + '].num']: e.detail.num
    });
    that.updateGoodsCount(e, that);
  },


  //跳转商品详情页面
  jumpToProductDetail: function(e) {
    var selectOrder = this.data.items[e.currentTarget.dataset.index];
    var goodsSpec = {
      color: selectOrder.color,
      size: selectOrder.size,
      curCount: selectOrder.num
    };
    wx.navigateTo({
      url: '../productDetail/index?goodsId=' + selectOrder.goodsId +
        '&shoppingCarId=' + selectOrder.id +
        '&goodsSpecId=' + selectOrder.goodsSpecId +
        '&goodsSpec=' + JSON.stringify(goodsSpec)
    })
  },

  // 更改购物车中的商品数量
  updateGoodsCount: (e, that) => {
    var index = e.detail.index;
    var item = that.data.items[index];
    var id = item.id;
    var postCheckboxData = that.data.postCheckboxData;
    var num = that.data.items[index].num;
    for (var count = 0, len = postCheckboxData.length; count < len; count++) {
      if (postCheckboxData[count].id == id) {
        that.setData({
          ['postCheckboxData[' + count + '].num']: num
        }, function() {
          that.addPrice();
        });
        break;
      }
    }
    if (id != null && num > 0) {
      getApp().requestPut('api/goods/updateShopCarGoodsNum/' + id + '/' + num, {},
        getApp().globalData.header,
        function(res) {

        });
    }
  },

  //价格合计
  addPrice: function() {
    var sumPrice = 0;
    var postCheckboxData = this.data.postCheckboxData;
    if (postCheckboxData != null) {
      for (var i = 0; i < postCheckboxData.length; i++) {
        sumPrice += (postCheckboxData[i].price * 100 * postCheckboxData[i].num);
      }
    }
    this.setData({
      sumPrice: sumPrice / 100
    });
  }
})