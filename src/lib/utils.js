export function formatNum(num, decimal) {
  let x = (`${num}`).length;
  if (Number.isInteger(num) && x > 3) {
    const pow = 10 ** decimal;
    x -= x % 3;
    return Math.round(num * pow / (10 ** x)) / pow + ' kMGTPE'[x / 3];
  }
  return num;
}

export function getLastIndex(arr, item) {
  const indices = [];

  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] === item) { indices.push(i); }
  }
  return indices[indices.length - 1];
}


export function groupBy(collection, property) {
  var i = 0, val, index,
    values = [], result = [];
  for (; i < collection.length; i++) {
    val = collection[i][property];
    index = values.indexOf(val);
    if (index > -1)
      result[index].push(collection[i]);
    else {
      values.push(val);
      result.push([collection[i]]);
    }
  }
  return result;
}

export const isNewSeriesData = (oldArr, newArr) => {
  // check for different numbers of objects
  if (oldArr.length !== newArr.length) return true;
  let i = 0;
  let k = 0;
  let keys = [];
  // loop through all objects
  for (i; i < oldArr.length; i += 1) {
    // define keys of old object
    keys = Object.keys(oldArr[0]);
    // check for different number of keys
    if (keys.length !== Object.keys(newArr[0]).length) return true;
    // loop through all keys of object
    for (k; k < keys.length; k += 1) {
      // check for presence of key on new obj
      if (typeof newArr[i][keys[k]] === 'undefined') return true;
      // check for different key/values
      if (oldArr[i][keys[k]] !== newArr[i][keys[k]]) return true;
    }
    // reset key iterator
    k = 0;
  }
  return false;
};

export const hexToRgbA = (hex, alpha) => {
  let c;
  const a = alpha || alpha === 0 ? alpha : 1;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = [[c[0], c[1]].join(''), [c[2], c[3]].join(''), [c[4], c[5]].join('')];
    return `rgba(${parseInt(c[0], 16)}, ${parseInt(c[1], 16)}, ${parseInt(c[2], 16)}, ${a})`;
  }
  throw new Error('Bad Hex');
};

export const debounce = (func, wait, now) => {
  let timeout;
  return function deb(...args) {
    const context = this;
    const later = () => {
      timeout = null;
      if (!now) func.apply(context, args);
    };
    const callNow = now && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};