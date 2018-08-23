// pages/goodsComment/index.js
var count = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stars: [0, 1, 2, 3, 4],
    normalSrc: 'fa-star-o',
    selectedSrc: 'fa-star',
    key: 5, //评分
    imagesArray: [],
    delImageId: [],
    imagesId: [],
    order: {}
  },

  //星星数量改变
  selectStar: function(e) {
    var key = e.currentTarget.dataset.key + 1
    count = key
    this.setData({
      key: key
    })
  },

  // 上传图片
  chooseImg: function(e) {
    var that = this;
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
                var imagesArray = that.data.imagesArray;
                imagesArray.push(tempFilePaths[i]);
                var imagesId = that.data.imagesId;
                imagesId.push(data.data[0].id);
                that.setData({
                  imagesId: imagesId,
                  imagesArray: imagesArray
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

  //提交表单
  formSubmit: function(e) {
    const that = this.data;
    if (e.detail.value.content == null) {
      wx.showToast({
        title: '评论内容不能为空',
      })
      return;
    }
    var data = {
      orderId: that.order.orderId,
      goodsId: that.order.goodsId,
      specId: that.order.goodsSpecId,
      files: that.imagesId,
      content: e.detail.value.content,
      star: that.key,
      orderType: that.order.orderType
    }
    getApp().requestPost('api/clientorder/ClientComment', data, getApp().globalData.header, function(res) {
      if (res.data.code == 200) {
        wx.redirectTo({
          url: '../myOrder/index'
        })
        wx.showToast({
          title: '评价成功',
          icon: 'none',
          duration: 1000
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      order: JSON.parse(options.order)
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

  }
})