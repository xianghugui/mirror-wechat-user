// pages/me/setting/figureInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uId: null,
    height: null,
    weight: null,
    chest: null,
    waist: null,
    hip: null,
    positiveImage: null,
    NegativeImage: null,
    positiveImageId: null,
    NegativeImageId: null,
    isEdit: true, //标识是否是编辑
  },
  addImage: function (e) {
    var that =this
    wx.chooseImage({
      count: 1,
      sizeType: ['original'], 
      sourceType: ['camera'], 
      success: function (res) {
        if (e.currentTarget.dataset.index == 0){
          that.setData({
            positiveImage: res.tempFilePaths[0]
          })
        }else{
          that.setData({
            NegativeImage: res.tempFilePaths[0]
          })
        }
        wx.uploadFile({
          url: getApp().BASE_URL + 'file/upload',
          filePath: res.tempFilePaths[0],
          name: 'file',
          success: function(res){
            var data = JSON.parse(res.data)
            if(data.success){
              if (e.currentTarget.dataset.index == 0) {
                that.setData({
                  positiveImageId: data.data[0].id
                })
              } else {
                that.setData({
                  NegativeImageId: data.data[0].id
                })
              }
            }else{
              that.showToast('上传失败')
            }
          }
        })
      }
    })
  },
  previewImage: function (e) {
    var that = this
    var current = that.data.positiveImage
    if (e.currentTarget.dataset.index == 1) {
      current = this.data.NegativeImage
    }
    wx.previewImage({
      current: current,
      urls: [that.data.positiveImage, that.data.NegativeImage]
    })
  },
  deleteImage: function (e) {
    if (e.currentTarget.dataset.index == 0) {
      this.setData({
        positiveImage: null
      })
    }else{
      this.setData({
        NegativeImage: null
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(!options.isEdit){
      var that = this
      getApp().requestGet('api/user/queryUserFeature', null,
        getApp().globalData.header,
        function (res) {
          var data = res.data.data
          that.setData({
            uId: data.uId,
            height: data.height,
            weight: data.weight,
            waist: data.waist,
            chest: data.chest,
            hip: data.hip,
            positiveImage: data.cardImagePath[0].resourceUrl,
            NegativeImage: data.cardImagePath[1].resourceUrl,
            positiveImageId: data.cardImagePath[0].resourceId,
            NegativeImageId: data.cardImagePath[1].resourceId
          })
          if (data.cardImagePath != null) {
            that.setData({
              cardImagePath: data.cardImagePath
            })
          }
        });
    }else{
      this.setData({
        isEdit: true
      })
    }
  },
  formSubmit: function (e) {
    var regNum = new RegExp('[0-9]', 'g');
    var data = e.detail.value
    var that = this
    if(data.height == ''){
      this.showToast('请输入身高')
      return
    }
    if (data.weight == '') {
      this.showToast('请输入体重')
      return
    }
    if (data.chest == '') {
      this.showToast('请输入胸围')
      return
    }
    if (data.waist == '') {
      this.showToast('请输入腰围')
      return
    }
    if (data.hip == '') {
      this.showToast('请输入臀围')
      return
    }
    if (this.data.positiveImage == null || this.data.NegativeImage == null) {
      this.showToast('请上传身份信息')
      return
    }
    var url = 'api/user/insertUserFeature'
    if(this.data.uId != null){
      url = 'api/user/updateUserFeature'
      data.id = this.data.uId
    }
    data.imageId = [this.data.positiveImageId, this.data.NegativeImageId]
    getApp().requestFormPost(url, data,
    function(res){
      if(that.data.isEdit){
        wx.navigateBack({
          delta: 1
        })
      }
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1000
      })
    });
  },
  showToast: function(message){
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 1000
    })
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
  
  }
})