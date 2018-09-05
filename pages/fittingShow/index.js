// pages/fittingShow/index.js
// 引入SDK核心类
var QQMapWX = require('../../static/qqmap/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var common = require('../template/index.js');
var util = require('../../utils/util.js');
var touch = 0; //触摸移动开始的起始值
var maxTouch = 0; //触摸移动过程中，最大值
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconAnimation: null, // 搜索框图标移动动画，true左移,false右移
    videoList: [],
    total: null,
    cityName: '', //所在城市名
    searchStr: '',
    filtrate: {
      classId: 1,
      brandId: 1,
      level: 1
    }, //筛选数据
    refresh: true, //加载更多图标的显示
    close: true, //搜索栏关闭按键状态
  },


  onPageScroll: function(e) {
    this.setData({
      scrollTop: e.scrollTop
    })
  },

  jumpToFiltrate: function() {
    wx.navigateTo({
      url: '../product/filtrate/index',
    })
  },

  /**
   * 输入框获取焦点时
   */
  focus: function() {
    if (!this.data.iconAnimation) {
      this.setData({
        iconAnimation: true
      })
    }
  },

  /**
   * 输入框失去焦点
   */
  blur: function(e) {
    if (!this.data.close) {
      var searchStr = e.detail.value.replace(' ', '')
      this.setData({
        iconAnimation: true,
        searchStr: searchStr,
        videoList: []
      })
      this.loadfittingShow()
    } else {
      this.setData({
        iconAnimation: false
      })
    }
  },

  /**
   * 输入框输入时
   */
  bindinput: function(e) {
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
  clearInput: function() {
    const _self = this;
    this.setData({
      searchStr: "",
      close: true,
      iconAnimation: false
    }, function() {
      _self.loadfittingShow();
    });
  },

  /**
   *  跳转到试衣秀详情页
   *  index: 选中视频下标
   */
  jumpToFittingShowInfo: function(e) {
    var index = e.currentTarget.dataset.index,
      allVideoArray = this.data.videoList;

    //取前后共一百条数据
    if (index > 50 && allVideoArray.length > 100) {
      allVideoArray = allVideoArray.slice(index - 50, index + 50);
    }
    if (allVideoArray.length > 0) {
      wx.navigateTo({
        url: './fittingShowInfo/index?allVideoArray=' + JSON.stringify(allVideoArray) + '&index=' + index,
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _self = this;
    getApp().registered({}, function() {
      _self.getLocation();
    });
  },

  /**
   * 加载试衣秀数据
   */
  loadfittingShow: function() {
    var that = this,
      param = this.data.filtrate;
    param.pageIndex = that.data.videoList.length;
    param.pageSize = 10;
    param.searchStr = this.data.searchStr;

    getApp().requestFormGet('api/revised/allVideoShowList', param, function(res) {
      var contentlistTem = that.data.videoList,
        contentlist = res.data.data.data,
        i = contentlist.length,
        params = {};

      while (i--) {
        params.toLat = contentlist[i].latitude;
        params.toLon = contentlist[i].longtitude;
        params.shopId = contentlist[i].shopId;
        contentlist[i].videoUrl = contentlist[i].videoUrl.substr(0, contentlist[i].videoUrl.length - 4);
        contentlist[i].userName = util.partlyHidden(contentlist[i].userName)
        contentlist[i].distance = common.shopDistance(params);
      }
      that.setData({
        refresh: true,
        videoList: contentlistTem.concat(contentlist),
        total: res.data.data.total,
      })

      contentlistTem = null;
      contentlist = null;
      i = null;
      params = null;
    });
  },

  /**
   * 城市定位
   */
  getLocation: function() {
    var _self = this;
    if (_self.data.cityName == "") {
      wx.getLocation({
        type: 'wgs84',
        success: function(res) {
          getApp().globalData.userLat = res.latitude;
          getApp().globalData.userLon = res.longitude;
          // 实例化API核心类
          qqmapsdk = new QQMapWX({
            key: 'ZTYBZ-GZZWF-5QFJI-JFLJV-WAE6Q-MQBMV'
          });
          // 调用腾讯地图接口，根据地址解析经纬度
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: function(res) {
              var cityName = res.result.address_component.city.replace('市', '');
              _self.setData({
                cityName: cityName
              });
            }
          });
        }
      })
      _self.loadfittingShow();
    }
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
    const _self = this;
    if (getApp().globalData.userLat === "" && _self.data.total !== null) {
      _self.getLocation();
    }
    if (this.data.total == 0) {
      // 初始化筛选条件
      this.setData({
        filtrate: {
          classId: 1,
          brandId: 1,
          level: 1
        },
        searchStr: ''
      });
      this.loadfittingShow();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    const _self = this;
    this.setData({
      filtrate: {
        classId: 1,
        brandId: 1,
        level: 1
      },
      searchStr: '',
      curIndex: 0,
      close: true,
      iconAnimation: false
    });
    this.loadfittingShow();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this
    wx.showNavigationBarLoading();
    setTimeout(function() {
      wx.stopPullDownRefresh();
      that.setData({
        videoList: []
      });
      that.loadfittingShow();
      wx.hideNavigationBarLoading();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.videoList.length < this.data.total) {
      this.setData({
        refresh: false
      });
      var that = this
      setTimeout(function() {
        that.loadfittingShow();
      }, 1000);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})