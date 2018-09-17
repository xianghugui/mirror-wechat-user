// pages/product/filtrate/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clothesTabs: [{
      className: '全部',
      id: 1,
      level: 1,
      checked: true
    }],
    brandTabs: [{
      name: '全部',
      id: 1,
      checked: true
    }],
    priceRange: [{
      name: '0-99'
    }, {
      name: '99-199'
    }, {
      name: '199-299'
    }, {
      name: '299以上'
    }],
    allclassify: [],
    isChoose: [{
      name: '服装',
      dataName: 'clothesTabs',
      checked: false,
      index: 0
    }, {
      name: '品牌',
      dataName: 'brandTabs',
      checked: false,
      index: 0
    }, {
      name: '价格区间',
      dataName: 'priceRange',
      checked: true
    }, {
      name: '全部分类',
      dataName: 'allclassify',
      checked: false
    }],
    clothesTabsIndex: 1,
    minPrice: '',
    maxPrice: ''
  },

  clothesChange: function(e) {
    this.radioChange(e, this.data.clothesTabs, "clothesTabs", 0);
    this.setData({
      clothesTabsIndex: this.data.clothesTabs[e.detail.value].id
    });
    this.loadAllClassify();
  },

  brandChange: function(e) {
    this.radioChange(e, this.data.brandTabs, "brandTabs", 1);
  },

  priceRangeChange: function(e) {
    this.clearPriceRangeInput();
    this.radioChange(e, this.data.priceRange, "priceRange", 2);
    this.setData({
      priceRangeIndex: e.detail.value
    });
  },

  allclassifyChange: function(e) {
    this.radioChange(e, this.data.allclassify, "allclassify", 3);
  },

  //标签选择
  radioChange: function(e, data, dataName, index) {
    var _self = this;
    var value = e.detail.value;
    var isChoose = _self.data.isChoose[index];
    if (isChoose.index != null) {
      data[isChoose.index].checked = false;
    }
    data[value].checked = true;
    this.setData({
      [dataName]: data,
      ['isChoose[' + index + '].index']: e.detail.value
    });
  },

  //下拉切换
  toggleDisplay: function(e) {
    var _self = this;
    var isChoose = this.data.isChoose,
      value = e.currentTarget.dataset.index;
    var selectTab = 'isChoose[' + value + '].checked';
    this.setData({
      [selectTab]: !isChoose[value].checked
    });
  },

  //重置选择
  clearChoose: function(dataName, i) {
    if (this.data.isChoose[i].index != null) {
      var check = dataName + '[' + this.data.isChoose[i].index + '].checked';
      this.setData({
        [check]: false
      });
    }
  },

  //清空价格区间
  clearpriceRange: function() {
    this.clearChoose('priceRange', 2);
  },

  //清空输入价格区间
  clearPriceRangeInput: function() {
    this.setData({
      maxPrice: '',
      minPrice: ''
    });
  },


  formSubmit: function(e) {
    var checkData = e.detail.value;
    var formData = {};
    formData.classId = this.data.clothesTabs[checkData.clothesTabs].id;
    formData.level = this.data.clothesTabs[checkData.clothesTabs].level;
    formData.brandId = this.data.brandTabs[checkData.brandTabs].id;
    if (checkData.minPrice != "") {
      formData.startPrice = checkData.minPrice;
    }
    if (checkData.maxPrice != "") {
      formData.endPrice = checkData.maxPrice;
    }
    if (checkData.priceRange != "") {
      var priceRange
      if (checkData.priceRange == this.data.priceRange.length - 1) {
        priceRange = this.data.priceRange[checkData.priceRange].name.split("以上");
      } else {
        priceRange = this.data.priceRange[checkData.priceRange].name.split("-");
        formData.endPrice = priceRange[1];
      }
      formData.startPrice = priceRange[0];
    }
    if (checkData.allclassify != "") {
      formData.classId = this.data.allclassify[checkData.allclassify].id;
      formData.level = this.data.allclassify[checkData.allclassify].level;
    }
    const that = this;
    const wxCurrPage = getCurrentPages(); //:获取当前页面的页面栈
    const wxPrevPage = wxCurrPage[wxCurrPage.length - 2]; //:获取上级页面的page对象

    //判断是否返回商品页
    if (wxPrevPage.route == "pages/product/index") {

      //初始化数据
      wxPrevPage.setData({
        filtrate: formData,
        productsList: []
      }, function() {

        // 调用返回页的函数
        wxPrevPage.getMusicInfo();
      });
    }
    if (wxPrevPage.route == "pages/fittingShow/index") {
      wxPrevPage.setData({
        filtrate: formData,
        videoList: []
      }, function() {
        wxPrevPage.loadfittingShow(true);
      });
    }

    wx.navigateBack({
      delta: 2
    })
  },


  formReset: function(e) {
    var data = this.data.isChoose;
    this.clearpriceRange();
    for (var i = 0; i < data.length; i++) {
      if (data[i].index != null) {
        this.clearChoose(data[i].dataName, i);
      }
    }
    this.setData({
      ['clothesTabs[0].checked']: true,
      ['brandTabs[0].checked']: true,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _self = this;
    var clothesTabs = _self.data.clothesTabs;
    var brandTabs = _self.data.brandTabs;
    var allclassify = _self.data.allclassify;

    getApp().requestFormGet('api/goods/filtrate', {}, function(res) {
      if (res != null) {
        _self.setData({
          clothesTabs: clothesTabs.concat(res.data.data.clothesTabs),
          brandTabs: brandTabs.concat(res.data.data.brandTabs)
        });
        _self.loadAllClassify();
      }
    });
  },

  loadAllClassify: function() {
    const _self = this;

    getApp().requestFormGet('api/goods/allClassify/' + _self.data.clothesTabsIndex, {}, function(res) {
      if (res != null) {
        _self.setData({
          allclassify: res.data.data
        });
      }
    });
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