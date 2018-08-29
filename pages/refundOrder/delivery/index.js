// pages/refundOrder/delivery/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logisticsList: [], //快递公司列表
    shopInfo: {},
    orderId: 0,
    orderType: null, //0:我的购物1:试衣订单2:询价订单
    width: 0, //user-name节点宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var header = getApp().globalData.header;
    var that = this;

    //加载商店地址
    getApp().requestGet('api/clientrefund/' + options.orderId + '/showClientRefundAddress', {}, header, function(res) {
      if (res.data.code == 200) {
        var shopInfo = res.data.data
        shopInfo.address = shopInfo.address.replace(/,/g, ' ')
        that.setData({
          shopInfo: shopInfo,
          orderId: options.orderId,
          orderType: options.orderType
        });
      }
    }, that.queryMultipleNodes());

    //加载快递公司
    getApp().requestGet('/api/videoOrder/queryLogistics', {}, {}, function(res) {
      if (res != null) {
        that.setData({
          logisticsList: res.data.data
        });
      }
    })
  },

  queryMultipleNodes: function() {
    const _self = this;
    var query = wx.createSelectorQuery();
    query.select('.user-name').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function(res) {
      _self.setData({
        width: res[0].width
      });
    })
  },

  //快递公司picker监听事件
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },

  // 提交表单
  formSubmit: function(e) {
    var formData = e.detail.value;
    if (formData.expressName == null) {
      wx.showToast({
        title: '请选择快递公司',
        icon: 'none'
      })
      return
    }
    if (formData.expressNumber == '') {
      wx.showToast({
        title: '请输入快递单号',
        icon: 'none'
      })
      return
    }
    const that = this;
    formData.expressId = that.data.logisticsList[formData.expressName].id

    //获取
    wx.showModal({
      title: '提示',
      content: '您确定您的商品已寄出？快递公司为：' + that.data.logisticsList[formData.expressName].name + '，单号为：' + formData.expressNumber + '吗？',
      success: function(res) {
        if (res.confirm) {
          getApp().requestFormPost('api/clientrefund/' + that.data.orderId + '/delivery', formData,
            function(res) {
              if (res.data.code == 200) {
                var index = that.data.orderType;
                if (that.data.orderType === "2") {
                  index = 1;
                }
                wx.redirectTo({
                  url: '../index?index=' + index,
                })
                wx.showToast({
                  title: '商品已寄出',
                  icon: 'none',
                  duration: 1000
                })
              }
            });
        }
      }
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