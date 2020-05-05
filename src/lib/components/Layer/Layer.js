import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Actions, prepareLayer, lngLat } from 'gisida';
import { QUERY_PARAM_LAYERS } from '../../constants';
import { pushSearchParamsToURL, getURLSearchParams } from '../../utils';

const mapStateToProps = (state, ownProps) => {
  const { APP, LOC } = state;
  const MAP = state[ownProps.mapId];
  if (!!!MAP) {
    throw 'MAP not found';
  }
  return {
    APP,
    LOC,
    timeSeriesObj: MAP.timeseries[MAP.visibleLayerId],
    timeseries: MAP.timeseries,
    layers: MAP.layers,
    primaryLayer: MAP.primaryLayer,
    activeLayerIds: MAP.activeLayerIds,
  };
};

export class Layer extends Component {
  onLayerToggle = (layer, e, pushLayerToURL) => {
    // dispatch toggle layer action
    const { mapId, APP, LOC } = this.props;
    if (!mapId) {
      return null;
    }
    pushLayerToURL(layer);
    this.props.dispatch(Actions.toggleLayer(mapId, layer.id));
    const { center, zoom } = lngLat(LOC, APP);
    if (layer.zoomOnToggle && layer.visible) {
      window.maps.forEach(e => {
        e.easeTo({
          center,
          zoom,
        });
      });
    }
    // Prepare layer if layer had not been loaded
    if (!layer.loaded && !layer.isLoading) {
      prepareLayer(mapId, layer, this.props.dispatch);
    }
  };

  /**
   * Push layer to URL which can be used for sharing
   * @param {*} layer
   */
  pushLayerToURL = layer => {
    const { mapId } = this.props;
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

  render() {
    const layer = this.props.layer;
    const mapId = this.props.mapId;
    if (!mapId) {
      return null;
    }
    return (
      <li className="layer" title={layer['menu-credit'] ? `Credit: ${layer['menu-credit']}` : ''}>
        <input
          id={`${layer.id}-${mapId}`}
          type="checkbox"
          data-layer={layer.id}
          onChange={e => this.onLayerToggle(layer, e, this.pushLayerToURL)}
          checked={!!layer.visible}
        />
        <label htmlFor={`${layer.id}-${mapId}`}>{layer.label}</label>
      </li>
    );
  }
}

Layer.propTypes = {
  layer: PropTypes.objectOf(PropTypes.any).isRequired,
  mapId: PropTypes.string,
};

export default connect(mapStateToProps)(Layer);
