import { changeSelectTime, add_zero } from '../../../utils/index.js'
import md5 from '../../../utils/md5.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  list: [], // 设备列表
  data: {
    devName: '空调', // 设备名称
    support: { // 各个模式下所支持的空调功能
      speed: [0, 1, 2, 3],
      temperature: [],
      windUd: 1,
      windLr: 1
    },
    supportMode: [0, 1, 2, 3, 4], // 空调所支持的模式
    minTemp: 16,
    maxTemp: 30,
    modes: ['自动', '除湿', '送风', '制热', '制冷'],
    speeds: ['自动', '低风', '中风', '高风'],
    isShowModeBox: false, // 控制模式弹出框的变量
    isShowWindBox: false, // 控制风速弹出框变量
    isShowDelayBox: false, // 控制倒计时弹出框的变量
    hhmmss: '', // 倒计时 00:00:00
    delayTimer: null, // 倒计时timer
    deviceId: '', // 设备ID
    mac: '', // mac地址
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
    delayOn: {
      id: 0,
      type: 1,
      runtime: 0,
      lifetime: 0,
      state: 0,
      repeatDay: ''
    }, // 定时开，开多久关闭
    showDelayOn: {
      p_time: '',
      l_time: '',
      date: ''
    },
    curPower: 0, // 当前功率
    curPowerTimer: null, // 当前功能定时获取任务
    todayPower: 0, // 今日用电量
    todayPowerTimer: null, // 今日电量定时任务
    clickTimer: null, // 防止频繁点击
    propValue: [0,0],
    be_rc_type: '',
    rc_id: '',
  },
  /**
   * 空调开关
   */
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
  /**
   * 调整温度
   */
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
  /**
   * 点击模式引出弹出框
   */
  clickMode: function () {
    this.setData({
      isShowModeBox: true
    })
  },
  /**
   * 点击风速引出弹出框
   */
  clickWind: function () {
    this.setData({
      isShowWindBox: true
    })
  },
  /**
   * 关闭模式弹出框
   */
  closeBoxModeFn: function () {
    this.setData({
      isShowModeBox: false
    })
  },
  /**
   * 关闭风速弹出框
   */
  closeBoxWindFn: function () {
    this.setData({
      isShowWindBox: false
    })
  },
  /**
   * 获取选中的条目
   */
  handleSelectItem: function (e) {
    let $n = e.detail.split('-');
    let $attr = this.data.devDetails.attributes[$n[1]]
    if ($n[0] === 'mode') {
      this.setData({
        ['devStatus.mode']: +$n[1],
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
    } else {
      this.setData({
        ['devStatus.speed']: +$n[1]
      })
    }
    let params = {
      deviceId: this.data.deviceId,
      ...this.data.devStatus
    }
    this.sendDataToDev(params);
  },
  /**
   *点击上下扫风
   */
  handleSwingUd: function (e) {
    this.setData({
      ['devStatus.windUd']: this.data.devStatus.windUd === 1 ? 2 : 1
    })
    let params = {
      deviceId: this.data.deviceId,
      ...this.data.devStatus
    }
    this.sendDataToDev(params);
  },
  /**
   *点击左右扫风
   */
  handleSwingLr: function (e) {
    this.setData({
      ['devStatus.windLr']: this.data.devStatus.windLr === 1 ? 2 : 1
    })
    let params = {
      deviceId: this.data.deviceId,
      ...this.data.devStatus
    }
    this.sendDataToDev(params);
  },
  /**
   * 点击倒计时关
   */
  handleDelay: function () {
    this.setData({
      isShowDelayBox: true
    })
  },
  /**
   * 关闭倒计时关弹出框
   */
  closeBoxDelayFn: function () {
    this.setData({
      isShowDelayBox: false
    })
  },
  /**
   * 点击倒计时关弹框确定
   */
  clickDelaySure: function (e) {
    const val = e.detail; // 选中的时间
    let curTimestamp = Date.parse(new Date()); // 当前时间戳
    let totalTimestamp = val[0] * 3600000 + val[1] * 60000 + curTimestamp; // 将来要执行的绝对时间
    /** 如果倒计时id为0则是创建，id非0则是编辑 **/
    if (this.data.delayOff.id) {
      console.log('编辑倒计时关');
      this.editDelay(totalTimestamp / 1000);
    } else {
      console.log('创建倒计时关')
      this.createDelay(totalTimestamp / 1000);
    }
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
          // this.getDevDetails();
          this.setToOpenTimer(runtime);
        }
        setTimeout(() => {
          this.setData({
            isShowDelayBox: false
          })
        }, 100)
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
          // this.getDevDetails();
          this.setToOpenTimer(runtime);
        }
        setTimeout(() => {
          this.setData({
            isShowDelayBox: false
          })
        }, 100)
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
    this.setData({
      ['delayOff.state']: 1
    })
    clearInterval(this.data.delayTimer);
    let curTimestamp = Date.parse(new Date());
    let totalTimestamp = runtime * 1000;
    this.setData({
      hhmmss: changeSelectTime(totalTimestamp, 1),
      propValue: changeSelectTime(totalTimestamp, 0)
    })
    this.data.delayTimer = setInterval(() => {
      let $curTimestamp = Date.parse(new Date());
      this.setData({
        hhmmss: changeSelectTime(totalTimestamp, 1),
        propValue: changeSelectTime(totalTimestamp, 0)
      })
      if ($curTimestamp >= totalTimestamp) {
        clearInterval(this.data.delayTimer);
        this.setData({
          ['delayOff.state']: 0,
          hhmmss: '',
          delayTimer: null,
          ['devStatus.power']: 0,
          propValue: [0, 0]
        })
      }
    }, 1000);
  },
  /**
   * 判断倒计时关是否能开启
   */
  judgeDelayIsOpen: function (obj) {
    if (obj.state) {
      clearInterval(this.data.delayTimer);
      let curTimestamp = Date.parse(new Date());
      let totalTimestamp = obj.runtime * 1000;
      this.setData({
        hhmmss: changeSelectTime(totalTimestamp, 1),
        propValue: changeSelectTime(totalTimestamp, 0)
      })
      this.data.delayTimer = setInterval(() => {
        let $curTimestamp = Date.parse(new Date());
        this.setData({
          hhmmss: changeSelectTime(totalTimestamp, 1),
          propValue: changeSelectTime(totalTimestamp, 0)
        })
        if ($curTimestamp >= totalTimestamp) {
          clearInterval(this.data.delayTimer);
          this.setData({
            ['delayOff.state']: 0,
            hhmmss: '',
            delayTimer: null,
            ['devStatus.power']: 0,
            propValue: [0,0]
          })
        }
      }, 1000);
    } else {
      clearInterval(this.data.delayTimer);
      this.setData({
        hhmmss: '',
        delayTimer: null
      })
    }
  },
  /**
   * 关闭倒计时关
   */
  closeDelayOff: function () {
    clearTimeout(this.data.clickTimer);
    this.setData({
      clickTimer: null
    })
    this.data.clickTimer = setTimeout(() => {
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
            // this.getDevDetails();
            clearInterval(this.data.delayTimer);
            this.setData({
              ['delayOff.state']: 0,
              hhmmss: '',
              delayTimer: null
            })
          }
        },
        fail: err => {
          console.log(err);
        }
      })
    }, 350)
  },
  /**
   * 定时开关
   */
  switchDelayOn: function () {
    let $delayOn = app.globalData.delayOn
    if ($delayOn.id) {
      clearTimeout(this.data.clickTimer);
      this.setData({
        clickTimer: null
      })
      let $data = {
        id: $delayOn.id,
        runtime: $delayOn.runtime,
        lifetime: $delayOn.lifetime,
        repeatDay: $delayOn.repeatDay,
        state: +!$delayOn.state 
      }
      this.data.clickTimer = setTimeout(() => {
        wx.request({
          method: 'POST',
          url: app.globalData.domain + '/wap/v1/timerEdit',
          data: $data,
          header: {
            'appId': app.globalData.appId,
            'token': app.globalData.token,
            'signature': app.getSign(1),
            'timeStamp': app.getSign(0)
          },
          success: res => {
            console.log('editDelayOn', res.data.errorCode);
            if (res.data.errorCode === 0) {
              // this.getDevDetails();
              app.globalData.delayOn = $data;
              this.setData({
                delayOn: $data
              })
            }
            setTimeout(() => {
              this.setData({
                isShowDelayBox: false
              })
            }, 100)
          },
          fail: err => {
            console.log(err);
          }
        })
      }, 350);
    } else {
      this.toastFn('请设置参数');
    }
  },
  // 定时开关时间
  delayOnTime: function (timestamp) {
    let date = new Date(timestamp)
    let hh = date.getHours();
    let mm = date.getMinutes();
    return `${add_zero(hh)}:${add_zero(mm)}`;
  },
  // 定时开机多久
  delayOnLong: function (lifeTime) {
    let num = lifeTime / 60
    return num ? `开机${num}小时` : '一直开机'
  },
  // 重复日子
  delayOnRepeatDay: function (repeatDay) {
    if (repeatDay === '') {
      return '执行一次';
    } else if (repeatDay === '1,2,3,4,5') {
      return '工作日重复';
    } else if (repeatDay === '6,7') {
      return '周末重复';
    } else {
      return '每天重复'
    }
  },
  /***************************** 数据类 *****************************/
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
        let code = res.data.errorCode;
        let msg = res.data.message;
        let $res = res.data.data;
        if (code === 0) {
          this.setData({
            devName: $res.name,
            devDetails: $res.functions,
            devStatus: $res.state,
            delayOn: $res.timers.filter(item => item.type === 1)[0],
            delayOff: $res.timers.filter(item => item.type === 2)[0],
            supportMode: $res.functions.mode,
            support: $res.functions.attributes[$res.state.mode]
          })
          app.globalData.delayOn = $res.timers.filter(item => item.type === 1)[0];
          this.setData({
            ['showDelayOn.p_time']: this.delayOnTime($res.timers.filter(item => item.type === 1)[0].runtime * 1000),
            ['showDelayOn.l_time']: this.delayOnLong($res.timers.filter(item => item.type === 1)[0].lifetime),
            ['showDelayOn.date']: this.delayOnRepeatDay($res.timers.filter(item => item.type === 1)[0].repeatDay)
          })
          // 判断扫风0-不支持独立,1-支持独立
          this.setData({
            ['devStatus.independentWind']: $res.functions.independentWind,
            ['devStatus.windLr']: $res.functions.attributes[$res.state.mode].windLr ? $res.state.windLr : 0,
            ['devStatus.windUd']: $res.functions.attributes[$res.state.mode].windUd ? $res.state.windUd : 0
          })
          this.judgeDelayIsOpen(this.data.delayOff);

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
   * 发送信息给设备
   */
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
   * 获取当前功率
   */
  getCurPower: function () {
    wx.request({
      url: app.globalData.domain + '/wap/v1/power',
      data: {
        mac: this.data.mac
      },
      header: {
        'appId': app.globalData.appId,
        'token': app.globalData.token,
        'signature': app.getSign(1),
        'timeStamp': app.getSign(0)
      },
      success: res => {
        console.log('getCurPower', res);
        let $code = res.data.errorCode;
        let $data = res.data.data;
        if ($code === 0) {
          let $val = res.data.data.value;
          this.setData({
            curPower: $val.substring(0, $val.length - 2)
          })
        }
      },
      fail: err => {
        console.log('fail', err);
      }
    })
  },
  /**
   * 获取今日用电量
   */
  getTodayBattery: function () {
    wx.request({
      url: app.globalData.domain + '/wap/v1/powerDay',
      data: {
        mac: this.data.mac
      },
      header: {
        'appId': app.globalData.appId,
        'token': app.globalData.token,
        'signature': app.getSign(1),
        'timeStamp': app.getSign(0)
      },
      success: res => {
        console.log('getTodayBattery', res);
        let $code = res.data.errorCode;
        let $data = res.data.data;
        if ($code === 0) {
          let $val = res.data.data.value;
          this.setData({
            todayPower: $val.substring(0, $val.length - 2)
          })
        }
      },
      fail: err => {
        console.log('fail', err);
      }
    })
  },
  // 点击今日用电量区域
  clickTodayUse: function () {
    wx.navigateTo({
      url: `../../chart/chart?mac=${this.data.mac}`,
    })
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
  onLoad: function (options) {
    app.initEventHandle(this.watchBack)
    console.log('options', options);
    this.setData({
      deviceId: options.deviceId,
      be_rc_type: options.tid,
      mac: options.mac,
      rc_id: options.rid
    })
    /**进入页面获取的第一手数据 */
    this.getDevDetails();
    this.getCurPower();
    this.getTodayBattery();
  },
  /**
   * 跳去定时开页面
   */
  goToTimer: function () {
    wx.navigateTo({
      url: `../../timer/timer?deviceId=${this.data.deviceId}`,
    })
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
    let $delayOn = app.globalData.delayOn;
    this.setData({
      ['showDelayOn.p_time']: this.delayOnTime($delayOn.runtime * 1000),
      ['showDelayOn.l_time']: this.delayOnLong($delayOn.lifetime),
      ['showDelayOn.date']: this.delayOnRepeatDay($delayOn.repeatDay),
      delayOn: $delayOn
    })
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
    // console.log('你拉了嘛？');
    // this.getDevDetails();
    // this.getCurPower();
    // this.getTodayBattery();
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