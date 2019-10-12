// components/fadeUp/fadeUp.js
Component({
  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function () {
      console.log('2134')
      // 在组件实例进入页面节点树时执行
      let e_arr = []
      let $arr = this.data.boxList.map((item, index) => {
        return index;
      })
      let s_arr = this.data.supportList;
      for (let i = 0; i < $arr.length; i++) {
        if (s_arr.includes(i)) {
          e_arr.push($arr[i]);
        } else {
          e_arr.push('');
        }
      }
      this.setData({
        modeList: e_arr
      })
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {
    propType: {
      type: String,
      value: 'mode'
    },
    boxList: {
      type: Array,
      value: []
    },
    supportList: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    aniStyle: true, //动画效果，默认slideup
    modeList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //蒙层的显示
    close: function (e) {
      this.setData({
        aniStyle: false
      })
      setTimeout(() => {
        this.triggerEvent('closebox', false);
        this.setData({
          aniStyle: true
        })
      }, 100);
    },
    /**
     * 选中选项
     */
    handleItem: function (e) {
      this.triggerEvent('selectedItem', this.data.propType + '-' + e.target.dataset.id);
      this.close();
    }
  }
})
