Component({

  behaviors: [],

  properties: {
    index: {
      type: Number,
      value: 0,
    }, //组件下标

    num: {
      type: Number,
      value: 1,
      observer: function(newVal, oldVal, changedPath) {
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
        var index = this.data.index;
        var myEventDetail = {
          num: newVal,
          index: index
        } // detail对象，提供给事件监听函数
        var myEventOption = {} // 触发事件的选项
        this.triggerEvent('showNum', myEventDetail, myEventOption)
      }
    }, //显示数量

    maxNumber: {
      type: Number,
      value: -1, // -1为没有最大值
    }, //最大限值

    minNumber: {
      type: Number,
      value: 1,
    }, //最小限值
  },

  data: {

  },

  methods: {
    _bindMinus: function() {
      var num = this.data.num,
        minNumber = this.data.minNumber;
      if (num > minNumber) {
        num--;
      }
      this.setData({
        num: num
      });
    },

    _bindPlus: function() {
      var num = this.data.num,
        maxNumber = this.data.maxNumber;
      if (num < maxNumber || maxNumber === -1) {
        num++;
      }
      this.setData({
        num: num
      });
    }
  }

})