// pages/faceRetrieval/index.js
var app = getApp();
var utils = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isPreview: false,//出现预览图片
    upmaskHeight: 0,
    curTop: 0,
    scanningtime: '',
    src: '',
    animationData: {},
    userInfo: {},
  },
  takePhoto: function (e) {
    var _self = this;
    _self.cameraContext.takePhoto({
      quality: 'high',
      success: (res) => {
        var tempImagePath = res.tempImagePath;
        // 显示图片及扫描检索动画
        _self.setData({
          isPreview: true, src: tempImagePath
        }, function () {
          //创建节点选择器
          // 获取用户高度
          let query = wx.createSelectorQuery();
          query.select('#upmask').boundingClientRect()
          query.exec(function (res) {
            let i = 0;
            let upmaskHeight = res[0].height;
            _self.setData({
              scanningtime: setInterval(function () {
                i += 2;
                if (i == 276) i = 0;
                _self.setData({
                  curTop: upmaskHeight + i
                })
              }, 10)
            })

          })
        });
        // 上传识别
        wx.uploadFile({
          url: getApp().BASE_URL + 'api/video/face/faceMatch',
          filePath: tempImagePath,
          header: getApp().globalData.header,
          name: 'file',
          complete: function (res) {
            var data = JSON.parse(res.data)
            if (data.success) {
              if(data.data == null){
                _self.showToast('没有检测到人脸');
              }else if(data.data.length ===0){
                _self.showToast('没有试衣信息');
              }else{
                wx.redirectTo({
                  url: '../selectVideo/index?list=' + JSON.stringify(data.data),
                })
              }
            } else {
              _self.showToast('没有检测到人脸');
            }
          }
        })
      },
      error: (res) => {
        console.log(res);
      }
    })
  },

  /**
   * 没有检测到人脸或者没有数据
   */
  showToast: function(msg){
    wx.navigateBack({
      delta: 1
    })
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 3000
    })
  },

  /**
 * 用户拒绝了相机授权
 */
  error: function (e) {
    wx.showModal({
      title: '您没有授权摄像头的权限',
      content: '请点击右上角菜单-关于衣魅欧-右上角菜单-设置中打开摄像头权限',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.camera']) {
          wx.authorize({
            scope: 'scope.camera',
            success: function (res) {
              console.log(res)
            },
            fail: function(res) {
              console.log(res)
            }
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var _self = this;
    if (wx.createCameraContext()) {
      this.cameraContext = wx.createCameraContext('myCamera')
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示  
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
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
    clearInterval(this.data.scanningtime);
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