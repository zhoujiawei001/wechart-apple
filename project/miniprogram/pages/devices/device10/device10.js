// pages/devices/device2/device2.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    numArr: [1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'],
    devId: '', // 设备Id
    rcType: '', // 设备类型
    funs: {}, // 功能全集
    stand_key: ['power', 'tv_power', 'signal', 'vol+', 'vol-', 'boot', 'menu', 'mute', 'back', 'up', 'down', 'left', 'right', 'ok'], // 标准键白名单
    extend_key: [], // 扩展键
  },

  /**下发命令 */
  sendCode: function (e) {
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
    this.setData({
      devId: options.deviceId,
      rcType: options.tid
    })
    app.getDevDetails(options.deviceId).then(res => {
      console.log('电视盒子的详情', res);
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