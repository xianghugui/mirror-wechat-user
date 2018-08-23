// pages/dressingroom/associationClothing/selectGoods/filter/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classList: null,
    brandList: null,
    classId: null,
    brandId: null,
  },

  selectClass: function(e) {
    var classId = e.currentTarget.dataset.id
    classId = classId === this.data.classId ? null : classId
    this.setData({
      classId: classId
    });
  },

  selectBrand: function(e) {
    var brandId = e.currentTarget.dataset.id
    brandId = brandId === this.data.brandId ? null : brandId
    this.setData({
      brandId: brandId
    });
  },

  formReset: function(e) {
    this.setData({
      brandId: null,
      classId: null,
    });
  },

  formSubmit: function(e) {
    var param = {}
    var classId = this.data.classId;
    var brandId = this.data.brandId;
    if (classId != null){
      param.classId = classId;
    }
    if (brandId != null) {
      param.brandId = brandId;
    }
    const wxCurrPage = getCurrentPages(); //:获取当前页面的页面栈
    const wxPrevPage = wxCurrPage[wxCurrPage.length - 2]; //:获取上级页面的page对象
    if (wxPrevPage.route == "pages/dressingroom/associationClothing/selectGoods/index") {
      wxPrevPage.setData({
        searchStr: '',
        productsList: [],
        param: param,
        classId: classId,
        brandId: brandId,
        selectIndex: null
      }, function() {
        wxPrevPage.getGoods();
      });
    }
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var data = JSON.parse(options.data)
    var that = this
    getApp().requestFormGet('/api/goods/shop/' + data.shopId + '/class', {},
      function(res) {
        that.setData({
          classList: res.data.data.class,
          brandList: res.data.data.brand,
          classId: data.classId,
          brandId: data.brandId
        })
      }
    )
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})