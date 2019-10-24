// components/appDevItem/devItem.js
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
    typeObj: {
      1: '机顶盒',
      2: '电视机',
      6: '风扇',
      7: '空调',
      8: '灯泡',
      10: '电视盒子',
      22: '插座'
    },
    include_dev: [1,2,6,7,8,10]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goToDevices () {
      if (this.data.include_dev.includes(this.data.propItem.rcType)) {
        if (this.data.propItem.modelNo === 2) {
          wx.navigateTo({
            url: `../devices/dev_pt/device${this.data.propItem.rcType}?tid=${this.data.propItem.rcType}&deviceId=${this.data.propItem.deviceId}&mac=${this.data.propItem.mac}`,
          })
        } else {
          wx.navigateTo({
            url: `../devices/device${this.data.propItem.rcType}/device${this.data.propItem.rcType}?tid=${this.data.propItem.rcType}&deviceId=${this.data.propItem.deviceId}&mac=${this.data.propItem.mac}`,
          })
        }
      } else {
        wx.showToast({
          title: '暂未开发',
          image: '../../images/warn.png'
        })
      }
    },
    switchFn () {
      if (this.data.propItem.rcType !== 7) {
        app.sendCode(this.data.propItem.deviceId, 'power', this.data.propItem.rcType)
      } else {
        wx.showToast({
          title: '敬请期待',
          image: '../../images/warn.png'
        })
      }
    }
  }
})
