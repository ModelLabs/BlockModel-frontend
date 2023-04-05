// 保留输入 number 的小数点后 4 位
export function StandardNum(num) {
    return Number(Math.floor(Number(num) * 10000) / 10000);
}

export function NonNegative(num) {
    return num < 0.0 ? 0.0 : num;
}

export function percentageToNumber(percent) {
    let str = Number(percent.replace("%", ""));
    return Number(str / 100);
}

export function checkSumObj(obj) {
    let sum = 0;
    for (var val in obj) {
      let num = Number(obj[val].replace("%", ""));
      sum = sum + num;
    }
    return (sum == 100);
}

export function checkSumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    let num = Number(arr[i].replace("%", ""));
    sum = sum + num;
  }
  return (sum == 100);
}

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}