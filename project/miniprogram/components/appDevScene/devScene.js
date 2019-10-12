// components/appDevScene/devScene.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    propIdx: String
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    execute: function () {
      console.log(this.data.propIdx);
    }
  }
})
