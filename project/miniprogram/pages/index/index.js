// pages/index/index.js
const app = getApp();
Page({
  list: [],
  /**
   * 页面的初始数据
   */
  data: {
    d_list: [], // 设备列表
    s_list: [], // 场景列表
    w_list: [], // websocket中的设备列表
    w_obj: [], // websocket中的某个设备返回对象
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
          let list = res.data.data;
          if (res.data.data.length > 0) {
            console.warn('我是老二');
            let bothwayList = list.filter(item => item.rcType === 7);
            let rid_arr = bothwayList.map(item => {
              return item.rid
            })
            this.setData({
              d_list: list
            })
            app.globalData.devList = list;
            app.globalData.bothwayDevRidArr = JSON.stringify(rid_arr);
            console.log('rid_arr', rid_arr);
            // 建立websocket连接 如果没有双向通道的就不需要连接
            if (rid_arr.length > 0) {
              app.linkSocket();
              app.globalData.lockReconnect = 0
            } else {
              wx.closeSocket();
              app.globalData.lockReconnect = 1
            }
          } else {
            this.setData({
              d_list: list
            })
            wx.showToast({
              title: '请添加设备',
              image: '../../images/warn.png'
            })
          }
        } else {
          this.setData({
            d_list: []
          })
          console.log('的撒范德萨发士大夫', msg)
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
   * 获取场景列表
   */
  getSceneList: function () {
    wx.request({
      url: app.globalData.domain + '/wap/v1/deviceScene',
      header: {
        'appId': app.globalData.appId,
        'token': app.globalData.token,
        'signature': app.getSign(1),
        'timestamp': app.getSign(0)
      },
      data: {
        macs: app.globalData.macs 
      },
      success: res => {
        console.log('getSceneList', res);
        this.setData({
          s_list: res.data.data
        })
      },
      fail: err => {
        console.log(err);
      }
    })
  },
  watchBack: function (value) {
    console.log('index', value);
    if (JSON.parse(value).list) {
      JSON.parse(value).list.forEach(item => {
        this.mergeList(item)
      })
    } else {
      console.log(JSON.parse(value).data);
      this.setData({
        w_obj: JSON.parse(value).data
      })
      this.mergeList(JSON.parse(value).data);
    }
  },
  /**
   * 合并设备列表
   */
  mergeList: function (obj) {
    console.log('obj', obj);
    this.list = this.data.d_list.map(item => {
      if (item.rid == obj.rc_id) {
        item.state.power = obj.power;
        return item;
      } else {
        return item;
      }
    })
    this.setData({
      d_list: this.list
    })
    app.globalData.devList = this.list;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad-index')
    // this.getDevList();
    // this.getSceneList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('onReady-index')
    this.getDevList();
    this.getSceneList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow-index');
    app.initEventHandle(this.watchBack)
    this.setData({
      d_list: app.globalData.devList
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
    console.log('刷新了');
    this.getDevList();
    this.getSceneList();
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