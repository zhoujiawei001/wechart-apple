// pages/devices/device7/device7.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  list: [], // 设备列表
  clickCounts: 0, // 点击次数
  listMin: [10, 20, 30],
  setTime: 0, // 设置的时间s
  delayTimer: null, // 倒计时定时器
  delayBodyTimer: null, // 倒计时定时器2
  clickTimer: null, // 频繁点击定时
  data: {
    deviceId: '',
    supportMode: [0,1,2,3,4], // 空调所支持的模式
    support: { // 空调所支持的功能
      speed: [0,1,2,3],
      temperature: [],
      windUd: 1,
      windLr: 1
    },
    modes: ['自动', '除湿', '送风', '制热', '制冷'],
    speeds: ['自动风', '低风', '中风', '高风'],
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
    maxTemp: 30,
    hh: '', // 倒计时显示时间时
    mm: '', // 倒计时显示时间分
    clickTime: 0, // 设置的时间在data中的
    be_rc_type: '',
    mac: '',
    rc_id: ''
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
  /**设置倒计时 */
  setDelay: function () {
    let curTimestamp = Date.parse(new Date()); // 当前时间戳
    this.setTime += this.listMin[this.clickCounts] * 60;
    if (this.setTime >= 24 * 3600) { // 延时时间最大不得超过12个小时
      this.setTime = 24 * 3600;
    }
    this.clickCounts++;
    if (this.clickCounts > 2) {
      this.clickCounts = 2;
    }
    this.setData({
      hh: this.changeSecondToHHMM(this.setTime, 'h'),
      mm: this.changeSecondToHHMM(this.setTime, 'm'),
      clickTime: this.setTime
    })
    if (this.delayBodyTimer) {
      clearTimeout(this.delayBodyTimer);
      this.delayBodyTimer = null;
    }
    if (this.delayTimer) {
      clearInterval(this.delayTimer);
      this.delayTimer = null;
    }
    this.delayBodyTimer = setTimeout(() => {
      if (this.data.delayOff.id) {
        console.log('编辑倒计时关');
        this.editDelay(this.setTime + curTimestamp / 1000);
      } else {
        console.log('创建倒计时关')
        this.createDelay(this.setTime + curTimestamp / 1000);
      }
    }, 3000);
  },
  /**关闭倒计时 */
  closeDelay: function () {
    clearTimeout(this.clickTimer);
    this.clickTimer = null;
    this.clickTimer = setTimeout(() => {
      wx.request({
        method: 'POST',
        url: app.globalData.domain + '/wap/v1/timerEdit',
        data: {
          id: this.data.delayOff.id,
          runtime: 0,
          lifetime: 0,
          repeatDay: '',
          state: 0
        },
        header: {
          'appId': app.globalData.appId,
          'token': app.globalData.token,
          'signature': app.getSign(1),
          'timeStamp': app.getSign(0)
        },
        success: res => {
          console.log('closeDelayOff', res.data.errorCode);
          if (res.data.errorCode === 0) {
            clearInterval(this.delayTimer);
            this.setTime = 0;
            this.clickCounts = 0;
            this.setData({
              ['delayOff.state']: 0,
              hh: '',
              mm: '',
              clickTime: 0
            })
          }
        },
        fail: err => {
          console.log(err);
        }
      })
    }, 350)
  },
  // 编辑倒计时关
  editDelay: function (runtime) {
    wx.request({
      method: 'POST',
      url: app.globalData.domain + '/wap/v1/timerEdit',
      data: {
        id: this.data.delayOff.id,
        runtime: runtime,
        lifetime: 0,
        repeatDay: '',
        state: 1
      },
      header: {
        'appId': app.globalData.appId,
        'token': app.globalData.token,
        'signature': app.getSign(1),
        'timeStamp': app.getSign(0)
      },
      success: res => {
        console.log('editDelay', res.data.errorCode);
        if (res.data.errorCode === 0) {
          this.setToOpenTimer(runtime);
        }
        // setTimeout(() => {
        //   this.setData({
        //     isShowDelayBox: false
        //   })
        // }, 100)
      },
      fail: err => {
        console.log(err);
      }
    })
  },
  // 创建倒计时关
  createDelay: function (runtime) {
    wx.request({
      method: 'POST',
      url: app.globalData.domain + '/wap/v1/timerAdd',
      data: {
        deviceId: this.data.deviceId,
        type: 2,
        runtime: runtime,
        lifetime: 0,
        repeatDay: ''
      },
      header: {
        'appId': app.globalData.appId,
        'token': app.globalData.token,
        'signature': app.getSign(1),
        'timeStamp': app.getSign(0)
      },
      success: res => {
        console.log('createDelay', res.data.errorCode);
        if (res.data.errorCode === 0) {
          this.setToOpenTimer(runtime);
        }
        // setTimeout(() => {
        //   this.setData({
        //     isShowDelayBox: false
        //   })
        // }, 100)
      },
      fail: err => {
        console.log(err);
      }
    })
  },
  /**
   * 设定之后直接执行，不用先请求详情接口
   */
  setToOpenTimer: function (runtime) {
    console.log(runtime);
    this.clickCounts = 0;
    this.setData({
      ['delayOff.state']: 1
    })
    clearInterval(this.delayTimer);
    let curTimestamp = Date.parse(new Date());
    let totalTimestamp = runtime * 1000;
    this.setData({
      hh: this.changeSecondToHHMM((totalTimestamp - curTimestamp) / 1000, 'h'),
      mm: this.changeSecondToHHMM((totalTimestamp - curTimestamp) / 1000, 'm')
    })
    this.delayTimer = setInterval(() => {
      let $curTimestamp = Date.parse(new Date());
      this.setTime = (totalTimestamp - $curTimestamp) / 1000;
      this.setData({
        hh: this.changeSecondToHHMM((totalTimestamp - $curTimestamp) / 1000, 'h'),
        mm: this.changeSecondToHHMM((totalTimestamp - $curTimestamp) / 1000, 'm'),
        clickTime: (totalTimestamp - $curTimestamp) / 1000
      })
      if ($curTimestamp >= totalTimestamp) {
        clearInterval(this.delayTimer);
        this.delayTimer = null;
        this.setTime = 0;
        this.clickCounts = 0;
        this.setData({
          ['delayOff.state']: 0,
          hh: '',
          mm: '',
          ['devStatus.power']: 0,
          clickTime: 0
        })
      }
    }, 1000);
  },
  /**
   * 将时间间隔s转化为hh或mm
   * @param val为'h'转化为hh否则转化为mm
   */
  changeSecondToHHMM: function (sec, val) {
    if (val === 'h') {
      return this.addZero(Math.floor(sec / 3600));
    } else {
      return this.addZero(Math.floor((sec % 3600) / 60));
    }
  },

  /**
   * 补零方法
   */
  addZero: function (num) {
    if (num < 10) {
      return '0' + num;
    } else {
      return '' + num;
    }
  },

  /**发送消息给设备 */
  sendDataToDev: function (params) {
    // 防止频繁点击
    clearTimeout(this.clickTimer);
    this.clickTimer = null;
    this.clickTimer = setTimeout(() => {
      console.log('sendBody', params);
      /**手机震动 */
      wx.vibrateLong({
        success: res => {
          console.log('震动成功', res);
        }
      })
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
          console.log('sendBody_code', res);
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
          if (this.data.delayOff.state) {
            this.setToOpenTimer(this.data.delayOff.runtime);
          }
          // 下发单次websocket接口,获取单个设备的状态
          let j_obj = {
            type: 4,
            be_rc_type: this.data.be_rc_type,
            mac: this.data.mac,
            rc_id: this.data.rc_id
          }
          console.log('下发单次websocket接口', j_obj);
          wx.sendSocketMessage({
            data: JSON.stringify(j_obj),
            success: res => {
              console.log('sendSocketMessage', res);
            }
          })
        } else {
          wx.showToast({
            title: msg,
            image: '../../../images/warn.png'
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    })
  },
  /**
   * 合并设备列表
   */
  mergeList: function (obj) {
    console.log('obj', obj);
    this.setData({
      ['devStatus.power']: obj.power * 1,
      ['devStatus.mode']: obj.mode * 1,
      ['devStatus.speed']: obj.speed * 1,
      ['devStatus.temp']: obj.temp * 1,
      ['devStatus.windLr']: obj.windLr * 1,
      ['devStatus.windUd']: obj.windUd * 1,
      ['devStatus.independentWind']: obj.independentWind * 1
    })
    this.list = app.globalData.devList.map(item => {
      if (item.rid == obj.rc_id) {
        item.state.power = obj.power;
        return item;
      } else {
        return item;
      }
    })
    console.log('list', this.list);
    app.globalData.devList = this.list;
  },
  watchBack: function (value) {
    console.log('device7', value);
    this.mergeList(JSON.parse(value).data);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.initEventHandle(this.watchBack)
    console.log('options', options);
    this.setData({
      deviceId: options.deviceId,
      be_rc_type: options.tid,
      mac: options.mac,
      rc_id: options.rid
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