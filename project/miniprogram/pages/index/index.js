// pages/index/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    d_list: [],
    s_list: [1,2,3]
  },
  /**
   * 获取设备列表
   */
  getDevList: function () {
    wx.request({
      url: app.globalData.domain + '/wap/v1/remotes', //仅为示例，并非真实的接口地址
      header: {
        'appId': app.globalData.appId,
        'token': app.globalData.token,
        'signature': app.getSign(1),
        'timeStamp': app.getSign(0)
      },
      data: {
        macs: app.globalData.macs
      },
      success: (res) => {
        console.log('getDevList', res);
        let code = res.data.errorCode;
        let msg = res.data.message;
        wx.stopPullDownRefresh();
        if (code === 0) {
          if (res.data.data.length > 0) {
            this.setData({
              d_list: res.data.data
            })
          } else {
            wx.showToast({
              title: '请添加设备',
              image: '../../images/warn.png'
            })
          }
        } else {
          wx.showToast({
            title: msg,
            image: '../../images/warn.png'
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getDevList();
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
    console.log('刷新了');
    this.getDevList()
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