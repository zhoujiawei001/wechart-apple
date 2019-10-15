// pages/timer/timer.js
const hours = []
const min = []

for (let i = 0; i <= 23; i++) {
  if (i < 10) {
    hours.push('0' + i);
  } else {
    hours.push(i)
  }
}

for (let i = 0; i <= 59; i++) {
  if (i < 10) {
    min.push('0' + i);
  } else {
    min.push(i)
  }
}
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceId: '',
    hours: hours,
    min: min,
    value: [0, 0],
    timeList: ['不关机', '00:30','01:00','02:00','03:00'],
    timeArr: [0, 30, 60, 120, 180],
    daysList: ['执行一次','工作日(周一至周五)','周末(周六及周日)','每天'],
    daysArr: ['','1,2,3,4,5','6,7','1,2,3,4,5,6,7'],
    selectTime: 0, // 选中的开机时间
    selectDate: 0, // 选中的循环日期
    c_params: { // 创建定时任务的参数
      deviceId: '',
      type: 1,
      runtime: 0,
      lifetime: 0,
      repeatDay: '',
      state: 1,
      id: 99
    },
    e_params: { // 修改定时任务的参数
      id: '',
      state: 1,
      runtime: 0,
      lifetime: 0,
      repeatDay: ''
    }
  },
  /**
   * 选中的开机时间
   */
  bindChange: function (e) {
    const val = e.detail.value
    this.setData({
      value: val
    })
  },
  /**
   * 选中的开机时长
   */
  handleTime: function (e) {
    console.log(e.target.dataset.id);
    this.setData({
      selectTime: e.target.dataset.id
    })
  },
  /**
   * 选中的循环日期
   */
  handleDate: function (e) {
    console.log(e.target.dataset.id);
    this.setData({
      selectDate: e.target.dataset.id
    })
  },
  /**
   * 点击确定
   */
  sure: function () {
    console.log(app.globalData);
    if (app.globalData.delayOn.id) {
      console.log('修改定时开', this.data.e_params);
      this.setData({
        ['e_params.id']: app.globalData.delayOn.id,
        ['e_params.lifetime']: this.data.timeArr[this.data.selectTime],
        ['e_params.runtime']: this.calcTime(this.data.value),
        ['e_params.repeatDay']: this.data.daysArr[this.data.selectDate]
      })
      this.createdOrEditDelayOn(this.data.e_params, 1)
    } else {
      console.log('创建定时开', this.data.c_params);
      this.setData({
        ['c_params.deviceId']: this.data.deviceId,
        ['c_params.lifetime']: this.data.timeArr[this.data.selectTime],
        ['c_params.runtime']: this.calcTime(this.data.value),
        ['c_params.repeatDay']: this.data.daysArr[this.data.selectDate]
      })
      this.createdOrEditDelayOn(this.data.c_params, 0)
    }
  },
  // 创建或修改定时开
  createdOrEditDelayOn: function (params,val2) {
    wx.request({
      method: 'POST',
      url: `${app.globalData.domain}/wap/v1/${val2?'timerEdit':'timerAdd'}`,
      data: params,
      header: {
        'appId': app.globalData.appId,
        'token': app.globalData.token,
        'signature': app.getSign(1),
        'timeStamp': app.getSign(0)
      },
      success: res => {
        console.log('createdOrEditDelayOn', res.data.errorCode);
        if (res.data.errorCode === 0) {
          wx.showToast({
            title: '设置成功',
            icon: 'success',
            duration: 2000
          })
          // this.getDevDetails();
          app.globalData.delayOn = params;
        }
      },
      fail: err => {
        console.log(err);
      }
    })
  },
  // 计算绝对时间
  calcTime: function (val) {
    let date = new Date();
    let yyMMDD = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    let curTimestamp = Date.parse(new Date(yyMMDD)); // 当天凌晨零点时间戳
    let totalTimestamp = val[0] * 3600000 + val[1] * 60000 + curTimestamp; // 将来要执行的绝对时间
    return totalTimestamp / 1000;
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
        let code = res.data.errorCode;
        let $res = res.data.data;
        if (code === 0) {
          app.globalData.delayOn = $res.timers.filter(item => item.type === 1)[0];
        }
      },
      fail: err => {
        console.log(err);
      }
    })
  },
  /**
   * 根据时间戳获取时分
   */
  getHourAndMin: function (stamp) {
    let h = new Date(stamp).getHours();
    let m = new Date(stamp).getMinutes()
    this.setData({
      value: [h,m]
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const $delayOn = app.globalData.delayOn;
    // 确定pick组件时分位置
    this.getHourAndMin($delayOn.runtime * 1000);
    // 确定开机时长位置
    let $timeIdx = this.data.timeArr.indexOf($delayOn.lifetime);
    // 确定开机循环日期
    let $dateIdx = this.data.daysArr.indexOf($delayOn.repeatDay);
    this.setData({
      selectTime: $timeIdx,
      selectDate: $dateIdx,
      deviceId: options.deviceId
    })
    console.log('timeIdx', $timeIdx, $dateIdx, this.data.deviceId);
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