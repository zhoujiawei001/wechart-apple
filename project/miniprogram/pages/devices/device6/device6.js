// pages/devices/device6/device6.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: '../../images/devIcon/6.png',
    devId: '', // 设备Id
    rcType: '', // 设备类型
    funs: {}, // 功能全集
    keys: []
  },
  /**下发命令 */
  sendCode: function (e) {
    console.log(e.target.dataset.key);
    let code = e.target.dataset.key;
    app.sendCode(this.data.devId, code, this.data.rcType)
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
      console.log('风扇的详情', res);
      let $funs = res.functions;
      let $funs_arr = [];
      for (let key in $funs) {
        $funs_arr.push($funs[key])
      }

      this.setData({
        funs: $funs,
        keys: $funs_arr.filter(item => item.value !== 'power')
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