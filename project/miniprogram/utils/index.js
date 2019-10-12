/**
 * 将选中时间变为hh:mm:ss
 */
export function changeSelectTime (timestamp, num) {
  const curTimestamp = Date.parse(new Date());
  let total_s = (timestamp - curTimestamp) / 1000;
  let hh = Math.floor(total_s / 3600);
  let mm = Math.floor((total_s % 3600) / 60);
  let ss = Math.floor(total_s % 60);
  if (num) {
    return add_zero(hh) + ':' + add_zero(mm) + ':' + add_zero(ss);
  } else {
    return [hh, mm];
  }
}

// 补零方法
export function add_zero (val) {
  if (val < 10) {
    return '0' + val
  } else {
    return val + ''
  }
}
/**
 * 将时间戳转变为想要的日期格式
 * @param timestamp 时间戳
 * @param num 1-“19700101” 0-“1月1日”
 * */
export function formatDate(timestamp, num) {
  // let lan = window.navigator.language.split('-')[0];
  let time = new Date(timestamp);
  let y = time.getFullYear();
  let m = time.getMonth() + 1;
  let d = time.getDate();
  if (num) {
    return y + '' + add_zero(m) + '' + add_zero(d);
  } else {
    return m + '月' + d + '日';
  }
}
/**
 * 获取周的盒子
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param cloudData 云端数据
 * @return weeksArr 输出数组
 */
export function getWeeks(startTime, endTime, cloudData) {
  let weeksArr = []; // 输出数组
  let weeksDate = []; // 盒子
  let dateArr = []; // 日期数组
  let dayTimestamp = 86400000; // 一天的毫秒数
  // 1.获取开始日期为星期几
  let startWeek = new Date(startTime).getDay() || 7;
  // 2.根据开始日期为星期几往后补充日期和周数，直到补到结束日期的周数
  for (let i = 1; i <= 1000; i++) {
    let timestamp = startTime - (startWeek - i) * dayTimestamp;
    dateArr.push(timestamp);
    if (i % 7 === 0) {
      let obj = {
        valArr: [0,0,0,0,0,0,0],
        date: '',
        dateArr: []
      };
      dateArr = dateArr.map(item => {
        return formatDate(item, 1);
      })
      obj.dateArr = dateArr;
      obj.date = changeDates(dateArr[0], dateArr[6]);
      weeksDate.push(obj);
      // 如果一旦补充的周包含了结束日期就跳出循环
      if (dateArr.includes(formatDate(endTime, 1))) break;
      // 初始化dateArr
      dateArr = [];
    }
  }
  // 3.融入云端数据
  let wk = ['周一','周二', '周三', '周四', '周五', '周六', '周日']
  weeksArr = weeksDate.map((item, j) => {
    cloudData.forEach((obj, j) => {
      let $d = formatDate(obj.createdAt, 1);
      if (item.dateArr.includes($d)) {
        let n = item.dateArr.indexOf($d);
        item.valArr[n] = twoPoint(obj.value);
      }
    })
    item.dateArr = item.dateArr.map((item2,i) => {
      return wk[i]
    })
    return item
  })
  return weeksArr;
}
/**
 * 月的盒子
 * 根据当前时间造出跨一年的月份数组对象
 */
export function getMonths (cloudData) {
  let monthDataList = [];
  let monthArr = [];
  // 1.获取当前年和月
  let date = new Date();
  let curYear = date.getFullYear();
  let curMonth = date.getMonth() + 1;

  // 2.从当前月开始，计算13个月中天数，做一个盒子
  let beforeYear = curYear - 1;
  let beforeMonth = curMonth;
  for (let i = beforeMonth; i <= beforeMonth + 12; i++) {
    let obj = {
      valArr: [],
      month: '',
      dateArr: []
    }
    if (i <= 12) {
      obj.month = beforeYear + '/' + add_zero(i)
      obj.dateArr = getMonthDateArrAndValueArr(beforeYear, i, 1);
      obj.valArr = getMonthDateArrAndValueArr(beforeYear, i, 0);
    } else {
      obj.month = curYear + '/' + add_zero(i - 12)
      obj.dateArr = getMonthDateArrAndValueArr(curYear, i - 12, 1);
      obj.valArr = getMonthDateArrAndValueArr(curYear, i - 12, 0);
    }
    monthArr.push(obj);
  }

  // 3. 将真实数据放入盒子中
  monthDataList = monthArr.map((item, i) => {
    cloudData.forEach((obj, j) => {
      let $d = formatDate(obj.createdAt, 1);
      if (item.dateArr.includes($d)) {
        let n = item.dateArr.indexOf($d);
        item.valArr[n] = twoPoint(obj.value);
      }
    })
    item.dateArr = item.dateArr.map(item2 => {
      return getMonthAndDay(item2);
    })
    return item;
  })
  return monthDataList;
}

/**
 * 年的盒子
 */
export function getYears (cloudData) {
  let yearDataList = [];
  let yearBoxList = [];
  let date = new Date();
  let curYear = date.getFullYear();
  // let curMonth = date.getMonth() + 1 + '月'
  let $Mons = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  for (let i = 0; i <= 1; i++) {
    let obj = {
      valArr: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      monthArr: $Mons,
      year: `${curYear - i}/1~12`
    };
    yearBoxList.unshift(obj);
  }

  yearDataList = yearBoxList.map(item_1 => {
    item_1.monthArr.forEach((item_2,i) => {
      let arr = cloudData.filter(item_3 => formatDate(item_3.createdAt, 1).includes(getOriginalDateTime(item_1.year, i + 1)));
      if (arr.length > 0) {
        let sumArr = arr.map(item_4 => {
          return item_4.value
        })
        item_1.valArr[i] = sum_arr(sumArr);
      }
    })
    return item_1;
  })
  return yearDataList;
}

/**
 * 数组求和
 */
export function sum_arr (arr) {
  let sum = 0;
  arr.forEach(item => {
    sum+=+item
  })
  return twoPoint(sum);
}
/**
 * 数字保留2位小数点
 */
export function twoPoint (val) {
  let newVal = Math.round(val * 100) / 100;
  return newVal;
}
/**
 * 将日期切换为197001格式
 * */
export function getOriginalDateTime(date, month) {
  return date.slice(0, 4) + add_zero(month);
}

/** 日期1970101 转化为 1970年01月01日 **/
export function changeDates(startValue, endValue) {
  // let lan = window.navigator.language.split('-')[0];
  let startYear = startValue.slice(0, 4);
  let startMonth = startValue.slice(4, 6) * 1;
  let startDay = startValue.slice(6, 8) * 1;

  let endYear = endValue.slice(0, 4);
  let endMonth = endValue.slice(4, 6) * 1;
  let endDay = endValue.slice(6, 8) * 1;
  if (startYear === endYear) {
    return `${startYear}/${startMonth}/${startDay}~${endMonth}/${endDay}`;
  } else {
    return `${startYear}/${startMonth}/${startDay}~${endYear}/${endMonth}/${endDay}`;
  }
}
/**
 * 根据年和月得到一个月内有多少个天？
 * @param year
 * @param month
 * @param n 0-表示获取值数组，1-表示获取日期数组
 * @return Array
 * */
export function getMonthDateArrAndValueArr(year, month, n) {
  let months = isRunYear(year)
    ? [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let days = months[month - 1];
  let arr = [];
  for (let i = 1; i <= days; i++) {
    let str;
    if (n) {
      str = year + '' + add_zero(month) + '' + add_zero(i);
    } else {
      str = 0;
    }
    arr.push(str);
  }
  return arr;
}

/** 判断年份是否闰年 **/
export function isRunYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
/** 将19700101 转化为1月1日 **/
export function getMonthAndDay(value) {
  let month = value.slice(4, 6) * 1;
  let day = value.slice(6, 8) * 1;
  return `${month}/${day}`;
}
/** 计算当前时间占当天的多少秒 **/
export function calcCurrentTime() {
  let nowTime = new Date(); // 当前时间
  let hours = nowTime.getHours(); // 获取当前时间h
  let minutes = nowTime.getMinutes(); // 获取当前时间m
  let seconds = nowTime.getSeconds(); // 获取当前m
  return hours * 3600 + minutes * 60 + seconds; // 计算当前时间总和单位: 秒
}