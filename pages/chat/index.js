// pages/chat/index.js
var JMCommon = require('../../utils/JMCommon.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null, // 接收者ID
    messageList: [],
    message: '',
    scrollTop: 0,
    imageUrl: '',
    avatar: '',
    title: '', // 页面标题,对方名称
    receiptReport: false, //当前页面是否在显示
    disabled: false, //发送按钮是否禁用
    appkey: 'c892533d92adfba4dbd135d4',
    withUser: false, // false和用户，true和商家
  },

  formSubmit: function (e) {
    const userId = this.data.userId;
    var appkey = this.data.appkey;
    this.setData({
      disabled: true
    })
    var that = this
    if (e.detail.value.message.trim() === '') {
      that.setData({
        message: '',
        disabled: false
      })
      return false
    }
    if (!JMCommon.JIM.isInit()) {
      JMCommon.JMinit(userId,
        function () {
          that.sendSingleMsg({
            'target_username': userId,
            'content': e.detail.value.message,
            'appkey': appkey,
          })
        });
    } else if (!JMCommon.JIM.isLogin()) {
      JMCommon.JMLogin(userId,
        function () {
          that.sendSingleMsg({
            'target_username': userId,
            'content': e.detail.value.message,
            'appkey': appkey,
          })
        });
    } else {
      that.sendSingleMsg({
        'target_username': userId,
        'content': e.detail.value.message,
        'appkey': appkey,
      });
    }

  },
  //发送消息
  sendSingleMsg: function (message) {
    var that = this;
    const userId = this.data.userId
    var myId = app.globalData.userId
    JMCommon.JIM.sendSingleMsg(message).onSuccess(function (data, msg) {
      console.log("Jmessage成功发送消息");
      var messageList = wx.getStorageSync(userId);
      if (messageList === '') {
        messageList = [];
      }
      messageList.push({
        content: msg.content,
        ctime_ms: JMCommon.toDate(msg.content.create_time)
      })
      wx.setStorageSync(userId, messageList)
      that.setData({
        message: '',
        disabled: false
      })
      that.refresh(messageList)
      //如果当前会话没有在会话列表中，则添加至会话列表
      that.isNewConversation(userId, msg.content, messageList);
    }).onFail(function (data) {
      that.setData({
        disabled: false
      })
    });
  },
  //发送图片
  sendPictures: function (e) {
    var that = this
    const userId = this.data.userId
    wx.chooseImage({
      count: 5,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths; //获取成功，读取文件路径
        var messageList = wx.getStorageSync(userId);
        if (messageList === '') {
          messageList = [];
        }
        for(let i = 0, length = tempFilePaths.length; i < length; i++){
          JMCommon.JIM.sendSinglePic({
            'target_username': userId,
            'appkey': that.data.appkey,
            'image': tempFilePaths[i] //设置图片参数
          }).onSuccess(function (data, msg) {
            
            JMCommon.JIM.getResource({
              'media_id': msg.content.msg_body.media_id,
            }).onSuccess(function (res) {
              msg.content.msg_body.url = res.url;
              messageList.push({
                content: msg.content,
                ctime_ms: JMCommon.toDate(msg.content.create_time)
              })
              wx.setStorageSync(userId, messageList)
              that.refresh(messageList);
              //如果当前会话没有在会话列表中，则添加至会话列表
              that.isNewConversation(userId, msg.content, messageList);
            }).onFail(function (data) {
              wx.showToast({
                title: '发送图片失败',
                icon: 'none'
              })
              console.log(data);
            });
            that.receiptReport(userId);
          }).onFail(function (data) {

          });
        }
      }
    })
  },

  /**
   * 发送消息是新会话时添加到会话列表,不是更新会话列表时间
   */
  isNewConversation: function (userId, content, messageList) {
    var that = this
    JMCommon.isNewConversation(userId, content,
      function (conversations) {
        conversations.unshift(
          {
            userId: userId,
            mtime: messageList[messageList.length - 1].ctime_ms,
            avatar: that.data.imageUrl,
            name: that.data.title,
            unread_msg_count: 0,
            message: content.msg_type === "text" ? content.msg_body.text : "[图片]"
          }
        );
        wx.setStorageSync('conversations', conversations)
      }
    );
  },

  /**
   * 点击卡片进入订单详情
   */
  toCardInfo: function (e) {
    var info = JSON.stringify(this.data.messageList[e.currentTarget.dataset.index].content.msg_body.extras)
    wx.navigateTo({
      url: '../myOrder/orderInfo/index?orderInfo=' + info
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userId: options.userId,
    })
    if (typeof options.withUser !== 'undefined') {
      this.setData({
        withUser: true
      })
    }
    if (typeof options.orderInfo !== 'undefined') {
      //发送订单id->用于商家端显示订单卡片
      this.sendSingleMsg({
        'target_username': options.userId,
        'content': '1',
        'extras': JSON.parse(options.orderInfo),
        'appkey': this.data.appkey,
      });
    }
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
    this.setData({
      receiptReport: true
    })
    var that = this
    //对方的id
    const userId = this.data.userId
    //自己的id
    var myId = app.globalData.userId
    //获取头像，名称
    app.requestGet('api/shopuser/' + userId + '/messageShowAvatar', {},
      {
        'content-type': 'application/x-www-form-urlencoded',
        Cookie: getApp().globalData.header.Cookie
      },
      function (res) {
        var title = res.data.data.name
        wx.setNavigationBarTitle({
          title: title
        })
        that.setData({
          title: title,
          imageUrl: res.data.data.imageUrl,
          avatar: res.data.data.avatar,
        })
      })
    //如果没有初始化，登录
    if (!JMCommon.JIM.isInit()) {
      JMCommon.JMinit(myId)
    } else if (!JMCommon.JIM.isLogin()) {
      JMCommon.JMLogin(myId);
    }
    //加载聊天数据
    var messageList = wx.getStorageSync(userId)
    for (let i = 0, length = messageList.length; i < length; i++) {
      if (!isNaN(messageList[i].ctime_ms)) {
        messageList[i].ctime_ms = JMCommon.toDate(messageList[i].ctime_ms);
      }
      if (messageList[i].content.msg_type === "image" && (typeof messageList[i].content.msg_body.url === 'undefined')) {
        JMCommon.JIM.getResource({
          "media_id": messageList[i].content.msg_body.media_id,
        }).onSuccess(function (res) {
          messageList[i].content.msg_body.url = res.url;
          that.setData({
            messageList: messageList
          })
          wx.setStorageSync(userId, messageList)
        }).onFail(function (data) {
          console.log("获取聊天图片失败");
          console.log(data);
        });
      }
    }
    wx.setStorageSync(userId, messageList)
    this.refresh(messageList);
    //监听消息
    JMCommon.JIM.onMsgReceive(function (data) {
      console.log("页面监听消息")
      var messageList;
      for (let i = 0, messages = data.messages; i < messages.length; i++) {
        var fromId = messages[i].from_username;
        messageList = wx.getStorageSync(fromId);
        if (messageList == '') {
          messageList = [];
        }
        if (messages[i].content.msg_type === "image") {
          JMCommon.JIM.getResource({
            "media_id": messages[i].content.msg_body.media_id,
          }).onSuccess(function (res) {
            messages[i].content.msg_body.url = res.url;
            messageList.push(messages[i]);
            wx.setStorageSync(fromId, messageList);
            that.refresh(messageList);
          }).onFail(function (data) {
            console.log("获取聊天图片失败");
            console.log(data);
          });
        } else {
          messages[i].ctime_ms = JMCommon.toDate(messages[i].ctime_ms);
          messageList.push(messages[i]);
          wx.setStorageSync(fromId, messageList);
          that.refresh(messageList);
        }
        that.receiptReport(fromId);
        /**
         * 如果消息是来自新的会话，就添加到会话列表
         */
        JMCommon.isNewConversation(fromId, messages[i].content,
          function (conversations) {
            getApp().requestFormGet('api/shopuser/' + fromId + '/messageShowAvatar', {},
              function (res) {
                conversations.unshift(
                  {
                    userId: fromId,
                    mtime: messages[i].content.create_time,
                    avatar: res.data.data.imageUrl,
                    name: res.data.data.name,
                    unread_msg_count: that.data.receiptReport ? 0 : 1,
                    message: messages[i].content.msg_type === "text" ? messages[i].content.msg_body.text : "[图片]"
                  }
                );
                wx.setStorageSync('conversations', conversations)
              }
            );
          }
        )
      }
    });
    this.receiptReport(userId);
  },

  //重置会话未读数
  receiptReport: function (fromId) {
    if (this.data.receiptReport && fromId == this.data.userId) {
      JMCommon.JIM.resetUnreadCount({
        'username': fromId
      });
      JMCommon.JIM.current_conversation = "";
      JMCommon.haveRead();
    } else {
      //未读消息提醒
      JMCommon.unread();
    }
  },

  /**
   * 刷新界面
   */
  refresh: function (messageList) {
    var that = this
    var length = this.data.messageList.length
    this.setData({
      messageList: messageList === "" ? [] : messageList,
    },function(){
      if (messageList.length > length) {
        wx.createSelectorQuery().select('#message-bottom').boundingClientRect(function (res) {
          that.setData({
            scrollTop: res.height
          })
        }).exec();
      }
    })
    
  },

  /**
   * 图片预览
   */
  previewImage: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.url],
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.receiptReport(this.data.userId)
    this.setData({
      receiptReport: false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({
      receiptReport: false
    })
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

  },
})