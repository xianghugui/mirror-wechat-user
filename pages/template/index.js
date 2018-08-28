var MD5Util = require('../../utils/md5.js');

//------------------支付弹出框----------------------------

var showPembayaranModal = function(that) {

  getApp().requestFormGet('api/user/userEarn', {}, function(res) {
    if (res.data.data != null) {
      that.setData({
        userEarn: res.data.data
      });
    }
  });

  // 显示遮罩层
  var animation = wx.createAnimation({
    duration: 200,
    timingFunction: "linear",
    delay: 0
  })
  that.animation = animation
  animation.translateY(300).step()
  that.setData({
    animationData: animation.export(),
    showModalStatus: true
  })
  setTimeout(function() {
    animation.translateY(0).step()
    that.setData({
      animationData: animation.export()
    })
  }.bind(that), 200)
}
var hidePembayaranModal = function(that) {
  // 隐藏遮罩层
  var animation = wx.createAnimation({
    duration: 200,
    timingFunction: "linear",
    delay: 0
  })
  that.animation = animation
  animation.translateY(300).step()
  that.setData({
    animationData: animation.export(),
  })
  setTimeout(function() {
    animation.translateY(0).step()
    that.setData({
      animationData: animation.export(),
      showModalStatus: false,
      disabled: false
    })
  }.bind(that), 200)
}

module.exports.showPembayaranModal = showPembayaranModal;
module.exports.hidePembayaranModal = hidePembayaranModal;


// -----------订单页面全部点击事件----------------
var orderUrl = ['api/clienttryorder/', 'api/clientorder/', 'api/clientvideoorder/']
/**
 * 跳转商品评论
 * orderList:选中的对象
 * url:链接
 */
var goodsComment = (orderList, url) => {
  var data = orderList
  wx.navigateTo({
    url: url + 'index?order=' + JSON.stringify(orderList)
  })
}

/**
 * 确定收货
 * orderId：订单ID
 * that：作用域
 */
var receipt = function(orderId, that, urlType, successFunction) {
  wx.showModal({
    title: '提示',
    content: '您确定已收到货么',
    success: function(res) {
      if (res.confirm) {
        getApp().requestPut(orderUrl[urlType] + orderId + '/ClientConfirmReceipt', {}, getApp().globalData.header,
          function(res) {
            successFunction();
          });
      }
    }
  })
}

/**
 * 取消订单
 * orderId：订单ID
 * that：作用域
 * url：链接
 * cancelFunction : 取消后要执行的函数
 */
var cancel = function(orderId, that, urlType, cancelFunction) {
  wx.showModal({
    title: '提示',
    content: '确定要取消订单么',
    success: function(res) {
      if (res.confirm) {
        getApp().requestPut(orderUrl[urlType] + orderId + '/ClientCancelOrder', {}, getApp().globalData.header,
          function(res) {
            cancelFunction();
          });
      }
    }
  })
}

/**
 * 商品退货
 * orderId：订单ID
 * orderType：退货类型（0：试穿，１：购买，２：询价）
 * url：退货路径
 */
var gotoRefund = function(orderId, orderType, status, url) {
  wx.navigateTo({
    url: url + 'index?orderId=' + orderId + '&orderType=' + orderType + '&status=' + status
  })
}

/**
 * 页面跳转
 * orderId：跳转转递订单ID
 * url：跳转页面
 */
var jumpOrderInfo = function(orderId, url) {
  wx.navigateTo({
    url: url + '/index?orderId=' + orderId,
  })
}

//提醒发货
var shipment = function(phone, name, date, orderId, success, fail) {
  message(153197, phone, name, date, orderId, success, fail)
}

//退款提醒收货
var refundReceipt = function(phone, name, date, orderId, success, fail) {
  message(153240, phone, name, date, orderId, success, fail)
}

var message = function(temp_id, phone, name, date, orderId, success, fail) {
  var data = {
    mobile: phone,
    temp_id: temp_id,
    temp_para: {
      name: name,
      date: date,
      orderId: orderId
    }
  };
  wx.request({
    url: 'https://api.sms.jpush.cn/v1/messages',
    method: 'POST',
    data: data,
    header: {
      'Authorization': 'Basic ' + MD5Util.base64("c892533d92adfba4dbd135d4:612d163dba2893573eb92bc6")
    },
    success: function(res) {
      success && success(res)
    },
    fail: function(res) {
      fail && fail(res)
    }
  });
}

/**
 * 跳转退货地址信息
 * orderId:　订单ID
 * orderType:　订单类型
 */

var jumpRefundAddress = function(orderId, orderType, url) {
  wx.navigateTo({
    url: url + 'index?orderId=' + orderId + '&orderType=' + orderType
  })
}

/**
 * 取消退货
 * refundId：退货订单ID
 */
var cancelRefund = function(refundId) {
  getApp().requestPost('api/refundexchange/' + refundId + '/cancelRefunds', {}, getApp().globalData.header, function(res) {
    if (res.data.code == 200) {
      wx.showToast({
        title: '取消成功',
      })
    }
  });
}
/**
 * 倒计时
 * end: 结束时间 Date对象
 */
var countdown = function(end) {
  //时间差
  var timestamp = (end.getTime() - new Date().getTime()) / 1000
  var day = Math.floor(timestamp / (24 * 3600));
  //计算出小时数
  var leave1 = timestamp % (24 * 3600); //计算天数后剩余的毫秒数
  var hours = Math.floor(leave1 / 3600);
  //计算相差分钟数
  var leave2 = leave1 % 3600; //计算小时数后剩余的毫秒数
  var minutes = Math.floor(leave2 / 60);
  var str = (day < 1 ? "" : day + "天") + (hours < 1 ? "" : hours + "小时") +
    minutes + "分钟"
  return str
}

//微信小程序支付调用公共接口
//url 后端相应的支付接口
//data往后端传的处理数据
//redirectToURL 支付成功跳转URL
//hidePembayaranModal 支付成功调用处理函数
var wxPay = function(url, data, redirectToURL, hidePembayaranModal, updateStatusApi) {
  // 变量
  var timestamp = String(Date.parse(new Date())) //时间戳
  var nonceStr = '' //随机字符串，后台返回
  var prepayId = '' //预支付id，后台返回
  var paySign = '' //加密字符串
  getApp().requestFormPost(url, data, function(res) {
    if (data.payType == 0) { //微信支付
      var result = JSON.parse(res.data.data);
      // 小程序端处理微信支付返回结果
      if (result && result.result == true) {
        nonceStr = result.nonceStr;
        prepayId = result.prepayId;
        // 按照字段首字母排序组成新字符串
        var payDataA = "appId=" + getApp().globalData.appId + "&nonceStr=" + result.nonceStr + "&package=prepay_id=" + result.prepayId + "&signType=MD5&timeStamp=" + timestamp;
        var payDataB = payDataA + "&key=" + getApp().globalData.key;
        // 使用MD5加密算法计算加密字符串
        paySign = MD5Util.MD5(payDataB).toUpperCase();
        // 发起微信支付
        wx.requestPayment({
          'timeStamp': timestamp,
          'nonceStr': nonceStr,
          'package': 'prepay_id=' + prepayId,
          'signType': 'MD5',
          'paySign': paySign,
          'success': function(res) {
            console.log(res);
            //支付成功更新订单状态
            // updateStatusApi 不同支付调用的更新订单支付成功状态的接口api
            // data 支付成功之后需要更改状态的订单数据
            getApp().requestFormPost(updateStatusApi, data, function(res) {
              hidePembayaranModal && hidePembayaranModal();
              if (redirectToURL == null) {
                //不跳转
              } else {
                wx.redirectTo({
                  url: redirectToURL,
                })
              }
              wx.showToast({
                title: '支付成功',
                icon: 'none',
                duration: 2000
              })
            });
          }
        })
      }
    } else { //余额支付
      //支付成功更新订单状态
      // updateStatusApi 不同支付调用的更新订单支付成功状态的接口api
      // data 支付成功之后需要更改状态的订单数据
      // getApp().requestFormPost(updateStatusApi, data, function (res) {
      //   hidePembayaranModal && hidePembayaranModal();
      //   if (redirectToURL == null) {
      //     //不跳转
      //   } else {
      //     wx.redirectTo({
      //       url: redirectToURL,
      //     })
      //   }
      //   wx.showToast({
      //     title: '支付成功',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // });
      hidePembayaranModal && hidePembayaranModal();
      if (redirectToURL == null) {
        //不跳转
      } else {
        wx.redirectTo({
          url: redirectToURL,
        })
      }
      wx.showToast({
        title: res.data.data,
        icon: 'none',
        duration: 2000
      })
    }


  });
}
module.exports.goodsComment = goodsComment;
module.exports.receipt = receipt;
module.exports.cancel = cancel;
module.exports.gotoRefund = gotoRefund;
module.exports.jumpOrderInfo = jumpOrderInfo;
module.exports.shipment = shipment;
module.exports.jumpRefundAddress = jumpRefundAddress;
module.exports.cancelRefund = cancelRefund;
module.exports.wxPay = wxPay;
module.exports.countdown = countdown;
module.exports.refundReceipt = refundReceipt;

/**
 * 商品详情富文本解析
 * describe：商品详情内容
 */

var textParsing = function(describe) {
  //解析富文本中
  describe = describe.replace(/<br\s*[\/]?>/gi, "\r\n");
  describe = describe.replace(/<b>(.*?)<\/b>/gi, "$1");
  describe = describe.replace(/<strong>(.*?)<\/strong>/gi, "$1");
  describe = describe.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");
  describe = describe.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
  describe = describe.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
  describe = describe.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\r\n\r\n");
  describe = describe.replace(/ +(?= )/g, '');
  describe = describe.replace(/style="(.*?)"/gi, "");
  describe = describe.replace(/width="(.*?)" height="(.*?)"/gi, "");
  describe = describe.replace(/class="(.*?)"/gi, "");
  describe = describe.replace(/\<img +?src="(.*?)\/>/gi, '<div class="describe-div"><img class="describe-img" src="$1/></div>');
  describe = describe.replace(/<h2>/gi, "<p>");
  describe = describe.replace(/<\/h2>/gi, "</p>");
  describe = describe.replace(/<h3>/gi, "<p>");
  describe = describe.replace(/<\/h3>/gi, "</p>");
  describe = describe.replace(/ /gi, " ");
  describe = describe.replace(/ /gi, " ");
  describe = describe.replace(/&/gi, "&");
  describe = describe.replace(/"/gi, '"');
  describe = describe.replace(/</gi, '<');
  describe = describe.replace(/>/gi, '>');
  describe = describe.replace(/px/gi, "rpx");
  return describe;
}

module.exports.textParsing = textParsing;

/**
 * 提取富文本中的第一张图片
 */

var exportSrc = function (describe){
  var patt = /src="(.*?)"/gi;
  describe = patt.exec(describe);
  if(describe == null){
    return -1;
  }
  return describe[1];
}

module.exports.exportSrc = exportSrc;

/**
 * 计算商店距离
 * toLat:商店经度
 * toLon:商店纬度
 */

var shopDistance = function(toLat, toLon) {
  var fromLat = getApp().globalData.userLat;
  var fromLon = getApp().globalData.userLon;
  var radLat1 = fromLat * Math.PI / 180.0;
  var radLat2 = toLat * Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var b = fromLon * Math.PI / 180.0 - toLon * Math.PI / 180.0;
  var distance = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  distance = distance * 6378.137; // EARTH_RADIUS;
  distance = Math.round(distance);
  return distance;
}

module.exports.shopDistance = shopDistance;

var formatDateTime = function(inputTime)  {    
  var date = inputTime.split(" ")
  return  date[0]
};

module.exports.formatDateTime = formatDateTime;