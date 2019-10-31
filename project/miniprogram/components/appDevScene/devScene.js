// components/appDevScene/devScene.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    propItem: Object
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
      console.log(this.data.propItem);
      let params = {
        sceneId: this.data.propItem.id
      }
      app.sendCode(params, 'sceneCtrl');
    }
  }
})
