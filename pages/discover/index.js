// pages/discover/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartnum: 0,
    tabs: {}, //展示的数据
    curIndex: 0, //当前展示的Tab项索引
    // banner
    imgUrls: [],
    indicatorDots: true, //是否显示面板指示点
    indicatorColor: '#A7A39F',
    indicatorActiveColor: '#3EC0C4',
    autoplay: true, //是否自动切换
    interval: 3000, //自动切换时间间隔,3s
    duration: 1000, //  滑动动画时长1s
    productList: {}
  },

  bindChange: function(e) {
    var current = e.detail.current;
    this.setData({
      activeIndex: current,
      sliderOffset: this.data.sliderWidth * current
    });

  },

  navTabClick: function(e) {
    this.setData({
      curIndex: e.currentTarget.id
    });
    this.loadGoodsClass(e.currentTarget.id, e.currentTarget.dataset.level + 1);
    //查询当前类别推荐商品
    this.queryRecommendGoods(e.currentTarget.id, e.currentTarget.dataset.level);
  },

  navigatorToProduct: function(e) {
    var classId = e.currentTarget.dataset.id;
    if (classId != null) {
      wx.navigateTo({
        url: '../product/index?classId=' + classId
      })
    }
  },

  //加载级商品类别
  loadGoodsClass: function(parentId, level) {
    const that = this;
    if (parentId != null && level != null) {
      getApp().requestFormGet('api/goods/queryGoodsClass/' + parentId + '/' + level, {}, function(res) {
        if (res != null) {
          that.setData({
            curIndex: parentId,
            productList: res.data.data
          });
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    getApp().requestFormGet('api/goods/queryGoodsClass/100000/2', {}, function(res) {
      if (res != null) {
        that.setData({
          tabs: res.data.data,
          curIndex: res.data.data[0].uId
        });
        that.loadGoodsClass(res.data.data[0].uId, res.data.data[0].level + 1);
        that.queryRecommendGoods(res.data.data[0].uId, res.data.data[0].level);
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  queryShopCart: function() {
    const that = this
    //查询购物车商品
    getApp().requestFormGet('api/goods/queryShoppingCart', {}, function(res) {
      if (res != null && res.data.code == 200) {
        that.setData({
          cartnum: res.data.data.length
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */

  queryRecommendGoods: function(goodsClassId, level) {
    var that = this;
    if (goodsClassId != null && level != null) {
      getApp().requestFormGet('api/goods/queryRecommendGoods/' + goodsClassId + '/' + level, {}, function(res) {
        if (res != null) {
          that.setData({
            imgUrls: res.data.data
          });
        }
      });
    }
  },

  //跳转到商品详情页
  goodsInfo: function(e) {
    if (e.currentTarget.dataset.goodsid != null) {
      wx.navigateTo({
        url: '../productDetail/index?goodsId=' + e.currentTarget.dataset.goodsid
      })
    }
  },

  onShow: function() {
    const that = this;
    setTimeout(function() {
      that.queryShopCart()
    }, 1000)
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