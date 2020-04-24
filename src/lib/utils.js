import { QUERY_PARAM_LAYERS } from './constants';

export function formatNum(num, decimal) {
  let x = `${num}`.length;
  if (Number.isInteger(num) && x > 3) {
    const pow = 10 ** decimal;
    x -= x % 3;
    return Math.round((num * pow) / 10 ** x) / pow + ' kMGTPE'[x / 3];
  }
  return num;
}

export function getLastIndex(arr, item) {
  const indices = [];

  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] === item) {
      indices.push(i);
    }
  }
  return indices[indices.length - 1];
}

export function groupBy(collection, property) {
  var i = 0,
    val,
    index,
    values = [],
    result = [];
  for (; i < collection.length; i++) {
    val = collection[i][property];
    index = values.indexOf(val);
    if (index > -1) result[index].push(collection[i]);
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

export function buildLayersObj(layers) {
  const urlPrimaryLayer =
    window.location.href.split('&') &&
    window.location.href.split('&')[1] &&
    window.location.href.split('&')[1].split('=')[1];
  const layersObj = [];
  let layerObj;
  Object.keys(layers).forEach(key => {
    const layer = { ...layers[key] };
    if (layer.visible) {
      layerObj = layer;
      layersObj.push(layerObj);
    }
  });

  /** Move primary layer to the end of the array */
  // if (!(layersObj[layersObj.length - 1] && layersObj[layersObj.length - 1].id.includes(urlPrimaryLayer))) {
  //     const indexOfPrimaryLayer = layersObj.findIndex(layer => layer.id.includes(urlPrimaryLayer));
  //     if (indexOfPrimaryLayer !== -1) {
  //         var temp = layersObj[indexOfPrimaryLayer];
  //         layersObj[indexOfPrimaryLayer] = layersObj[layersObj.length - 1];
  //         layersObj[layersObj.length - 1] = temp;
  //     }
  // }

  return layersObj;
}

export const parseColValue = (datum, col) => {
  let val;
  if (datum[col] && Number.isNaN(Number(datum[col]))) {
    val = Number(datum[col].split(',').join(''));
  } else if (typeof datum[col] === 'undefined') {
    val = 0;
  } else {
    val = Number(datum[col]);
  }
  return val;
};

export function deepCopy(x) {
  return JSON.parse(JSON.stringify(x));
}

export function orderLayers(activeLayersData, map, nextLayerId) {
  /**
   * Rearranges rendered layers and puts selected layer on top.
   * @param {Object} filteredLayers - Mapbox layers
   */
  const moveLayers = filteredLayers => {
    Object.keys(filteredLayers).forEach(key => {
      if (map.getLayer(filteredLayers[key].id)) {
        map.moveLayer(filteredLayers[key].id);
      }
    });
    if (filteredLayers.find(d => d.id === nextLayerId) && map.getLayer(nextLayerId)) {
      map.moveLayer(nextLayerId);
    }
  };

  const fills = activeLayersData.filter(d => d['type'] === 'fill' && !d['detail-view']);
  if (fills.length) {
    moveLayers(fills);
  }

  const lines = activeLayersData.filter(d => d['type'] === 'line');
  if (lines.length) {
    moveLayers(lines);
  }

  const circles = activeLayersData.filter(d => d['type'] === 'circle');
  if (circles.length) {
    moveLayers(circle);
  }

  const symbols = activeLayersData.filter(d => d['type'] === 'symbol');
  if (symbols.length) {
    moveLayers(symbols);
  }

  const detailViewActive = activeLayersData.filter(d => d['detail-view'] && !d['level-view']);
  if (detailViewActive.length) {
    moveLayers(detailViewActive);
  }

  const isLabelActive = activeLayersData.filter(d => d.isLabel);
  if (isLabelActive.length) {
    moveLayers(isLabelActive);
  }
}

/**
 * Get all visible layer Ids of a menu group
 * @param {*} groupName Name of the group which we want to target
 * @param {*} children Children of the group which we want to target
 */
export function getMenuGroupVisibleLayers(groupName, children) {
  const subGroups = children.filter(child => !child.id);

  if (subGroups.length) {
    let visibleLayerIds = [];

    subGroups.forEach(sg => {
      Object.keys(sg).forEach(key => {
        const subGroupVisibleLayerIds = getMenuGroupVisibleLayers(groupName, sg[key].layers);
        visibleLayerIds = [...visibleLayerIds, ...subGroupVisibleLayerIds];
      });
    });

    // Return all visible layer Id of the nested subgroups
    return visibleLayerIds;
  } else {
    // Return the Ids of visible layers for the group
    return children.filter(child => child.visible).map(child => child.id);
  }
}

/**
 * Get shared layers from URL
 * @param {*} mapId mapId for map to get shared layers for
 * @returns {Array} layers from URL for the given map id
 */
export function getSharedLayersFromURL(mapId) {
  const queryParams = window.location.href.split('?');

  if (!queryParams[1]) {
    return [];
  }
  let sharedLayers = [];

  try {
    const queryParamLayers = queryParams[1].split('&');
    const mapQueryParamLayers = queryParamLayers.filter(item =>
      item.includes(`${mapId}-${QUERY_PARAM_LAYERS}`)
    )[0];

    if (mapQueryParamLayers) {
      sharedLayers = mapQueryParamLayers.split('=')[1].split(',');
    }
  } catch (error) {
    sharedLayers = [];
  }

  return sharedLayers;
}
