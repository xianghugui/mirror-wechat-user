// pages/figureInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    applicationcheckboxItems: [],
    interestingcheckboxItems: [],
    sexArray: [{
      name: '男'
    }, {
      name: '女'
    }],
    genderIndex: null,
    ageArray: [],
    ageIndex: null,
    deviceId: null,
    height: "",
    weight: "",
    // banner
    imgUrls: [],
    indicatorDots: true, //是否显示面板指示点
    indicatorColor: '#A7A39F',
    indicatorActiveColor: '#3EC0C4',
    autoplay: true, //是否自动切换
    interval: 3000, //自动切换时间间隔,3s
    duration: 1000, //  滑动动画时长1s
  },
  bindPickerChange: function(e) {
    if (e.currentTarget.dataset.type == 'gender') {
      this.setData({
        genderIndex: e.detail.value
      });
    } else {
      this.setData({
        ageIndex: e.detail.value
      });
    }
  },
  applicationChange: function(e) {
    var items = this.data.applicationcheckboxItems,
      values = e.detail.value;
    for (var i = 0, lenI = items.length; i < lenI; ++i) {
      items[i].checked = false;
      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (items[i].applicationId == values[j]) {
          items[i].checked = true;
          break
        }
      }
    }
    this.setData({
      applicationcheckboxItems: items
    });
  },
  interestingChange: function(e) {
    var items = this.data.interestingcheckboxItems,
      values = e.detail.value;
    for (var i = 0, lenI = items.length; i < lenI; ++i) {
      items[i].checked = false;
      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (items[i].goodsClassId == values[j]) {
          items[i].checked = true;
          break
        }
      }
    }
    this.setData({
      interestingcheckboxItems: items
    });
  },

  //标签选择
  radioChange: function(e) {
    var _self = this;
    var data = this.data.ageArray;
    var value = e.detail.value;
    for (var i = 0, lenI = data.length; i < lenI; ++i) {
      if (data[i].propertyId == value) {
        data[i].checked = true;
      } else {
        data[i].checked = false;
      }
    }
    this.setData({
      ageArray: data
    });
  },

  //标签选择
  sexChange: function(e) {
    var _self = this;
    var data = this.data.sexArray;
    var value = e.detail.value;
    for (var i = 0, lenI = data.length; i < lenI; ++i) {
      if (data[i].name == value) {
        data[i].checked = true;
      } else {
        data[i].checked = false;
      }
    }
    this.setData({
      sexArray: data
    });
  },

  shopLogin: (res) => {
    //跳转到商家登录页面
  },

  formSubmit: function(e) {
    var data = e.detail.value;
    data.like = ""
    data.application = ""
    for (let i = 0, length = data.likes.length - 1; i < length; i++) {
      data.like += data.likes[i] + ",";
    }
    data.like += data.likes[data.likes.length - 1];
    for (let i = 0, length = data.applications.length - 1; i < length; i++) {
      data.application += data.applications[i] + ",";
    }
    data.application += data.applications[data.applications.length - 1];
    if (data.sex == "") {
      wx.showToast({
        icon: "none",
        title: '请选择性别',
      })
      return
    }
    if (data.age == "") {
      wx.showToast({
        icon: "none",
        title: '请选择年龄段',
      })
      return
    }
    getApp().requestFormPost('api/user/' + this.data.deviceId + '/updateShopGoodsPushInfo', data, function(res) {
      wx.showToast({
        title: res.data.data,
        icon: 'success',
        duration: 1000
      })
      wx.switchTab({
        url: '../fittingShow/index'
      })
    });
  },

  //获取身材信息
  getInfo: function(deviceUserName) {
    const that = this
    getApp().requestGet('api/user/queryShopGoodsPushInfo?deviceUserName=' + deviceUserName, {}, getApp().globalData.header,
      function(res) {
        var data = res.data.data;
        that.setData({
          ageArray: data.age,
          applicationcheckboxItems: data.application,
          interestingcheckboxItems: data.classList,
          deviceId: data.deviceId,
          imgUrls: data.shopImage
        })
        if (data.info != null) {
          that.setData({
            weight: data.info.weight,
            height: data.info.height
          })
          var likeArray = data.info.like.split(",");
          for (let i = 0; i < data.classList.length; i++) {
            for (let j = 0; j < likeArray.length; j++) {
              if (data.classList[i].goodsClassId == likeArray[j]) {
                data.classList[i].checked = true;
              }
            }
          }
          var applicationArray = data.info.application.split(",");
          for (let i = 0; i < data.application.length; i++) {
            for (let j = 0; j < applicationArray.length; j++) {
              if (data.application[i].applicationId == applicationArray[j]) {
                data.application[i].checked = true;
              }
            }
          }
          var ageArray = data.info.age
          for (let i = 0; i < data.age.length; i++) {
            if (data.age[i].propertyId == ageArray) {
              data.age[i].checked = true;
            }
          }
          var sex = data.info.sex
          for (let i = 0; i < that.data.sexArray.length; i++) {
            if (that.data.sexArray[i].name == sex) {
              that.data.sexArray[i].checked = true;
            }
          }

          that.setData({
            interestingcheckboxItems: data.classList,
            applicationcheckboxItems: data.application,
            sexArray: that.data.sexArray,
            ageArray: data.age
          })
        }
      }
    );
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //查找最后一个"/"
    // var index = options.q.lastIndexOf("%2F") + 3;
    // var deviceName = options.q.substr(index);
    var that = this;
    getApp().registered({},
      function(res) {
        that.getInfo('wangwei')
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