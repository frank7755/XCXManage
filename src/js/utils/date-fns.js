/**
 * @see https://blog.csdn.net/RuanXiaoYu/article/details/81330775
 */

import moment from 'moment';

/**
 * @function getToday
 * @description 获取今天的开始结束时间
 */
export function getToday() {
  return [moment().startOf('day'), moment().endOf('day')];
}

/**
 * @function getYesterday
 * @description 获取昨天的开始结束时间
 */
export function getYesterday() {
  return [
    moment()
      .subtract(1, 'days')
      .startOf('day'),
    moment()
      .subtract(1, 'days')
      .endOf('day')
  ];
}

/**
 * @function getLast7Days
 * @description 获取最近七天的开始结束时间
 */
export function getLast7Days() {
  return [
    moment()
      .subtract(7, 'days')
      .startOf('day'),
    moment().endOf('day')
  ];
}

/**
 * @function getLast30Days
 * @description 获取最近30天的开始结束时间
 */
export function getLast30Days() {
  return [
    moment()
      .subtract(30, 'days')
      .startOf('day'),
    moment().endOf('day')
  ];
}

/**
 * @function getCurrWeek
 * @description 获取本周的开始结束时间
 */
export function getCurrWeek() {
  return [moment().startOf('week'), moment().endOf('week')];
}

/**
 * @function getLastWeek
 * @description 获取上周的开始结束时间
 */
export function getLastWeek() {
  return [
    moment()
      .subtract(1, 'weeks')
      .startOf('week'),
    moment()
      .subtract(1, 'weeks')
      .endOf('week')
  ];
}

/**
 * @function getCurrMonth
 * @description 获取本月的开始结束时间
 */
export function getCurrMonth() {
  return [moment().startOf('month'), moment().endOf('month')];
}

/**
 * @function getLastMonth
 * @description 获取上月的开始结束时间
 */
export function getLastMonth() {
  return [
    moment()
      .subtract(1, 'months')
      .startOf('month'),
    moment()
      .subtract(1, 'months')
      .endOf('month')
  ];
}

/**
 * @function getDatePickerValue
 * @param {Moment} date
 * @param {string} format
 */
export function getDatePickerValue(date, format) {
  if (moment.isMoment(date)) {
    return date.format(format);
  }
}
