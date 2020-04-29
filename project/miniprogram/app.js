//app.js
import md5 from './utils/md5.js'
App({
  onLaunch: function (options) {
    this.limit = 0 // 重连次数
    this.timer = null // 重连定时器
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
      domain: 'https://mpapi.yaokantv.com',
      // domain: 'http://demo.yaokantv.com:8214',
      appId: '',
      macs: '',
      token: '',
      signature: '',
      timeStamp: '',
      delayOn: {},
      deviceId: '',
      macArr: [],
      devList: [], // 设备列表
      bothwayDevRidArr: '', // 有双向通道的设备rc_id（暂时只有空调）
      lockReconnect: 0, // 是否连接websocket 0-未连接， 1-已连接
      typeObj: {
        1: '机顶盒',
        2: '电视机',
        6: '风扇',
        7: '空调',
        8: '灯泡',
        10: '电视盒子',
        21: '开关',
        22: '插座',
        23: '窗帘',
        24: '晾衣架',
        25: '灯控器',
        38: '风扇灯',
        41: '凉霸',
        42: '风扇'
      }
    }
    if (JSON.stringify(options.referrerInfo) === '{}') {
      console.log('没有传入参数-onLaunch')
      // this.globalData.appId = '5f81a6fe262695784c4369a5b59d78d0'; // 5f81a6fe262695784c4369a5b59d78d0, b39aa9159d02cdfde0cc00ba2c01e0bf
      // this.globalData.macs = '84f3eb30f05d,,'; // 2462AB014FCA, DC4F22529BE4, 807D3A4BE4C8
      // this.globalData.token = 'oc4xO5VHIbq-iufQR182L0DLC4DM';
      // this.globalData.macArr = JSON.stringify(this.globalData.macs.split(','));
      // console.log('macArr', this.globalData.macArr);
      wx.showToast({
        title: '请传入参数',
        image: './images/warn.png'
      })
    } else {
      console.log('传入了真实参数-onLaunch')
      this.globalData.appId = $extraData.appId;
      this.globalData.macs = $extraData.macs;
      this.globalData.token = $extraData.token;
      this.globalData.macArr = JSON.stringify($extraData.macs.split(','))
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
    /**获取当前时间戳 */
    this.getCurTimestamp = () => {
      return new Date().getTime();
    }
    /**断线重连 */
    this.reconnect = () => {
      console.log('重连');
      if (this.globalData.lockReconnect) return;
      this.globalData.lockReconnect = 1;
      clearTimeout(this.timer);
      if (this.limit < 12) {
        this.timer = setTimeout(() => {
          this.linkSocket();
          this.globalData.lockReconnect = 0;
        }, 5000);
        this.limit += 1;
      }
    }
    /**websocket发送信息给设备 */
    this.watch = (method) => {
      // setTimeout(() => {
      //   method(123)
      // }, 2000)
    }
    /**定时预先定义的websocket监听事件 */
    this.initEventHandle = (method) => {
      console.warn('我是老大');
      wx.onSocketMessage((res) => {
        console.log('收到消息', res);
        if (res.data == 'PONG') {
          this.heartCheck.reset().start()
        } else {
          console.log('处理数据')
          method(res.data);
        }
      })
      wx.onSocketOpen(() => {
        console.log('webSocket连接打开')
        this.heartCheck.reset().start();
      })
      wx.onSocketError((res) => {
        console.log('WebSocket连接打开失败')
        this.reconnect();
      })
      wx.onSocketClose((res) => {
        console.log('WebSocket 已关闭！')
        this.reconnect();
      })
    }
    /**连接socKet */
    this.linkSocket = () => {
      console.warn('我是老三');
      wx.closeSocket();
      wx.connectSocket({
        url: `wss://cloud.yaokantv.com:19501?uuid=${this.getCurTimestamp()}&macs=${this.globalData.macArr}&extras=${this.globalData.bothwayDevRidArr}`,
        success: () => {
          console.log('webSocket连接成功');
        }
      })
    }
    this.linkSocket();
    /**心跳对象 */
    this.heartCheck = {
      timeout: 30000,
      timeoutObj: null,
      serverTimeoutObj: null,
      reset: function () {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
      },
      start: function () {
        this.timeoutObj = setTimeout(() => {
          console.log("发送ping");
          wx.sendSocketMessage({
            data: "PING",
            // success(){
            //  console.log("发送ping成功");
            // }
          });
          this.serverTimeoutObj = setTimeout(() => {
            wx.closeSocket();
          }, this.timeout);
        }, this.timeout);
      }
    }
    /**获取设备详情 */
    this.getDevDetails = (devId) => {
      return new Promise((resolve, reject) => {
        wx.request({
          url: this.globalData.domain + '/wap/v1/remote',
          data: {
            deviceId: devId
          },
          header: {
            'appId': this.globalData.appId,
            'token': this.globalData.token,
            'signature': this.getSign(1),
            'timeStamp': this.getSign(0)
          },
          success: res => {
            console.log('g-DevDetails', res);
            let code = res.data.errorCode;
            let msg = res.data.message;
            if (code === 0) {
              resolve(res.data.data);
            } else {
              console.log('234234324')
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
      })
    }
    /**http发送消息给设备 */
    this.sendCode = (params, url) => {
      /**手机震动 */
      wx.vibrateLong({
        success: res => {
          console.log('震动成功', res);
        }
      })
      console.log('sendCode_params', params);
      wx.request({
        method: 'POST',
        url: this.globalData.domain + '/wap/v1/' + url,
        data: params,
        header: {
          'appId': this.globalData.appId,
          'token': this.globalData.token,
          'signature': this.getSign(1),
          'timeStamp': this.getSign(0)
        },
        success: res => {
          console.log('sendCode_result', res);
          let code = res.data.errorCode;
          let msg = res.data.message;
          if (code === 0) {
            console.log('控制成功了');
          } else {
            wx.showToast({
              title: msg,
              image: '../../images/warn.png'
            })
          }
        }
      })
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
      this.globalData.macArr = JSON.stringify($extraData.macs.split(','));
    }
  }
})
