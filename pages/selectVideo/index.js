// pages/selectVideo/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    items: []
  },
  checkboxChange: function (e) {
    var items = this.data.items, values = e.detail.value;
    for (var i = 0, lenI = items.length; i < lenI; ++i) {
      items[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (items[i].videoId + "" == values[j]) {
          items[i].checked = true;
          break
        }
      }
    }
    this.setData({
      items: items
    });
  },
  selectallchange: function (e) {
    var items = this.data.items, value = e.detail.value;
    for (var i = 0, lenI = items.length; i < lenI; ++i) {
      if (value == "all") {
        items[i].checked = true;
      } else {
        items[i].checked = false;
      }
    }
    this.setData({
      items: items
    });
  },
  formSubmit: function (e) {
    wx: wx.request({
      url: getApp().BASE_URL + 'api/video/selected',
      data: e.detail.value.checkbox,
      method: 'POST',
      header: getApp().globalData.header,
      success: function (res) {
        wx.redirectTo({
          url: '../dressingroom/index'
        });
      }
    })
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (typeof options.list == 'undefined' || options.list == '[]') {
      return;
    }
    var data = options.list
    data = JSON.parse(data)
    for (let i = 0,len = data.length; i < len; i++) {
      data[i].videoImg = decodeURIComponent(data[i].videoImg);
    }
    that.setData({
      items: data
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

  }
})