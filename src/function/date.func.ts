import moment from "moment";

export const timeago = (dateTimeStamp?: number | string) => {
  const minute = 1000 * 60; // 把分，时，天，周，半个月，一个月用毫秒表示
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const halfamonth = day * 15;
  const month = day * 30;
  const now = new Date().getTime(); // 获取当前时间毫秒
  const diffValue =
    now - (dateTimeStamp ? new Date(dateTimeStamp).getTime() : 0); // 时间差
  let result = "";
  if (diffValue < 0) {
    return;
  }
  const minC = diffValue / minute; // 计算时间差的分，时，天，周，月
  const hourC = diffValue / hour;
  const dayC = diffValue / day;
  const weekC = diffValue / week;
  const monthC = diffValue / month;
  // if(monthC >= 1 && monthC <= 3){
  //     result = " " + parseInt(monthC) + "月前"
  // }else if(weekC >= 1 && weekC <= 3){
  //     result = " " + parseInt(weekC) + "周前"
  if (dayC >= 1 && dayC < 7) {
    result = ` ${  parseInt(dayC.toString())  }天前`;
  } else if (hourC >= 1 && hourC < 24) {
    result = ` ${  parseInt(hourC.toString())  }小时前`;
  } else if (minC >= 1 && minC < 60) {
    result = ` ${  parseInt(minC.toString())  }分钟前`;
  } else if (diffValue >= 0 && diffValue <= minute) {
    result = "刚刚";
  } else {
    result = defaultDateTimeFromString(dateTimeStamp as any);
  }
  return result;
};

export function defaultDateTimeFromString(dateTimeString?: string) {
  if (!dateTimeString) return "-";
  return moment(dateTimeString).utcOffset(8).format("YYYY/MM/DD HH:mm");
}
