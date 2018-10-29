 // pages/fittingShow/fittingStoreInfo/index.js
 Page({

   /**
    * 页面的初始数据
    */
   data: {
     isHome: true,
     isShowMore: false,
     showModalStatus: false,
     allVideoArray: [], //全部轮播视频
     allVideoArrayIndex: 0, //
     isPriceDialog: false, //询价遮罩
     sizes: [], //询价商品规格
     sizeIndex: null,
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
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {
     var allVideoArray;
     var allVideoArrayIndex = 0;
     var isShowMore = false;
     var _self = this;
     const wxCurrPage = getCurrentPages();
     const wxPrevPage = wxCurrPage[wxCurrPage.length - 2];
     //判断是否是分享的视频
     if (typeof wxPrevPage === 'undefined') {
       getApp().registered({})
       allVideoArray = [];
       allVideoArray.push(JSON.parse(options.videoInfo));
       // getApp().registered({});
       _self.setData({
         isHome: false
       });
     } else {
       allVideoArray = JSON.parse(options.allVideoArray);
       allVideoArrayIndex = options.index;
     }

     this.loadSizes();
     //判断是否是自己的视频
     var userId = allVideoArray[allVideoArrayIndex].userId
     if (typeof userId != 'undefined' && getApp().globalData.userId == userId) {
       isShowMore = true;
     }

     allVideoArray[allVideoArrayIndex].videoImageUrl = decodeURIComponent(allVideoArray[allVideoArrayIndex].videoImageUrl);
     allVideoArray[allVideoArrayIndex].videoUrl = decodeURIComponent(allVideoArray[allVideoArrayIndex].videoUrl);
     this.setData({
       allVideoArray: allVideoArray,
       isShowMore: isShowMore,
       allVideoArrayIndex: allVideoArrayIndex
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
     var allVideoArray = this.data.allVideoArray,
       allVideoArrayIndex = this.data.allVideoArrayIndex,
       isShowMore = false;

     var disY = this.startY - this.endY;
     if (disY < -50 && allVideoArrayIndex > 0) {
       allVideoArrayIndex--;
     } else if (disY > 50 && allVideoArrayIndex < this.data.allVideoArray.length - 1) {
       allVideoArrayIndex++;
     }

     this.startY = 0;
     this.endY = 0;

     //判断是否是自己的视频
     if (typeof allVideoArray[allVideoArrayIndex].userId != 'undefined' && getApp().globalData.userId == allVideoArray[allVideoArrayIndex].userId) {
       isShowMore = true;
     }

     allVideoArray[allVideoArrayIndex].videoImageUrl = decodeURIComponent(allVideoArray[allVideoArrayIndex].videoImageUrl);
     allVideoArray[allVideoArrayIndex].videoUrl = decodeURIComponent(allVideoArray[allVideoArrayIndex].videoUrl);
     this.setData({
       allVideoArrayIndex: allVideoArrayIndex,
       isShowMore: isShowMore
     })
   },

   /**
    * 试衣库标签点击事件 --------------------------------------------
    */

   /**
    * 试衣库删除视频
    */

   deleteVideo: function() {
     const that = this;
     var allVideoArrayIndex = this.data.allVideoArrayIndex;
     var allVideoArray = that.data.allVideoArray;
     wx.showModal({
       title: '提示',
       content: '您确定删除该试衣视频吗',
       success: function(res) {
         if (res.confirm) {
           getApp().requestDel('api/video/' + allVideoArray[allVideoArrayIndex].videoId, null,
             getApp().globalData.header,
             function() {
               const wxCurrPage = getCurrentPages(); //:获取当前页面的页面栈
               const wxPrevPage = wxCurrPage[wxCurrPage.length - 2]; //:获取上级页面的page对象
               if (wxPrevPage.route == "pages/dressingroom/index") {
                 //初始化数据
                 wxPrevPage.setData({
                   items: [],
                   deleteIndex: null,
                 }, function() {
                   // 调用返回页的函数
                   wxPrevPage.queryVideoList();
                 });
               }
               allVideoArray.splice(allVideoArrayIndex, 1);
               if (allVideoArray.length == 0) {
                 wx.showToast({
                   title: '删除成功',
                   icon: 'none'
                 })
                 wx.navigateBack({
                   delta: 1
                 })
                 return;
               }
               if (allVideoArrayIndex == allVideoArray.length - 1) {
                 that.setData({
                   allVideoArrayIndex: allVideoArrayIndex - 1
                 });
               }
               that.setData({
                 allVideoArray: allVideoArray
               });
               wx.showToast({
                 title: '删除成功',
                 icon: 'none'
               })
             })
         }
       }
     })
   },

   /**
    * 与商家聊天
    */
   chathandle: function(e) {
     if (this.data.allVideoArrayIndex != null) {
       var videoContext = wx.createVideoContext('videoShow');
       videoContext.pause();
       wx.navigateTo({
         url: '../../chat/index?userId=' + this.data.allVideoArray[this.data.allVideoArrayIndex].shopUserId
       })
     }
   },
   /**
    * 关联服装
    */
   clothinghandle: function(e) {
     //传递视频信息(店铺id，视频id，视频图片Src)
     var item = this.data.allVideoArray[this.data.allVideoArrayIndex]
     var videoInfo = {
       videoImageUrl: encodeURIComponent(item.videoImageUrl),
       shopId: item.shopId,
       videoId: item.videoId,
       goodsId: item.goodsId
     }
     var url = '../../dressingroom/associationClothing/index?videoInfo=' + JSON.stringify(videoInfo);
     if (item.goodsId !== null && item.goodsId != -1) {
       var goodsInfo = {
         goodsId: item.goodsId,
         imagePath: item.imagePath,
         commission: item.commission
       }
       url += '&goodsInfo=' + JSON.stringify(goodsInfo);
     }
     var videoContext = wx.createVideoContext('videoShow');
     videoContext.pause();
     wx.navigateTo({
       url: url,
     })
   },

   /**
    * 询价
    */
   pricehandle: function(e) {
     var that = this;
     //查询当前视频是否已询价，返回data： 200，已询价，data： 201 未询价
     getApp().requestGet('api/video/queryVideoIfConsultPrice/' + this.data.allVideoArray[this.data.allVideoArrayIndex].videoId,
       null, {},
       function(res) {
         var result = res.data.data;
         if (result === 201 || result === 200) {
           //型号选择弹出框
           if (that.data.allVideoArray != null) {
             that.setData({
               isPriceDialog: true
             });
           } else {
             wx.showToast({
               title: '未选择视频',
               icon: 'none',
               duration: 1000
             })
           }
         }
       });
   },


   loadSizes: function() {
     const that = this;
     //规格
     getApp().requestGet('api/video/queryGoodsSpec',
       null, {},
       function(res) {
         that.setData({
           sizes: res.data.data
         })
       }
     )
   },

   /**
    * 型号改变选择
    */
   sizeradioChange: function(e) {
     var sizeIndex = e.currentTarget.dataset.index;
     var sizes = this.data.sizes;
     if (this.data.sizeIndex !== null) {
       sizes[this.data.sizeIndex].checked = false;
     }
     sizes[sizeIndex].checked = true;
     this.setData({
       sizes: sizes,
       sizeIndex: sizeIndex
     });
   },

   formSubmit: function(e) {
     //生成询价订单
     var videoInfo = this.data.allVideoArray[this.data.allVideoArrayIndex]
     if (this.data.sizeIndex == null) {
       wx.showToast({
         title: '请选择一个规格',
         icon: 'none'
       })
     } else {
       var data = {
         videoId: videoInfo.videoId,
         shopId: videoInfo.shopId,
         size: this.data.sizes[this.data.sizeIndex].name
       }
       getApp().requestFormPost('api/videoOrder/insertVideoOrder', data,
         function(res) {
           wx.redirectTo({
             url: '../../videoOrder/index',
           })
         })
     }

   },
   formReset: function(e) {
     var sizes = this.data.sizes;
     for (var i = 0, lenI = sizes.length; i < lenI; ++i) {
       if (i == 0) {
         sizes[i].checked = true;
       } else {
         sizes[i].checked = false;
       }
     }
     this.setData({
       sizes: sizes,
       sizeIndex: 0,
       isPriceDialog: false
     });
     //关闭弹出框
   },

   /**
    * ---------------------------------------------------------
    */

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function(res) {

   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function() {
     var videoContext = wx.createVideoContext('videoShow');
     videoContext.play();
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
     var videoInfo = this.data.allVideoArray[this.data.allVideoArrayIndex]
     return {
       title: '亲，这件衣服什么样？帮忙给个建议哦！',
       path: '/pages/fittingShow/fittingStoreInfo/index?videoInfo=' + JSON.stringify(videoInfo),
       imageUrl: videoInfo.videoImageUrl
     }
   }

 })