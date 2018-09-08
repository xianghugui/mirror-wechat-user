var JMessage = require("jmessage-wxapplet-sdk-1.4.0.min.js");
var MD5Util = require("md5.js");
var JIM = new JMessage({
  // debug: true
});
/**
 * 参数
 */
var JMCommon = {
  "appkey": "c892533d92adfba4dbd135d4",
  "random_str": Math.random().toString(36).substr(2),
  "flag": 1, //启用消息漫游
};
/**
 * 初始化
 */
var JMinit = function (userId) {
  JMCommon.timestamp = new Date().getTime();
  JMCommon.signature = MD5Util.MD5("appkey=" + JMCommon.appkey + "&timestamp=" + JMCommon.timestamp
    + "&random_str=" + JMCommon.random_str + "&key=612d163dba2893573eb92bc6").toUpperCase();
  JIM.init(JMCommon).onSuccess(function (data) {
    if (wx.getStorageSync('userId') === "") {
      //注册
      JIM.register({
        "username": userId,
        "password": userId,
      }).onSuccess(function (data) {
        wx.setStorage({
          key: "userId",
          data: userId.toString()
        })
        JMLogin(userId);
      }).onFail(function (data) {
        JMLogin(userId);
      });
    } else {
      JMLogin(userId);
    }
  });
};

var JMLogin = function (userId) {
  if (!JIM.isLogin()) {
    JIM.login({
      "username": userId,
      "password": userId
    }).onSuccess(function () {
      console.log("JMessage登录成功");
      JIM.onSyncConversation(function (data) {
        var unread_msg_count = 0;
        var firstLoad = false; //是否是第一次加载
        //会话列表
        var conversations = wx.getStorageSync("conversations");
        if (conversations === '') {
          conversations = []
          firstLoad = true;
        }
        for (let i = 0, dataLength = data.length; i < dataLength; i++) {
          //聊天记录
          wx.setStorageSync(data[i].from_username, data[i].msgs);
          //最后一条消息
          let message = data[i].msgs[data[i].msgs.length - 1];
          //添加头像，名称，聊天时间，最后消息。。。到会话列表
          if (firstLoad) {
            getApp().requestFormGet('api/shopuser/' + data[i].from_username + '/messageShowAvatar', {},
              function (res) {
                conversations.push({
                  userId: data[i].from_username,
                  mtime: message.ctime_ms,
                  avatar: res.data.data.imageUrl,
                  name: res.data.data.name,
                  unread_msg_count: data[i].unread_msg_count,
                  message: message.content.msg_type === "text" ? message.content.msg_body.text : "[图片]"
                });
                if (i == dataLength - 1) {
                  conversations.sort(function (a, b) {
                    return parseInt(b.mtime) - parseInt(a.mtime);
                  })
                  wx.setStorageSync('conversations', conversations);
                }
              },
              function () { }
            );
          } else if (data[i].unread_msg_count > 0) {
            //当最后一条消息是自己发送的，重置未读数
            if (message.content.from_name == userId) {
              JIM.resetUnreadCount({
                'username': data[i].from_username
              });
              JIM.current_conversation = "";
            } else {
              //是新消息添加至会话列表、或更新最后会话时间
              unread_msg_count += data[i].unread_msg_count;
              isNewConversation(message.content.from_name, message.content,
                function (conversations) {
                  getApp().requestFormGet('api/shopuser/' + data[i].from_username + '/messageShowAvatar', {},
                    function (res) {
                      conversations.unshift({
                        userId: message.content.from_name,
                        mtime: message.ctime_ms,
                        avatar: res.data.data.imageUrl,
                        name: res.data.data.name,
                        unread_msg_count: data[i].unread_msg_count,
                        message: message.content.msg_type === "text" ? message.content.msg_body.text : "[图片]"
                      });
                      if (i == dataLength - 1) {
                        conversations.sort(function (a, b) {
                          return parseInt(b.mtime) - parseInt(a.mtime);
                        })
                        wx.setStorageSync('conversations', conversations);
                      }
                    }
                  );
                }
              )
            }
          }
        }
        if (unread_msg_count > 0) {
          unread();
        }
      });
      JIM.onMsgReceive(function (data) {
        console.log("JMessage全局监听消息")
        var messageList;
        for (let i = 0, messages = data.messages; i < messages.length; i++) {
          messageList = wx.getStorageSync(messages[i].from_username);
          let content = messages[i].content
          if (messageList === '') {
            messageList = [];
          }
          if (content.msg_type === "image") {
            JIM.getResource({
              "media_id": content.msg_body.media_id,
            }).onSuccess(function (res) {
              messages[i].content.msg_body.url = res.url;
              messageList.push(messages[i]);
              wx.setStorageSync(messages[i].from_username, messageList);
            }).onFail(function (data) {
              console.log("JMessage获取聊天图片失败");
              console.log(data);
            });
          } else {
            messages[i].ctime_ms = toDate(messages[i].ctime_ms);
            messageList.push(messages[i]);
            wx.setStorageSync(messages[i].from_username, messageList);
          }
          /**
           * 如果消息是来自新的会话，就添加到会话列表
           */
          isNewConversation(messages[i].from_username, content,
            function (conversations) {
              getApp().requestFormGet('api/shopuser/' + messages[i].from_username + '/messageShowAvatar', {},
                function (res) {
                  conversations.unshift({
                    userId: messages[i].from_username,
                    mtime: content.create_time,
                    avatar: res.data.data.imageUrl,
                    name: res.data.data.name,
                    unread_msg_count: 0,
                    message: content.msg_type === "text" ? content.msg_body.text : "[图片]"
                  });
                  wx.setStorageSync('conversations', conversations)
                }
              );
            }
          )
        }
        //未读消息提醒
        unread();
      });
      //获取会话列表并添加对方头像、名称以及判断有无未读消息
      JIM.getConversation().onSuccess(function (res) {
        var data = res.conversations;
        var conversations = [];
        var userId = []
        for (let i = 0, length = data.length; i < length; i++) {
          //获取头像、名称
          if (wx.getStorageSync("conversations") === "") {
            getApp().requestFormGet('api/shopuser/' + data[i].username + '/messageShowAvatar', {},
              function (res) {
                conversations.push({
                  userId: data[i].username,
                  mtime: data[i].mtime,
                  avatar: res.data.data.imageUrl,
                  name: res.data.data.name,
                  unread_msg_count: data[i].unread_msg_count
                });
                if (i == length - 1) {
                  wx.setStorageSync('conversations', conversations);
                }
              }
            );
          }
        }
      }).onFail(function (data) {
        //data.code 返回码
        //data.message 描述
      });
    }).onFail(function (data) {
    });
  } else {
    console.log("Jmessage已登录")
  }
};

/**
 * 判断是不是新的会话，是做操作 /不是更新时间
 */
var isNewConversation = function (userId, content, isCallback) {
  var conversations = wx.getStorageSync("conversations");
  if (conversations == '') {
    conversations = [];
  }
  for (let i = 0, length = conversations.length; i < length; i++) {
    if (conversations[i].userId == userId) {
      var data = conversations[i];
      data.mtime = content.create_time;
      data.message = content.msg_type === "text" ? content.msg_body.text : "[图片]";
      conversations.splice(i, 1);
      conversations.unshift(data);
      wx.setStorageSync('conversations', conversations);
      return;
    }
  }
  isCallback && isCallback(conversations)
}

//有未读消息则提醒
var unread = function () {
  getApp().globalData.hasUnread = true
  wx.showTabBarRedDot({
    index: 3,
  })
}

//消息已读则取消提醒
var haveRead = function () {
  getApp().globalData.hasUnread = false
  wx.hideTabBarRedDot({
    index: 3,
  })
}

//毫秒转换为字符串
var toDate = function (timestamp) {
  let str = '';
  let data = new Date(timestamp);
  let now = new Date();
  if (data.getFullYear() !== now.getFullYear()) {
    str += data.getFullYear() + "-";
  }
  if (!(data.getMonth() === now.getMonth() && data.getDate() === now.getDate())) {
    let month = data.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    str += month + "-" + (data.getDate() < 10 ? "0" + data.getDate() : data.getDate()) + " ";
  }
  str += (data.getHours() < 10 ? "0" + data.getHours() : data.getHours()) + ":" + (data.getMinutes() < 10 ? "0" + data.getMinutes() : data.getMinutes());
  return str;
}

module.exports.JMinit = JMinit;
module.exports.JMLogin = JMLogin;
module.exports.JIM = JIM;
module.exports.toDate = toDate;
module.exports.unread = unread;
module.exports.haveRead = haveRead;
module.exports.isNewConversation = isNewConversation;