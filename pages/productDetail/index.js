// pages/productDetail/index.js
//引入公共模块文件
var common = require('../template/index.js');
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */

  data: {
    swiperIndex: 0,
    userId: null, //转发时添加到转发信息
    goodsId: 0,
    cartnum: 0,
    goodsInfo: {},
    curIndex: 0,
    curHeight: "950rpx",
    isChoosetype: false,
    scrollHeight: 550,
    showModal: false,
    sizes: [],
    colors: [],
    userCommentList: [], //商品评论数据
    userCommentTotal: 0, //商品评论总数
    sellerList: null, //商品周围店铺地址
    goodsSpecList: [],
    getSize: '',
    getColor: '',
    quality: 0, //商品库存
    curCount: 1, //购买数量
    imgUrls: [],
    price: 0.00,
    indicatorDots: true, //是否显示面板指示点
    indicatorColor: '#A7A39F',
    indicatorActiveColor: '#3EC0C4',
    autoplay: true, //是否自动切换
    interval: 3000, //自动切换时间间隔,3s
    duration: 1000, //  滑动动画时长1s
    goodsSpecId: 0, //规格ID
    goodsSpec: {},
    //星级评分
    star: [0, 1, 2, 3, 4],
    normalSrc: 'fa-star-o',
    selectedSrc: 'fa-star',
    showModalStatus: false, //地图弹出框状态
    describe: '',
    shoppingCarId: null,
    fittingShowList: [], //试衣秀列表
    fittingShowListTotal: null,
    showUserId: null, //发布试衣秀用户ID
    videoId: null, //秀视频ID
    cartOrBuy: null, // true加入购物车false购买
  },

  /**
   * 跳转购物车页面
   */
  toCart: function(e) {
    if (this.data.cartnum === 0) {
      wx.showToast({
        title: '购物车没有商品',
        icon: 'none',
      })
    } else {
      wx.navigateTo({
        url: '../cart/index',
      })
    }
  },

  //标签切换
  swiperChange(e) {
    this.setData({
      swiperIndex: e.detail.current
    })
  },

  //承诺弹出框
  representFrame: function(e) {
    this.setData({
      showModal: true
    })
  },

  //加载试衣秀数据
  loadFittingShow: function() {
    var _self = this;
    var param = {
      pageIndex: _self.data.fittingShowList.length,
      pageSize: 10,
    }

    getApp().requestFormGet('api/revised/goodsVideoShowList/' + _self.data.goodsInfo.uId, param, function(res) {
      var contentlistTem = _self.data.fittingShowList;
      var contentlist = res.data.data.data;
      for (var i = 0; i < contentlist.length; i++) {
        contentlist[i].videoUrl = contentlist[i].videoUrl.substr(0, contentlist[i].videoUrl.length - 4);
        contentlist[i].distance = common.shopDistance(contentlist[i].latitude, contentlist[i].longtitude);
      }
      _self.setData({
        fittingShowList: contentlistTem.concat(contentlist),
        fittingShowListTotal: res.data.data.total
      })

    });
  },

  //跳转到试衣秀详情页
  jumpToFittingShowInfo: function(e) {
    var index = e.currentTarget.dataset.index,
      allVideoArray = this.data.fittingShowList;
    if (index > 50 && allVideoArray.length > 100) {
      allVideoArray = allVideoArray.slice(index - 50, index + 50);
    }
    if (allVideoArray != null) {
      wx.navigateTo({
        url: '../fittingShow/fittingShowInfo/index?allVideoArray=' + JSON.stringify(allVideoArray) + '&index=' + index,
      })
    }
  },

  // 标签切换
  tabhandle: function(e) {
    var curIndex = e.currentTarget.id;
    this.setData({
      curIndex: curIndex
    }, () => {
      //标签切换时对应内容的高度
      if (curIndex == 0) {
        this.curHeight('#describe', curIndex);
      } else if (curIndex == 1) {
        this.curHeight('#evaluate', curIndex);
      } else if (curIndex == 2) {
        this.curHeight('#seller', curIndex);
        this.selectShopAddress();
      } else {
        this.curHeight('#fittingShow', curIndex);
        this.loadFittingShow();
      }
    });
  },

  // 选择规格
  choosetype: function(e) {
    //弹出 选择规格弹出框
    this.setData({
      isChoosetype: true,
      cartOrBuy: null
    })
  },

  sizeradioChange: function(e) {
    var sizes = this.data.sizes,
      value = e.detail.value;
    for (var i = 0, lenI = sizes.length; i < lenI; ++i) {
      if (sizes[i].value == value) {
        sizes[i].checked = true;
      } else {
        sizes[i].checked = false;
      }
    }
    this.setData({
      sizes: sizes,
      getSize: value
    });
    this.selectGoodsColor();
    this.selectGoodsQuality();
  },

  colorradioChange: function(e) {
    var colors = this.data.colors,
      value = e.detail.value;
    for (var i = 0, lenI = colors.length; i < lenI; ++i) {
      if (colors[i].value == value) {
        colors[i].checked = true;
      } else {
        colors[i].checked = false;
      }
    }
    this.setData({
      colors: colors,
      getColor: value
    });
    this.selectGoodsQuality();
  },

  // 加入购物车事件
  addtoCard: function() {
    const _self = this;
    if (getApp().globalData.userAuthorization) {
      if (JSON.stringify(_self.data.goodsSpec) != "{}") {
        var data = {
          id: _self.data.shoppingCarId,
          goodsId: _self.data.goodsInfo.uId,
          goodsSpecId: _self.data.goodsSpecId,
          num: _self.data.curCount,
          showUserId: _self.data.showUserId,
          videoId: _self.data.videoId,
          commission: _self.data.goodsInfo.commission
        }
        getApp().requestPost('/api/goods/insertShoppingCart', data, getApp().globalData.header, function(res) {
          if (res.data.code == 200) {
            wx.navigateTo({
              url: '../cart/index',
            })
          }
        });
      } else {
        _self.setData({
          isChoosetype: true,
          cartOrBuy: true
        })
      }
    } else {
      wx.navigateTo({
        url: '../getUserInfo/index',
      })
    };
  },


  // 立即购买事件
  buy: function(e) {
    const _self = this;
    if (getApp().globalData.userAuthorization) {
      if (_self.data.goodsId.status == 0) {
        wx.showToast({
          title: '商品已下架',
          icon: 'none',
          duration: 1000
        })
        return
      }
      _self.getOrder(2);
    } else {
      wx.navigateTo({
        url: '../getUserInfo/index',
      })
    }
  },

  //选择规格
  formSubmit: function(e) {
    var goodsSpec = this.data.goodsSpec
    goodsSpec.color = this.data.getColor
    goodsSpec.size = this.data.getSize
    goodsSpec.curCount = this.data.curCount
    this.setData({
      goodsSpec: goodsSpec,
      isChoosetype: false
    })
    if (this.data.cartOrBuy !== null) {
      if (this.data.cartOrBuy) {
        this.addtoCard()
      } else {
        this.buy()
      }
    }
  },

  closeTypeframe: function(e) {
    this.setData({
      isChoosetype: false
    })
  },

  //标签切换显示内容高度自适应
  //parentName: 父容器的ID
  //curIndex：切换标签的curIndex
  curHeight: function(parentName, curIndex) {
    var _self = this;
    //创建节点选择器
    // 获取用户高度
    let query = wx.createSelectorQuery().in(_self);
    query.select(parentName).boundingClientRect()
    query.exec(function(res) {
      var curHeight = res[0].height + 12;
      _self.setData({
        curIndex: curIndex,
        curHeight: curHeight
      });
    })
  },

  getOrder: function(status) {
    const that = this;
    if (JSON.stringify(this.data.goodsSpec) != "{}" && this.data.quality != 0) {
      var goodsIdList = []
      goodsIdList.push({
        goodsId: that.data.goodsInfo.uId,
        num: that.data.curCount,
        goodsSpecId: that.data.goodsSpecId,
        showUserId: that.data.showUserId,
        videoId: that.data.videoId,
        commission: that.data.goodsInfo.commission,
        cashBach: that.data.goodsInfo.cashBach
      });
      if (status == 2) {
        wx.navigateTo({
          url: '../confirmOrder/index?goodsIdList=' + JSON.stringify(goodsIdList) + '&shoppingStatus=0&status=' + status,
        })
      }
    }
    if (this.data.quality == 0) {
      wx.showToast({
        title: '商品库存为空，请选择其他商品',
        icon: 'none'
      })
    }
    if (JSON.stringify(this.data.goodsSpec) == "{}") {
      this.setData({
        isChoosetype: true,
        cartOrBuy: false
      })
    }
  },

  //查询商品信息
  queryGoods: function() {
    const that = this;
    getApp().requestGet('api/goods/queryGoods/' + that.data.goodsId, {}, getApp().globalData.header, function(res) {
      that.setData({
        goodsInfo: res.data.data,
        goodsSpecList: res.data.data.GoodsSpec,
        getColor: res.data.data.GoodsSpec[0].color,
        getSize: res.data.data.GoodsSpec[0].size,
        imgUrls: res.data.data.carouselImage,
        userId: res.data.data.userId,
        price: res.data.data.price,
        describe: common.textParsing(res.data.data.describe)
      });
      that.selectGoodsQuality();
      that.selectGoodsSpec();
      that.selectGoodsColor();
      // that.swiperChange();
    });
  },

  //查询购物车
  queryCart: function() {
    const that = this
    getApp().requestGet('api/goods/queryShoppingCart', {}, getApp().globalData.header, function(res) {
      if (res.data.code == 200) {
        that.setData({
          cartnum: res.data.data.length
        });
      }
    });
  },

  /**
   * 评论图片的预览
   */
  previewImage: function(e) {
    var parentIndex = e.currentTarget.dataset.parentindex;
    var index = e.currentTarget.dataset.index;
    var urls = [];
    var imageList = this.data.userCommentList[parentIndex].imageList;
    for (let i = 0, length = imageList.length; i < length; i++) {
      urls.push(imageList[i].resourceUrl);
    }
    wx.previewImage({
      current: imageList[index].resourceUrl,
      urls: urls,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    that.setData({
      goodsId: options.goodsId,
      scrollHeight: wx.getSystemInfoSync().windowHeight,
    });

    //: 判断购物车传递的参数
    if (options.shoppingCarId != null) {
      that.setData({
        shoppingCarId: options.shoppingCarId
      });
    }
    if (options.goodsSpecId != null && options.goodsSpec != null) {
      that.setData({
        goodsSpecId: options.goodsSpecId,
        goodsSpec: JSON.parse(options.goodsSpec)
      });
    }
    //: 判断试衣秀详情传递的参数
    if (options.showUserId != null && options.videoId != null) {
      that.setData({
        showUserId: options.showUserId,
        videoId: options.videoId
      });
    }

    //: 获取商品评论信息
    this.selectComment();
    if (getApp().globalData.header.Cookie == '') {
      getApp().registered({
        parentId: options.parentId
      }, function() {
        that.queryGoods(options.goodsId)
      })
    } else {
      that.queryGoods(options.goodsId)
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // this.swiperChange();
    if (this.data.curIndex == 2) {
      this.mapCtx = wx.createMapContext('myMap')
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      cartOrBuy: null
    })
    this.queryCart()
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
    const that = this;
    const wxCurrPage = getCurrentPages(); //:获取当前页面的页面栈
    const wxPrevPage = wxCurrPage[wxCurrPage.length - 2]; //:获取上级页面的page对象
    //:返回确认订单页面时，更新订单
    if (wxPrevPage.route == "pages/confirmOrder/index") {
      var num = null;
      if (that.data.goodsSpec.orderType == 1) {
        num = {
          num: 1,
          minusStatus: false
        };
      } else {
        num = that.data.curCount;
      }
      var selectNum = 'num[' + this.data.goodsSpec.index + ']';
      var selectGoods = 'goodsIdList[' + this.data.goodsSpec.index + '].goodsSpecId';
      var selectOrderColor = 'orderList[' + this.data.goodsSpec.index + '].choseGoodsSpec.color';
      var selectOrderSize = 'orderList[' + this.data.goodsSpec.index + '].choseGoodsSpec.size';
      wxPrevPage.setData({
        [selectNum]: num,
        [selectGoods]: that.data.goodsSpecId,
        [selectOrderColor]: that.data.goodsSpec.color,
        [selectOrderSize]: that.data.goodsSpec.size
      });
    }
    //:返回购物车页面时，更新购物车记录
    if (wxPrevPage.route == "pages/cart/index") {
      if (that.data.shoppingCarId != null) {
        that.addtoCard();
      }
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
    var curIndex = this.data.curIndex;
    if (curIndex == 0 && this.data.goodsInfo == null) {

    }
    if (curIndex == 1) {
      if (this.data.userCommentList.length < this.data.userCommentTotal) {
        this.selectComment();
      }
      if (this.data.userCommentTotal != 0 && this.data.userCommentList.length == this.data.userCommentTotal) {

      }
    }
    if (curIndex == 3 && this.data.fittingShowList.length < this.data.fittingShowListTotal) {
      this.loadFittingShow();
    }
  },
  /**
   * 页面转发
   */
  onShareAppMessage: function() {
    return {
      title: this.data.goodsInfo.goodsName,
      path: 'pages/productDetail/index?goodsId=' + this.data.goodsInfo.uId + '&parentId=' + getApp().globalData.userId,
      imageUrl: this.data.imgUrls[0].resourceUrl
    }
  },

  //* 商品评论查询
  selectComment: function() {
    var that = this;
    var parma = {
      pageIndex: that.data.userCommentList.length,
      pageSize: 10
    }
    getApp().requestGet('api/goods/queryGoodsComment/' + that.data.goodsId, parma, getApp().globalData.header, function(res) {
      var contentlistTem = that.data.userCommentList;
      if (res.data.data != null || res.data.data.total > 0) {
        if (that.data.page == 0) {
          contentlistTem = []
        }
        var contentlist = res.data.data.data;
        if (that.data.userCommentList.length == res.data.data.total) {
          that.setData({
            hasMoreData: false
          })
        } else {
          contentlist.forEach((item) => {
            item.userName = util.partlyHidden(item.userName);
          });
          that.setData({
            userCommentList: contentlistTem.concat(contentlist),
            hasMoreData: true,
            userCommentTotal: res.data.data.total
          })
        }
      } else {
        wx.showToast({
          title: '数据为空',
          icon: 'none'
        })
      }
      // that.swiperChange();
    });
  },

  //商品在卖店铺查询
  selectShopAddress: function() {
    const that = this;
    var goodsId = this.data.goodsId;
    wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标  
      success: function(res) {
        var data = {
          goodsId: goodsId,
          laltitude: res.latitude,
          longtitude: res.longitude
        }
        getApp().requestPost('api/goods/queryAroundShop', JSON.stringify(data), getApp().globalData.header, function(result) {
          if (result.data.code == 200) {
            that.setData({
              sellerList: result.data.data
            });
          }
        });
      }
    })
  },

  getLocation: function() {
    this.selectShopAddress();
  },

  //查询商品库存
  selectGoodsQuality: function() {
    var goodsSpecList = this.data.goodsSpecList;
    var sizes = this.data.getSize;
    var colors = this.data.getColor;
    for (var i = 0; i < goodsSpecList.length; i++) {
      if (goodsSpecList[i].size == sizes && goodsSpecList[i].color == colors) {
        this.setData({
          quality: goodsSpecList[i].quality,
          goodsSpecId: goodsSpecList[i].id
        });
        break;
      }
    }
  },

  //遍历商品规格
  selectGoodsSpec: function() {
    var goodsSpecList = this.data.goodsSpecList;
    var sizes = [];
    for (var i = 0; i < goodsSpecList.length; i++) {
      sizes.push(goodsSpecList[i].size);
    }
    this.setData({
      sizes: sizes.unique()
    });
  },

  //查询商品颜色
  selectGoodsColor: function() {
    var colors = []
    var size = this.data.getSize
    var goodsSpecList = this.data.goodsSpecList;
    for (var i = 0; i < goodsSpecList.length; i++) {
      if (goodsSpecList[i].size == size) {
        colors.push({
          value: goodsSpecList[i].color,
          checked: false
        });
      }
    }
    colors[0].checked = true;
    this.setData({
      colors: colors,
      getColor: colors[0].value
    });
  },

  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function() {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function() {
    var that = this;
    var goodsAgent = [];
    var userAgent = {
      goodsId: that.data.goodsInfo.uId,
      agentStatus: that.data.goodsInfo.agentStatus
    };
    goodsAgent.push(userAgent);
    getApp().requestPost('api/goods/insertAgent', JSON.stringify(goodsAgent),
      getApp().globalData.header,
      function(res) {})
    wx.navigateTo({
      url: '../represent/index',
    })
  },

  //地图导航查找商店
  map: function(e) {
    var index = e.currentTarget.dataset.index;
    var shopPosition = this.data.sellerList[index];
    wx.openLocation({
      latitude: parseFloat(shopPosition.latitude),
      longitude: parseFloat(shopPosition.longtitude),
      scale: shopPosition.distance,
      name: shopPosition.shopName,
      address: shopPosition.address
    })
  },

  //隐藏地图
  hideModal: function() {
    this.setData({
      showModalStatus: false
    });
  },

  onUpdateNum: function(e) {
    this.setData({
      curCount: e.detail.num
    });
  }

})


//数组去重
Array.prototype.unique = function() {
  var res = [];
  var json = {};
  for (var i = 0; i < this.length; i++) {
    if (!json[this[i]]) {
      if (i == 0) {
        res.push({
          value: this[i],
          checked: true
        });
      } else {
        res.push({
          value: this[i],
          checked: false
        });
      }
      json[this[i]] = 1;
    }
  }
  return res;
}