// pages/dressingroom/associationClothing/selectGoods/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectIndex: null, //选中的索引
    videoInfo: null,
    productsList: [],
    total: null,
    pageSize: 10,
    refresh: true, //加载图标的显示
    iconAnimation: null, // 搜索框图标移动动画，true左移,false右移
    classId: null,
    brandId: null,
    param: {},
    searchStr: '',
    close: true, //关闭按键状态
  },

  jumpToFiltrate: function () {
    var data = {
      shopId: this.data.videoInfo.shopId,
      classId: this.data.classId,
      brandId: this.data.brandId
    }
    wx.navigateTo({
      url: 'filter/index?data=' + JSON.stringify(data),
    })
  },
  /**
  * 输入框获取焦点时
  */
  focus: function () {
    if (!this.data.iconAnimation) {
      this.setData({
        iconAnimation: true
      })
    }
  },

  /**
   * 输入框失去焦点
   */
  blur: function (e) {
    if (!this.data.close) {
      var searchStr = e.detail.value.replace(' ', '')
      this.setData({
        iconAnimation: true,
        param: {
          searchStr: searchStr
        },
        productsList: []
      })
    } else {
      this.setData({
        iconAnimation: false,
        param: {
          searchStr: ""
        }
      })
    }
    this.getGoods()
  },

  /**
   * 输入框输入时
   */
  bindinput: function (e) {
    if (e.detail.cursor > 0 && this.data.close) {
      this.setData({
        close: false
      });
    }
    if (e.detail.cursor == 0 && !this.data.close) {
      this.setData({
        close: true
      });
    }
  },

  /**
   * 清空输入框
   */

  clearInput: function () {
    const _self = this;
    this.setData({
      searchStr: "",
      param: {
        searchStr: ""
      },
      close: true
    }, function () {
      _self.getGoods();
    });
  },

  /**
   * 滚动到底部
   */
  lower: function (e) {
    if (this.data.productsList.length !== this.data.total){
      this.setData({
        refresh: false,

      })
      this.getGoods();
    }
  },

  /**
   * 确认关联
   */
  select: function(e){
    var goodsInfo = this.data.productsList[this.data.selectIndex]
    wx.redirectTo({
      url: '../index?videoInfo=' + JSON.stringify(this.data.videoInfo)
      + '&goodsInfo=' + JSON.stringify(goodsInfo)
    })
  },

  /**
   * 选择关联服装
   */
  selectGoods: function(e){
    this.setData({
      selectIndex: e.currentTarget.dataset.index
    })
  },

  /**
   * 获取服装
   */
  getGoods: function (e) {
    var videoInfo = this.data.videoInfo;
    var productsList = this.data.productsList
    var that = this;
    var param = this.data.param
    param.pageIndex = productsList.length;
    param.pageSize = this.data.pageSize;
    getApp().requestFormGet('/api/revised/queryVideoAssociationGoods/' + videoInfo.shopId, param,
      function (res) {
        productsList = productsList.concat(res.data.data.data);
        that.setData({
          refresh: true,
          productsList: productsList,
          total: res.data.data.total
        })
        if (videoInfo.goodsId !== null && that.data.selectIndex === null){
          for (let i = 0, length = productsList.length; i < length; i++) {
            if(productsList[i].goodsId === videoInfo.goodsId){
              that.setData({
                selectIndex: i
              })
              break;
            }
          }
        }
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var videoInfo = JSON.parse(options.videoInfo)
    this.setData({
      videoInfo: videoInfo,
    })
    getApp().requestFormGet('/api/goods/shop/' + videoInfo.shopId + '/class', {},
      function (res) {
        that.setData({
          classList: res.data.data.class,
          brandList: res.data.data.brand
        })
      }
    )
    this.getGoods();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
})