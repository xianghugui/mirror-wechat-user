// pages/Refund/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs: [],
    imagesArray: [],
    delImageId: [],
    imagesId: [],
    orderId: null,
    url: ['api/clientorder', 'api/clienttryorder', 'api/clientvideoorder'],
    orderType: null, //订单类型  0平台购买，1 试衣购买，2 视频购买
    status: null, //订单状态
    disabled: false, //按钮是否禁用
  },

  //退款原因raido
  reasonChange: function(e) {

  },
  //类型原因raido
  typeChange: function(e) {

  },
  //添加图片
  chooseImg: function(e) {
    var that = this;
    var imgs = this.data.imagesArray;
    if (imgs.length >= 9) {
      this.setData({
        lenMore: 1
      });
      setTimeout(function() {
        that.setData({
          lenMore: 0
        });
      }, 2500);
      return false;
    }
    wx.chooseImage({
      count: 5, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        for (let i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: getApp().BASE_URL + 'file/upload',
            filePath: tempFilePaths[i],
            name: 'file',
            success: function(res) {
              var data = JSON.parse(res.data);
              if (data.success) {
                var imagesId = that.data.imagesId;
                var imgs = that.data.imagesArray;
                imgs.push(tempFilePaths[i]);
                imagesId.push(data.data[0].id);
                that.setData({
                  imagesId: imagesId,
                  imagesArray: imgs
                })
              } else {
                wx.showToast({
                  title: '图片上传失败',
                  icon: 'none',
                  duration: 1000
                })
              }
            }
          })
        }
      }
    });
  },
  // 删除图片
  deleteImg: function(e) {
    var imgs = this.data.imagesArray;
    var index = e.currentTarget.dataset.index;
    var delImageId = this.data.delImageId;
    delImageId.push(imgs[index].resourceId);
    imgs.splice(index, 1);
    this.setData({
      imagesArray: imgs,
      delImageId: delImageId
    })
  },

  // 预览图片
  previewImg: function(e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var imgs = this.data.imagesArray;
    for (let i = 0; i < imgs.length; i++) {
      imgs[i] = imgs[i].resourceUrl == null ? imgs[i] : imgs[i].resourceUrl;
    }
    wx.previewImage({
      current: imgs[index],
      urls: imgs
    })
  },
  formSubmit: function(e) {
    var that = this
    var data = e.detail.value
    if(data.reason == ''){
      wx.showToast({
        title: '请选择退款原因',
        icon: 'none'
      })
      return
    }
    this.setData({ disabled: true });
    data.imageIdArray = this.data.imagesId
    data.content = '(' + data.reason + ')' + data.content
    data.childOrderId = parseInt(this.data.orderId)
    data.type = this.data.orderType
    delete data.reason
    getApp().requestFormPost(this.data.url[this.data.orderType] + '/ClientRefund', data,
      function(res) {
          //跳转到退款页面
          wx.redirectTo({
            url: '../refundOrder/index' + (that.data.orderType == 2 ? '?index=1' : ''),
          })
      },
      function(res){
        wx.navigateBack({
          delta: 1
        })
        wx.showToast({
          title: res.data.data,
          icon: 'none'
        })
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      orderId: options.orderId,
      orderType: options.orderType,
      status: options.status
    })
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

  }
})