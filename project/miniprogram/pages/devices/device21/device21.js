// pages/devices/device21/device21.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: '../../images/devIcon/21.png',
    devId: '', // 设备Id
    rcType: '', // 设备类型
    funs: {}, // 功能全集
    stand_key: ['on', 'off', 'power'], // 标准键白名单
    extend_key: [], // 扩展键
    status: 0, // 0-关闭，1-开启
  },
  /**下发命令 */
  sendCode: function (e) {
    console.log(e.target.dataset.key);
    let code = e.target.dataset.key;
    // if (code === this.data.stand_key[0]) {
    //   this.setData({
    //     imgUrl: `../../images/devIcon_blue/${this.data.rcType}_1.png`,
    //     status: 1,
    //   })
    // } else if (code === this.data.stand_key[1]) {
    //   this.setData({
    //     imgUrl: `../../images/devIcon_blue/${this.data.rcType}_0.png`,
    //     status: 0,
    //   })
    // } else if (code === this.data.stand_key[2]) {
    //   if (this.data.status) {
    //     this.setData({
    //       imgUrl: `../../images/devIcon_blue/${this.data.rcType}_0.png`,
    //       status: 0,
    //     })
    //   } else {
    //     this.setData({
    //       imgUrl: `../../images/devIcon_blue/${this.data.rcType}_1.png`,
    //       status: 1,
    //     })
    //   }
    // }
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
    if (options.tid == 23) {
      this.setData({
        stand_key: ['open', 'close', 'pause']
      })
    }
    this.setData({
      devId: options.deviceId,
      rcType: options.tid,
      imgUrl: `../../images/devIcon/${options.tid}.png`
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