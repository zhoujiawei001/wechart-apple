// pages/devices/device21/device21.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: '../../images/devIcon/38.png',
    devId: '', // 设备Id
    rcType: '', // 设备类型
    funs: {}, // 功能全集
    stand_key: ['stop', 'low', 'mid', 'high', 'light', '1h','2h','4h','8h'], // 标准键白名单
    extend_key: [], // 扩展键
    status: 0, // 0-关闭，1-开启
    list1: [
      {
        text: '停止',
        value: 'stop'
      }, {
        text: '低风',
        value: 'low'
      }, {
        text: '中风',
        value: 'mid'
      }, {
        text: '高风',
        value: 'high'
      }
    ],
    list2: [
      {
        text: '1H',
        value: '1h'
      }, {
        text: '2H',
        value: '2h'
      }, {
        text: '4H',
        value: '4h'
      }, {
        text: '8H',
        value: '8h'
      }
    ]
  },
  /**下发命令 */
  sendCode: function (e) {
    console.log(e.target.dataset.key);
    let code = e.target.dataset.key;
    let params = {
      deviceId: this.data.devId,
      cmdName: code,
      rcType: this.data.rcType
    }
    app.sendCode(params, 'ctrl')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options', options);
    this.setData({
      devId: options.deviceId,
      rcType: options.tid,
    })
    app.getDevDetails(options.deviceId).then(res => {
      console.log('开关的详情', res);
      let $funs = res.functions;
      let $funs_arr = [];
      for (let key in $funs) {
        $funs_arr.push($funs[key])
      }

      let $extend_key = $funs_arr.filter(item => !this.data.stand_key.includes(item.value));
      this.setData({
        funs: $funs,
        extend_key: $extend_key
      })
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