// pages/product/index.js
var touch = 0; //触摸移动开始的起始值
var maxTouch = 0; //触摸移动过程中，最大值
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: 0, //下拉刷新的高度
    iconAnimation: null, // 搜索框图标移动动画，true左移,false右移
    scrollTop: 0,
    isScrollTop: true, //scroll-view是否达到顶部
    cartnum: 0, //购物车订单数
    curIndex: 0,
    statusId: 0,
    curSort: false, //价格排序
    saleSort: false, //销量排序
    tabs: [{
        name: "全部"
      },
      {
        name: "有秀"
      },
      {
        name: "销量"
      },
      {
        name: "价格"
      },
      {
        name: "筛选"
      }
    ],
    productsList: [],
    searchStr: '',
    total: null,
    filtrate: {
      classId: 1,
      brandId: 1,
      level: 1
    }, //筛选数据
    refresh: true, //加载图标的显示
    close: true, //关闭按键状态
  },

  /**
   * 跳转购物车页面
   */
  toCart: function(e) {
    wx.navigateTo({
      url: '../cart/index',
    })
  },

  queryCartNum: function() {
    var that = this;
    //查询购物车商品
    getApp().requestGet('api/goods/queryShoppingCart', {}, getApp().globalData.header, function(res) {
      if (res.data.code == 200) {
        that.setData({
          cartnum: res.data.data.length
        });
      }
    });
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
        productsList: []
      })
      this.getMusicInfo()
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
      _self.getMusicInfo();
    });
  },

  /**
   * 下拉刷新，监听触摸移动
   */
  touchmove: function(e) {
    if (this.data.isScrollTop) {
      if (touch === 0) {
        touch = e.touches[0].pageY
      } else {
        var difference = (e.touches[0].pageY - touch)
        maxTouch = maxTouch < e.touches[0].pageY ? e.touches[0].pageY : maxTouch;
        if (difference > 150) {
          difference = 150 - (maxTouch - e.touches[0].pageY);
        }
        this.setData({
          height: difference
        })
      }
    }
  },

  /**
   * 下拉刷新，监听触摸结束
   */
  touchend: function(e) {
    if (this.data.isScrollTop) {
      if (this.data.height === 150) {
        this.setData({
          productsList: [],
        })
        this.getMusicInfo();
      }
      this.setData({
        scrollTop: 0,
        height: 0
      })
      touch = maxTouch = 0;
    }
  },

  /**
   * 监听scroll-view滚动
   */
  scroll: function(e) {
    //如果是下拉，并且距离顶部小于10，
    if (e.detail.deltaY >= 0 && e.detail.scrollTop < 100) {
      this.setData({
        isScrollTop: true
      })
    } else if (e.detail.deltaY <= 0 && e.detail.scrollTop < 80) {
      this.setData({
        isScrollTop: true
      })
    } else {
      if (this.data.isScrollTop = true) {
        this.setData({
          isScrollTop: false
        })
      }
    }
  },

  // 标签切换
  tabhandle: function(e) {
    var _self = this;
    var curIndex = e.currentTarget.id;
    var statusId = e.currentTarget.id;
    switch (curIndex) {
      case "0":
        _self.setData({
          filtrate: {
            classId: 1,
            brandId: 1,
            level: 1
          },
          searchStr: ''
        });
        break;

      case "2":
        if (curIndex == this.data.curIndex) {
          _self.setData({
            saleSort: !_self.data.saleSort
          })
        }
        if (this.data.saleSort) {
          statusId = parseInt(curIndex) + 2;
        };
        break;

      case "3":
        if (curIndex == this.data.curIndex) {
          _self.setData({
            curSort: !_self.data.curSort
          })
        }
        if (this.data.curSort) {
          statusId = parseInt(curIndex) + 2;
        };
        break;

      case "4":
        wx.navigateTo({
          url: './filtrate/index'
        });
        break;

      default:
        break;

    }
    _self.setData({
      productsList: [],
      statusId: statusId,
      curIndex: curIndex
    }, function() {
      _self.getMusicInfo()
    })
  },

  // 分页加载数据
  getMusicInfo: function() {
    var that = this,
      param = this.data.filtrate;
    param.pageIndex = that.data.productsList.length,
      param.pageSize = 10,
      param.searchStr = that.data.searchStr,
      param.statusId = that.data.statusId;

    getApp().requestFormGet('api/goods/queryGoods', param, function(res) {
      var contentlistTem = that.data.productsList,
        contentlist = res.data.data.data;

      if (res.data.code == that.data.statusId) {
        that.setData({
          refresh: true,
          productsList: contentlistTem.concat(contentlist),
          total: res.data.data.total,
          height: 0,
        })
      }
    });
  },

  jumpToProductDetail: function(e) {
    if (e.currentTarget.dataset.id != null) {
      wx.navigateTo({
        url: '../productDetail/index?goodsId=' + e.currentTarget.dataset.id,
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getMusicInfo();
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
    this.queryCartNum();
  },

  /**
   * 生命周期函数--监听页面隐藏
   * 当navigateTo或底部tab切换时调用
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
    if (this.data.productsList.length < this.data.total) {
      this.setData({
        refresh: false
      })
      this.getMusicInfo()
    }
  }
})