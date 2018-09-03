// pages/fittingShow/fittingShowInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHome: true,
    isShowMore: false,
    showModalStatus: false,
    allVideoArray: [], //全部轮播视频
    allVideoArrayIndex: 0,
    pageType: 0, //页面类型: 0,试衣秀页面 1,试衣库页面
    isPriceDialog: false, //询价遮罩
    index: 0,
    videoStatus: false,
    windowWidth: null,
    windowHeight: null,
  },

  error: function(e) {
    wx.showToast({
      title: '视频加载失败',
      icon: 'none',
      duration: 2000
    })
  },

  //返回首页
  goToHome: function() {
    const _self = this;
    wx.switchTab({
      url: '../../fittingShow/index',
    }, function() {
      _self.setData({
        isHome: true
      });
    })
  },

  /**
   * 跳转到聊天界面
   */
  toChat: function() {
    const _self = this;
    getApp().userAuthorization(function() {
      var videoInfo = _self.data.allVideoArray[_self.data.allVideoArrayIndex];
      if (videoInfo != null) {
        var videoContext = wx.createVideoContext('videoShow');
        videoContext.pause();
        wx.navigateTo({
          url: '../../chat/index?userId=' + videoInfo.userId + '&withUser=1',
        })
      }
    }, function() {
      wx.navigateTo({
        url: '../../getUserInfo/index',
      })
    })
  },

  //跳转到商品详情
  jumpToProductDetail: function() {
    var videoInfo = this.data.allVideoArray[this.data.allVideoArrayIndex];
    if (videoInfo != null)
      wx.navigateTo({
        url: '../../productDetail/index?goodsId=' + videoInfo.goodsId + '&showUserId=' + videoInfo.userId + '&videoId=' + videoInfo.videoId
      })
  },

  //编辑
  jumpToAssociationClothing: function() {
    var allVideoArrayIndex = this.data.allVideoArrayIndex;
    var allVideoArray = this.data.allVideoArray[allVideoArrayIndex];
    var videoInfo = {
      videoId: allVideoArray.videoId,
      videoImageUrl: allVideoArray.videoImageUrl,
      goodsId: allVideoArray.goodsId,
      shopId: allVideoArray.shopId
    }
    var goodsInfo = {
      goodsId: allVideoArray.goodsId,
      commission: allVideoArray.goodsCommission,
      imagePath: [{
        resourceUrl: allVideoArray.goodsImageUrl
      }]
    }
    var videoContext = wx.createVideoContext('videoShow');
    videoContext.pause();

    wx.navigateTo({
      url: '../../dressingroom/associationClothing/index?videoInfo=' + JSON.stringify(videoInfo) + '&goodsInfo=' + JSON.stringify(goodsInfo)
    })
  },

  //删除
  deleteFittingShow: function() {
    var header = getApp().globalData.header,
      allVideoArray = this.data.allVideoArray,
      allVideoArrayIndex = this.data.allVideoArrayIndex;
    const _self = this;
    wx.showModal({
      title: '提示',
      content: '您确定解除关联该试衣秀吗?',
      success: function(res) {
        if (res.confirm) {
          getApp().requestPut('api/video/videoshow/' + allVideoArray[allVideoArrayIndex].videoId, {}, header, function(res) {
            allVideoArray.splice(allVideoArrayIndex, 1);
            const wxCurrPage = getCurrentPages(); //:获取当前页面的页面栈
            const wxPrevPage = wxCurrPage[wxCurrPage.length - 2]; //:获取上级页面的page对象
            if (wxPrevPage.route == "pages/dressingroom/index") {
              //初始化数据
              wxPrevPage.setData({
                videoShowList: [],
              }, function() {
                // 调用返回页的函数
                wxPrevPage.getUserVideoShow();
              });
            }

            if (wxPrevPage.route == "pages/fittingShow/index") {
              //初始化数据
              wxPrevPage.setData({
                videoShowList: [],
              }, function() {
                // 调用返回页的函数
                wxPrevPage.loadfittingShow();
              });
            }

            if (allVideoArray.length == 0) {
              wx.showToast({
                title: '解除成功',
                icon: 'none',
              })
              wx.navigateBack({
                delta: 1
              })
            }
            if (allVideoArrayIndex == allVideoArray.length - 1) {
              _self.setData({
                allVideoArrayIndex: allVideoArrayIndex - 1
              });
            }
            _self.setData({
              allVideoArray: allVideoArray,
            });
            wx.showToast({
              title: '解除成功',
              icon: 'none',
            })
          });
        }
      }
    })
  },

  //点赞
  checkLike: function() {
    const _self = this;
    getApp().userAuthorization(function() {
      var videoInfo = _self.data.allVideoArray[_self.data.allVideoArrayIndex];
      if (videoInfo.isLike == 0) {
        videoInfo.isLike = 1;
        //点赞数
        videoInfo.likeNum = videoInfo.likeNum + 1;
      } else {
        videoInfo.isLike = 0;
        videoInfo.likeNum = videoInfo.likeNum - 1;
      }

      getApp().requestFormGet('api/revised/like/' + videoInfo.videoId, {}, function(res) {});

      _self.setData({
        ['allVideoArray[' + _self.data.allVideoArrayIndex + ']']: videoInfo
      })
    }, function() {
      wx.navigateTo({
        url: '../../getUserInfo/index',
      })
    })
  },

  //隐藏弹出框
  hideShowMore: function() {
    this.setData({
      showModalStatus: false
    });
  },

  //显示弹出框
  showShowMore: function() {
    this.setData({
      showModalStatus: true
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var allVideoArray;
    var allVideoArrayIndex = 0;
    var isShowMore = false;
    var _self = this;
    const wxCurrPage = getCurrentPages();
    const wxPrevPage = wxCurrPage[wxCurrPage.length - 2];
    var pageType = options.pageType;

    //判断是否是分享的视频
    if (wxPrevPage == null) {
      allVideoArray = [];
      allVideoArray.push(JSON.parse(options.videoInfo));
      getApp().registered({});
      _self.setData({
        isHome: false
      });
    } else {
      allVideoArray = JSON.parse(options.allVideoArray);
      if (options.index >= 50 && allVideoArray.length == 100) {
        allVideoArrayIndex = 50;
      } else {
        allVideoArrayIndex = options.index;
      }
    }
    allVideoArray[allVideoArrayIndex].pageView = 1;

    //判断是否是自己的视频
    if (getApp().globalData.userId == allVideoArray[allVideoArrayIndex].userId) {
      isShowMore = true;
    }

    this.setData({
      allVideoArray: allVideoArray,
      isShowMore: isShowMore,
      allVideoArrayIndex: allVideoArrayIndex,
      index: options.index
    });
  },

  //手指刚放到屏幕触发
  touchS: function(e) {
    //判断是否只有一个触摸点
    this.startY = e.changedTouches[0].y
  },

  touchM: function(e) {
    this.endY = e.changedTouches[0].y
  },

  touchE: function(e) {
    var allVideoArrayIndex = this.data.allVideoArrayIndex,
      isShowMore = false,
      that = this;
    var disY = this.startY - this.endY;

    if (disY < -40 && allVideoArrayIndex > 0) {
      allVideoArrayIndex--;
    } else if (disY > 40 && allVideoArrayIndex < this.data.allVideoArray.length - 1) {
      allVideoArrayIndex++;
    } else {
      return;
    }

    var selectVideo = this.data.allVideoArray[allVideoArrayIndex];
    //添加视频浏览量
    if (selectVideo.pageView == null) {
      selectVideo.pageView = 0;
    }
    selectVideo.pageView++;
    //判断是否是自己的视频
    if (typeof selectVideo.userId != 'undefined' && getApp().globalData.userId == selectVideo.userId) {
      isShowMore = true;
    }

    this.setData({
      isShowMore: isShowMore,
      allVideoArrayIndex: allVideoArrayIndex,
      ['allVideoArray[' + allVideoArrayIndex + ']']: selectVideo
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(res) {
    this.videoContext = wx.createVideoContext('videoShow');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (typeof this.videoContext != 'undefined') {
      this.videoContext.play();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    const wxCurrPage = getCurrentPages();
    const wxPrevPage = wxCurrPage[wxCurrPage.length - 2];

    const _self = this.data;
    var allVideoArray = _self.allVideoArray,
      allVideoArrayIndex = _self.allVideoArrayIndex;

    if (wxPrevPage.route == "pages/fittingShow/index") {
      var index = 0;
      if (_self.index >= 50 && allVideoArray.length == 100) {
        index = allVideoArrayIndex + _self.index - 50;
      } else {
        index = allVideoArrayIndex;
      }
      var videoId,
        pageView;
      //添加视频浏览量
      for (var i = 0, len = allVideoArray.length; i < len; i++) {
        if (allVideoArray[i].pageView != null) {
          videoId = allVideoArray[i].videoId,
            pageView = allVideoArray[i].pageView;
          getApp().requestFormGet('api/revised/addPageView', {
            videoId: videoId,
            postPageView: pageView
          }, function(res) {});
        }
        wxPrevPage.setData({
          ['videoList[' + index + ']']: allVideoArray[allVideoArrayIndex]
        });
      }
    } else if (wxPrevPage.route == "pages/dressingroom/index" && this.data.pageType == 0) {
      wxPrevPage.setData({
        videoShowList: allVideoArray
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var videoInfo = this.data.allVideoArray[this.data.allVideoArrayIndex]
    return {
      title: videoInfo.goodsName,
      path: '/pages/fittingShow/fittingShowInfo/index?videoInfo=' + JSON.stringify(videoInfo),
      // imageUrl: videoInfo.videoImageUrl
    }
  }

})