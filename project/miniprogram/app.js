//app.js
import md5 from './utils/md5.js'
App({
  onLaunch: function (options) {
    console.log('app.onLaunch', options.referrerInfo);
    let $extraData = options.referrerInfo.extraData;
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {
      // domain: 'https://mpapi.yaokantv.com',
      domain: 'http://demo.yaokantv.com:8214',
      appId: '',
      macs: '',
      token: '',
      signature: '',
      timeStamp: '',
      delayOn: {},
      deviceId: ''
    }
    if (JSON.stringify(options.referrerInfo) === '{}') {
      console.log('没有传入参数-onLaunch')
      this.globalData.appId = '94d3b83bd9f00589acac31520664993e';
      this.globalData.macs = '5CCF7FB6BCEB,68C63AA51271'; // 68C63AA51271, 5CCF7FB6BCEB
      this.globalData.token = 'oaudd5Xk70stFxWAXglGEgLrUaHI';
      wx.showToast({
        title: '请传入参数',
        image: './images/warn.png'
      })
    } else {
      console.log('传入了真实参数-onLaunch')
      this.globalData.appId = $extraData.appId;
      this.globalData.macs = $extraData.macs;
      this.globalData.token = $extraData.token;
    }
    /**
   * 通过md5处理获取sign
   */
    this.getSign = val => {
      let $timestamp = Date.parse(new Date()) / 1000;
      let signStr = this.globalData.appId + $timestamp;
      let $B = md5(signStr);
      let sign = $B.slice(1, 2) + $B.slice(3, 4) + $B.slice(7, 8) + $B.slice(15, 16) + $B.slice(31, 32);
      if (val) {
        return sign;
      } else {
        return $timestamp;
      }
    }
  },
  onShow: function (options) {
    console.log('app.onshow', options.referrerInfo);
    let $extraData = options.referrerInfo.extraData;
    if (JSON.stringify(options.referrerInfo) === '{}') {
      console.log('没有传入参数-onShow')
      // this.globalData.appId = '94d3b83bd9f00589acac31520664993e';
      // this.globalData.macs = '5CCF7FB6BCEB'; // 68C63AA51271, 5CCF7FB6BCEB
      // this.globalData.token = 'oaudd5Xk70stFxWAXglGEgLrUaHI';
      wx.showToast({
        title: '请传入参数',
        image: '../../images/warn.png'
      })
    } else {
      console.log('传入了真实参数-onShow')
      this.globalData.appId = $extraData.appId;
      this.globalData.macs = $extraData.macs;
      this.globalData.token = $extraData.token;
    }
  }
})
