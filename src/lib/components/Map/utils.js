import { pushSearchParamsToURL, getURLSearchParams, getSharedStyleFromURL } from '../../utils';
import { QUERY_PARAM_STYLE } from '../../constants';
/**
 * Set the map style
 * @param {*} styles
 * @param {*} prevStyle
 * @param {*} currentStyle
 * @param {*} mapId
 */
export function setStyle(styles, prevStyle, currentStyle, mapId, map) {
  const sharedStyle = getSharedStyleFromURL(mapId);
  let styleFound = false;
  let i = 0;

  while (!styleFound && i < styles.length) {
    const style = styles[i];

    if (styles.map(styleItem => styleItem.url).indexOf(style.url) === sharedStyle) {
      // Load the style from  URL
      map.setStyle(style.url);
      styleFound = true;
    } else {
      if (style[mapId] && style[mapId].current && prevStyle !== currentStyle) {
        // Style has changed, set the style and set the new value in URL
        pushStyleToURL(styles, style, mapId);
        map.setStyle(style.url);
        styleFound = true;
      }
    }

    i++;
  }
}

/**
 * Push style to URL by pushing its index
 * @param {*} styles
 * @param {*} style
 * @param {*} mapId
 */
export function pushStyleToURL(styles, style, mapId) {
  const urlSearchParams = getURLSearchParams();
  urlSearchParams.set(
    `${mapId}-${QUERY_PARAM_STYLE}`,
    styles.map(styleItem => styleItem.url).indexOf(style.url)
  );
  pushSearchParamsToURL(urlSearchParams);
}
