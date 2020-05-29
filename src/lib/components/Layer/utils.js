import { QUERY_PARAM_LAYERS } from '../../constants';
import { pushSearchParamsToURL, getURLSearchParams } from '../../utils';

/**
 * Push layer to URL which can be used for sharing
 * @param {*} layer
 */
export const pushLayerToURL = (layer, mapId) => {
  const layerId = layer.id.replace('.json', '');
  const queryParamLayers = `${mapId}-${QUERY_PARAM_LAYERS}`;
  const urlSearchParams = getURLSearchParams();
  /**
   * Check for visibility. If false it means layer has been selected push to layer id to url
   * else if visible it means layer has been checked off pop layer from url
   */
  if (layer && layer.visible === false) {
    if (urlSearchParams.has(queryParamLayers)) {
      /**
       * If query param is in URL, append the layer id
       */
      urlSearchParams.append(queryParamLayers, layerId);
    } else {
      /**
       * If query param is not in URL, set the value as the first
       * value of the query param
       */
      urlSearchParams.set(queryParamLayers, layerId);
    }
  } else if (layer && layer.visible === true) {
    if (urlSearchParams.has(queryParamLayers)) {
      /**
       * We filter out the layer and reset the query param
       * with the remainder
       */
      const remainingLayers = urlSearchParams.getAll(queryParamLayers).filter(l => l !== layerId);
      urlSearchParams.delete(queryParamLayers);
      remainingLayers.forEach(val => {
        urlSearchParams.append(queryParamLayers, val);
      });
    }
  }

  pushSearchParamsToURL(urlSearchParams);
};
