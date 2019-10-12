// pages/chart/chart.js
import * as echarts from '../../ec-canvas/echarts.js'
import { formatDate, getWeeks, getMonths, getYears, sum_arr } from '../../utils/index.js'
const app = getApp();

let myChart = null;
function initChart (canvas, width, height) {
  myChart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(myChart);
  myChart.showLoading(); // 首次显示加载动画
  // 数据层
  var dataAxis = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  var data = [0,0,0,0,0,0,0,0,0,0,0,0];
  var yMax = 500;
  var dataShadow = [];

  let option = {
    title: {
      text: '单位/度',
      textStyle: {
        fontSize: 12
      },
      subtext: '2019/8/5~8/11',
      left: '8%'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        type: 'line',        // 默认为直线，可选为：'line' | 'shadow'
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    xAxis: {
      data: dataAxis,
      axisLabel: {
        textStyle: {
          color: '#999'
        }
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      }
    },
    yAxis: {
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        textStyle: {
          color: '#999'
        }
      }
    },
    dataZoom: [
      {
        type: 'inside',
        disabled: true,
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        type: 'bar',
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ]
            )
          },
          emphasis: {
            color: new echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ]
            )
          }
        },
        barCategoryGap: '50%',
        data: data
      }
    ]
  }
  myChart.setOption(option);
  myChart.hideLoading(); // 隐藏加载动画
  return myChart;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ecLine: {
      onInit: initChart
    },
    list: ['周', '月', '年'],
    selectIdx: 0,
    dataList: [],
    curIdx: 0, // 当前展示的数据位置
    weeksDataList: [], // 周的数据列表
    monthDataList: [], // 月的数据列表
    yearDataList: [], // 年的数据列表
    isHidden: true, // 暂无数据 显示隐藏
    mac: '' // 设备mac地址
  }, 
  /**
   * 点击周月年
   */
  handleItem: function (e) {
    let $n = e.target.dataset.idx;
    this.setData({
      selectIdx: e.target.dataset.idx
    })
    if ($n === 0) {
      this.setData({
        curIdx: this.data.weeksDataList.length - 1
      })
      this.renderCharts(this.data.weeksDataList.length - 1, 'week');
    } else if ($n === 1) {
      this.setData({
        curIdx: this.data.monthDataList.length - 1
      })
      this.renderCharts(this.data.monthDataList.length - 1, 'month');
    } else {
      this.setData({
        curIdx: this.data.yearDataList.length - 1
      })
      this.renderCharts(this.data.yearDataList.length - 1, 'year')
    }
  },
  /**
   * 获取电量统计近一年的数据
   */
  getTotalDataNearYear (unit) {
    wx.request({
      url: app.globalData.domain + '/wap/v1/powerQuery',
      data: {
        mac: this.data.mac,
        unit: unit,
        timeBegin: this.getTimeStamp(1),
        timeEnd: this.getTimeStamp(0)
      },
      header: {
        'appId': app.globalData.appId,
        'token': app.globalData.token,
        'signature': app.getSign(1),
        'timeStamp': app.getSign(0)
      },
      success: res => {
        console.log(res.data);
        let $code = res.data.errorCode;
        if ($code === 0) {
          let $arr = res.data.data;
          if ($arr.length > 0) {
            this.setData({
              dataList: $arr,
              weeksDataList: getWeeks($arr[0].createdAt, $arr[$arr.length - 1].createdAt, $arr),
              monthDataList: getMonths($arr),
              yearDataList: getYears($arr),
              curIdx: getWeeks($arr[0].createdAt, $arr[$arr.length - 1].createdAt, $arr).length - 1
            })
          } else {
            let $l = [
              {
                value: 0,
                createdAt: Date.parse(new Date())
              }
            ]
            this.setData({
              dataList: $l,
              weeksDataList: getWeeks($l[0].createdAt, $l[$l.length - 1].createdAt, $l),
              monthDataList: getMonths($l),
              yearDataList: getYears($l),
              curIdx: getWeeks($l[0].createdAt, $l[$l.length - 1].createdAt, $l).length - 1
            })
          }
          setTimeout(() => {
            this.renderCharts(this.data.curIdx, 'week');
          }, 300);
        }
      },
      fail: err => {
        console.log(err);
      }
    })
  },
  /**
   * 获取当前和1年前的时间戳
   */
  getTimeStamp: function (val) {
    let curTime = Date.parse(new Date());
    let date = new Date();
    if (val) {
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      let d = date.getDate();
      let h = date.getHours();
      let min = date.getMinutes();
      let s = date.getSeconds();
      let oldTime = `${y - 1}/${m}/${d} ${h}:${min}:${s}`;
      console.log('oldTime', Date.parse(new Date(oldTime)) / 1000);
      return Date.parse(new Date(oldTime)) / 1000
    } else {
      console.log('curTime', curTime / 1000);
      return curTime / 1000;
    }
  },
  /**
   * 模拟数据
    */
  modelData: function () {
    let $arr = [];
    for(let i = 0; i < 156; i++) {
      let obj = {
        tag: i + 1,
        value: Math.round(Math.random() * 10),
        createdAt: Date.parse(new Date()) - i * 86400000
      }
      $arr.unshift(obj);
    }
    this.setData({
      dataList: $arr,
      weeksDataList: getWeeks($arr[0].createdAt, $arr[$arr.length - 1].createdAt, $arr),
      monthDataList: getMonths($arr),
      yearDataList: getYears($arr),
      curIdx: getWeeks($arr[0].createdAt, $arr[$arr.length - 1].createdAt, $arr).length - 1
    })
    setTimeout(() => {
      this.renderCharts(this.data.curIdx, 'week');
    }, 300);
  },
  /**
   * 渲染图表
   */
  renderCharts: function (num, type) {
    let list, dataAxis, data, subTime;
    if (type === 'week') {
      list = this.data.weeksDataList;
      // 获取X坐标值
      dataAxis = list[0].dateArr;
      // 获取的头部时间段
      subTime = list[num].date;
    } else if (type === 'month') {
      list = this.data.monthDataList;
      // 获取X坐标值
      dataAxis = list[num].dateArr;
      // 获取的头部时间段
      subTime = list[num].month;
    } else {
      list = this.data.yearDataList;
      // 获取X坐标值
      dataAxis = list[num].monthArr;
      // 获取的头部时间段
      subTime = list[num].year;
    }
    // 获取电量值
    data = list[num].valArr;
    // '暂无数据'的显示隐藏
    this.setData({
      isHidden: sum_arr(data) <= 0? false:true
    })
    // 重新渲染图表
    myChart.setOption({
      title: {
        subtext: subTime
      },
      xAxis: {
        data: dataAxis
      },
      series: [
        {
          data: data
        }
      ]
    })
  },
  /**
   * 上一周/下一周
   */
  prev: function () {
    if (this.data.curIdx === 0) return;
    let num = this.data.curIdx - 1
    this.setData({
      curIdx: num
    })
    if (this.data.selectIdx === 0) {
      this.renderCharts(this.data.curIdx, 'week');
    } else if (this.data.selectIdx === 1) {
      this.renderCharts(this.data.curIdx, 'month');
    } else {
      this.renderCharts(this.data.curIdx, 'year');
    }
  },
  next: function () {
    if (this.data.selectIdx === 0) {
      let $len = this.data.weeksDataList.length - 1;
      if (this.data.curIdx >= $len) return;
      let num = this.data.curIdx + 1;
      this.setData({
        curIdx: num
      })
      this.renderCharts(this.data.curIdx, 'week');
    } else if (this.data.selectIdx === 1) {
      let $len = this.data.monthDataList.length - 1;
      if (this.data.curIdx >= $len) return;
      let num = this.data.curIdx + 1;
      this.setData({
        curIdx: num
      })
      this.renderCharts(this.data.curIdx, 'month');
    } else {
      let $len = this.data.yearDataList.length - 1;
      if (this.data.curIdx >= $len) return;
      let num = this.data.curIdx + 1;
      this.setData({
        curIdx: num
      })
      this.renderCharts(this.data.curIdx, 'year');
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      mac: options.mac
    })
    this.getTotalDataNearYear('day');
    // this.modelData();
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