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

export function detectIE() {
  var ua = window.navigator.userAgent;

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return true
    return true;
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return true
    return true;
  }
  // other browser
  return false;
}

export function catchZeroCountClicks(e) {
  if (e.currentTarget && e.currentTarget.dataset && !Number(e.currentTarget.dataset.count)) {
    e.preventDefault();
    e.stopPropagation();
  }
}

export function isFiltered(options, isOriginal) {
    const optionKeys = Object.keys(options);
    let hasEnabled = false;
    let hasDisabled = false;
    let i;

    // if original check for BOTH enabled and disabled options
    if (isOriginal || typeof isOriginal === 'undefined') {
      for (i = 0; i < optionKeys.length; i += 1) {
        if (options[optionKeys[i]].count && options[optionKeys[i]].enabled) {
          hasEnabled = true;
        } else if (options[optionKeys[i]].count) {
          hasDisabled = true;
        }
      }
      return hasEnabled && hasDisabled;
    }

    // if filtered check for a single enabled option
    for (i = 0; i < optionKeys.length; i += 1) {
      if (options[optionKeys[i]].enabled) return true;
    }
    return false;
  }
