import { pushSearchParamsToURL, getURLSearchParams } from '../../utils';
import { QUERY_PARAM_STYLE } from '../../constants';

/**
 * Push style to URL by pushing its index
 * @param {*} styles
 * @param {*} style
 * @param {*} mapId
 */
export function pushStyleToURL(styles, style, mapId) {
  const urlSearchParams = getURLSearchParams();
  const index = styles.map(styleItem => styleItem.url).indexOf(style.url);

  if (index >= 0) {
    urlSearchParams.set(`${mapId}-${QUERY_PARAM_STYLE}`, index);
    pushSearchParamsToURL(urlSearchParams);
  }
}
