// pages/sliderLeft/sliderLeft.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    itemid: {
      type: Number,
      value: '1'
    },
    index: {
      type: Number,
      value: '0'
    },
    isOpen: {
      type: Boolean,
      value: false,
      observer: function (isOpen) {
        this.setData({
          x: isOpen ? -96 : 0
        })
      }
    }    
  },

  /**
   * 组件的初始数据
   */
  data: {
    x: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _onChange: function (e) {
      if (e.detail.source === 'touch') {
        this.setData({ x: e.detail.x })
      }
    },

    _touchstart: function (e) {
      if(!this.data.isOpen){
        this.triggerEvent('conversationTouchstart', { index: e.currentTarget.dataset.index }, {})
      }
    },

    _touchend: function (e) {
      var x = this.data.x;
      //删除按钮已显示，则一滑动就关闭
      if (this.data.isOpen && x > -96) {
        this.setData({ 
          x: 0,
          isOpen: false
        })
      }else if(x < -30) {
        //达到阈值则显示否则关闭
        this.setData({
          isOpen: true
        })
      } else {
        this.setData({
          x: 0,
          isOpen: false
        })
      }
    },

    /**
     * 删除会话
     */
    delConversation: function (e) {
      this.triggerEvent('delConversation', {index: e.currentTarget.dataset.index}, {})
    },

    /**
     * 跳转到聊天界面
     */
    todo: function (e) {
      this.triggerEvent('todo', { itemid: e.currentTarget.dataset.itemid }, {})
    },

  }
})
