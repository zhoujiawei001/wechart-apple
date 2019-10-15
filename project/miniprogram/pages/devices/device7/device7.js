// pages/devices/device7/device7.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    deviceId: '',
    supportMode: [], // 空调所支持的模式
    support: {
      speed: [0,1,2,3],
      temperature: [],
      windUd: 1,
      windLr: 1
    },
    modes: ['自动', '除湿', '送风', '制热', '制冷'],
    speeds: ['自动', '低风', '中风', '高风'],
    devDetails: {}, // 设备详情
    devStatus: {
      power: 1,
      temp: 26,
      mode: 0, // 0-自动，1-除湿，2-送风，3-制热，4-制冷
      speed: 0, // 0-自动，1-低风，2-中风, 3-高风
      windLr: 1, // 0-不支持, 1-左右扫风开，2-关
      windUd: 1, // 0-不支持, 1-上下扫风开，2-关
      independentWind: 0 // 0-非独立扫风，1-独立扫风
    }, // 设备状态
    delayOff: {
      id: 5,
      type: 2,
      runtime: 0,
      lifetime: 0,
      state: 0,
      repeatDay: ''
    }, // 倒计时关
    minTemp: 16,
    maxTemp: 30
  },
  /**设置模式 */
  modeFn: function () {
    let $e = this.data.devStatus.mode;
    let $idx = this.data.supportMode.indexOf($e);
    let $len = this.data.supportMode.length - 1;
    if ($idx === $len) {
      $idx = 0;
    } else {
      $idx += 1;
    }
    let $attr = this.data.devDetails.attributes[this.data.supportMode[$idx]]
    this.setData({
      ['devStatus.mode']: this.data.supportMode[$idx],
      ['devStatus.speed']: $attr.speed[0],
      support: $attr
    })
    if ($attr.temperature.length === 0) {
      this.setData({
        ['devStatus.temp']: 0
      })
    } else {
      this.setData({
        minTemp: $attr.temperature[0],
        maxTemp: $attr.temperature[$attr.temperature.length - 1],
        ['devStatus.temp']: 26
      })
    }
    let params = {
      deviceId: this.data.deviceId,
      ...this.data.devStatus
    }
    this.sendDataToDev(params);
  },
  /**设置风速 */
  windFn: function () {
    let $e = this.data.devStatus.speed;
    let $idx = this.data.support.speed.indexOf($e);
    let $len = this.data.support.speed.length - 1;
    if ($idx === $len) {
      $idx = 0;
    } else {
      $idx += 1;
    }
    this.setData({
      ['devStatus.speed']: this.data.support.speed[$idx]
    })
    let params = {
      deviceId: this.data.deviceId,
      ...this.data.devStatus
    }
    this.sendDataToDev(params);
  },
  /**设置上下扫风 */
  handleSwingUd: function () {
    this.setData({
      ['devStatus.windUd']: this.data.devStatus.windUd === 1 ? 2 : 1
    })
    let params = {
      deviceId: this.data.deviceId,
      ...this.data.devStatus
    }
    this.sendDataToDev(params);
  },
  /**设置左右扫风 */
  handleSwingLr: function () {
    this.setData({
      ['devStatus.windLr']: this.data.devStatus.windLr === 1 ? 2 : 1
    })
    let params = {
      deviceId: this.data.deviceId,
      ...this.data.devStatus
    }
    this.sendDataToDev(params);
  },
  /**设置温度 */
  adjustTemp: function (options) {
    if (this.data.support.temperature.length === 0) return;
    let $id = options.target.dataset.id;
    if (+$id) {
      if (this.data.devStatus.temp >= this.data.maxTemp) return
      let $temp = +this.data.devStatus.temp + 1;
      this.setData({
        ['devStatus.temp']: $temp
      })
    } else {
      if (this.data.devStatus.temp <= this.data.minTemp) return
      let $temp = +this.data.devStatus.temp - 1;
      this.setData({
        ['devStatus.temp']: $temp
      })
    }
    let params = {
      deviceId: this.data.deviceId,
      ...this.data.devStatus
    }
    this.sendDataToDev(params);
  },
  /**空调开关 */
  switchFn: function () {
    this.setData({
      ['devStatus.power']: +!this.data.devStatus.power
    })
    let params = {
      deviceId: this.data.deviceId,
      ...this.data.devStatus
    }
    this.sendDataToDev(params);
  },
  /**发送消息给设备 */
  sendDataToDev: function (params) {
    // 防止频繁点击
    clearTimeout(this.data.clickTimer);
    this.setData({
      clickTimer: null
    })
    this.data.clickTimer = setTimeout(() => {
      console.log('sendBody', params);
      wx.request({
        method: 'POST',
        url: app.globalData.domain + '/wap/v1/ctrlAc',
        data: params,
        header: {
          'appId': app.globalData.appId,
          'token': app.globalData.token,
          'signature': app.getSign(1),
          'timeStamp': app.getSign(0)
        },
        success: res => {
          console.log('sendBody_code', res.data.errorCode);
          let $code = res.data.errorCode;
          let msg = res.data.message;
          if ($code !== 0) {
            this.toastFn(msg);
          }
        },
        fail: err => {
          console.log(err);
        }
      })
    }, 350);
  },
  /**
   * toast
   */
  toastFn: function (txt) {
    wx.showToast({
      title: txt,
      image: '../../../images/warn.png'
    })
  },
  /**
   * 获取设备详情
   */
  getDevDetails: function () {
    wx.request({
      url: app.globalData.domain + '/wap/v1/remoteAc',
      data: {
        deviceId: this.data.deviceId
      },
      header: {
        'appId': app.globalData.appId,
        'token': app.globalData.token,
        'signature': app.getSign(1),
        'timeStamp': app.getSign(0)
      },
      success: res => {
        console.log('getDevDetails', res);
        wx.stopPullDownRefresh();
        let code = res.data.errorCode;
        let msg = res.data.message;
        let $res = res.data.data;
        if (code === 0) {
          this.setData({
            devDetails: $res.functions,
            devStatus: $res.state,
            delayOff: $res.timers.filter(item => item.type === 2)[0],
            supportMode: $res.functions.mode,
            support: $res.functions.attributes[$res.state.mode]
          })
          // 判断扫风0-不支持独立,1-支持独立
          this.setData({
            ['devStatus.independentWind']: $res.functions.independentWind,
            ['devStatus.windLr']: $res.functions.attributes[$res.state.mode].windLr ? $res.state.windLr : 0,
            ['devStatus.windUd']: $res.functions.attributes[$res.state.mode].windUd ? $res.state.windUd : 0
          })
          // this.judgeDelayIsOpen(this.data.delayOff);
        } else {
          wx.showToast({
            title: msg,
            image: '../../images/warn.png'
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    })
  },
  watchBack: function (value) {
    console.log('全局回调', value);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.watch(this.watchBack)
    this.setData({
      deviceId: options.deviceId
      // deviceId: '807D3A4BE793'
    })
    this.getDevDetails()
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})