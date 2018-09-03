var MD5Util = require("md5.js");
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 保留字符串头尾其他用*代替
 */
var partlyHidden = function(str) {
  var array = str.match(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g);
  var start = -1;
  if (array != null && array.length > 0) {
    start = str.indexOf(array[0]);
  }
  return (start === 0 ? array[0] : str.charAt(0)) + "**";
}

module.exports = {
  formatTime: formatTime,
  partlyHidden: partlyHidden
}