const hours = []
const min = []

for (let i = 0; i <= 23; i++) {
  hours.push(i)
}

for (let i = 0; i <= 59; i++) {
  min.push(i)
}
import { calcCurrentTime } from '../../utils/index.js'
Component({
  lifetimes: {
    attached: function () {
      console.log(1233232)
      this.setData({
        closeTxt: this.calcCloseAir(this.data.propValue[0], this.data.propValue[1]),
        value: this.data.propValue
      })
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {
    propValue: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    hours: hours,
    min: min,
    value: [0, 0],
    aniStyle: true, //动画效果，默认slideup
    closeTxt: '' // 关闭时间
  },
  /**
   * 组件的方法列表
   */
  methods: {
    bindChange: function (e) {
      const val = e.detail.value
      this.setData({
        value: val
      })
      this.setData({
        closeTxt: this.calcCloseAir(val[0], val[1])
      })
    },
    doNoThing: function (e) {
      // console.log(e);
    },
    /**
     * 关闭弹出框
     */
    cancel: function () {
      this.setData({
        aniStyle: false
      })
      setTimeout(() => {
        this.triggerEvent('closeBox');
        this.setData({
          aniStyle: true
        })
      },100);
    },
    /**
     * 确定开启倒计时
     */
    sure: function () {
      this.triggerEvent('openDelay', this.data.value);
    },
    /**
   * 空调将在XXXX关闭
   * 根据小时和分钟计算空调将在几点关闭
   */
    calcCloseAir: function (h, m) {
      let $t, $h, $m; // 当前所占一天的秒 + 延时的秒
      let $s = calcCurrentTime(); // 当前时间所占一天的秒
      let $b = h * 3600 + m * 60; // 延时多少秒关机
      if (($s + $b) <= 24 * 3600) { // 今天
        $t = $s + $b;
        $h = Math.floor($t / 3600);
        $m = Math.floor(($t % 3600) / 60);
        if ($h < 10) {
          $h = '0' + $h;
        }
        if ($m < 10) {
          $m = '0' + $m;
        }
        return `今天${$h}:${$m}`;
      } else { // 明天
        $t = ($s + $b) - 24 * 3600;
        $h = Math.floor($t / 3600);
        $m = Math.floor(($t % 3600) / 60);
        if ($h < 10) {
          $h = '0' + $h;
        }
        if ($m < 10) {
          $m = '0' + $m;
        }
        return `明天${$h}:${$m}`;
      }
    },
  }
})
