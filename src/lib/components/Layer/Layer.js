import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Actions, prepareLayer, lngLat } from 'gisida';
import { QUERY_PARAM_LAYERS } from '../../constants';

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
 pushLayerToURL = (layer) => {
    const { mapId } = this.props;
    const layerId = layer.id.replace('.json', '');
    const queryParamLayers = `${mapId}-${QUERY_PARAM_LAYERS}`;
    let pageURL = `${window.location.href}`;

    /**
     * Check for visibility. If false it means layer has been selected push to layer id to url
     * else if visible it means layer has been checked off pop layer from url
     */
    if (layer && layer.visible === false) {
      if (
        !window.location.href.includes(`?${queryParamLayers}=`) &&
        !window.location.href.includes(`&${queryParamLayers}=`)
      ) {
        /**
         * Query param `layers` does not exist. Have the layerId as the first
         * value of query param `layers`. The assumption made is that
         * there exists no other query params
         */
        if (pageURL.includes('?style')) {
          pageURL = pageURL.split('?style')[0]; 
        }
        if (queryParamLayers.includes('map-2')) {
          if (pageURL.includes('map-1')) {
            pageURL = `${pageURL}&${queryParamLayers}=${layerId}`;
          } else {
            pageURL = `${pageURL}?${queryParamLayers}=${layerId}`;
          }
        } else {
          if (pageURL.includes('map-2')) {
            pageURL = `${pageURL}&${queryParamLayers}=${layerId}`;
          } else {
            pageURL = `${pageURL}?${queryParamLayers}=${layerId}`;
          }
        }
        if(window.location.href.includes('style')) {
          pageURL = `${pageURL}+style${window.location.href.split('?style')[1]}`;
        }
      } else {
        if(pageURL.includes('+style')) {
          pageURL = pageURL.split('+')[0];
        }
        /**
         * Query param `layers` exists. Add to exist list
         * Update map-1 map-2 layers based on which map is selected first
         */
        // if map-2 was selected first (confirm this by checking the url)
        // push layers to respective maps
        if (window.location.href.includes('?map-2-layers')) {
          if (mapId === 'map-2') {
            if (window.location.href.includes('&')) {
              pageURL = `${pageURL.split('&')[0]},${layerId}&${pageURL.split('&')[1]}`;
            } else {
              pageURL = `${pageURL},${layerId}`;
            }
          } else {
            pageURL = `${pageURL},${layerId}`;
          }
        } else {
          if (mapId === 'map-2') {
            pageURL = `${pageURL},${layerId}`;
          } else {
            if (window.location.href.includes('&')) {
              pageURL = `${pageURL.split('&')[0]},${layerId}&${pageURL.split('&')[1]}`;
            } else {
              pageURL = `${pageURL},${layerId}`;
            }
          }
        }
        if(window.location.href.includes('+style')) {
          pageURL = `${pageURL}+${window.location.href.split('+')[1]}`;
        }
      }

      history.pushState('', '', pageURL);
    } else if (layer && layer.visible === true) {
      if (window.location.href.includes(`?${queryParamLayers}=${layerId}`)) {
        // If layerId is the first item in the query param list
        if (window.location.href.includes(`?${queryParamLayers}=${layerId},`)) {
          // If query param list has other layerIds
          pageURL = window.location.href.replace(
            `?${queryParamLayers}=${layerId},`,
            `?${queryParamLayers}=`
          );
        } else {
          // If layer Id is the only item in the query param list
          pageURL = window.location.href.replace(`?${queryParamLayers}=${layerId}`, '');
        }
      } else if (window.location.href.includes(`,${layerId}`)) {
        // If layer Id is not the first item in the query param list
        pageURL = window.location.href.replace(`,${layerId}`, '');
      }
      /**
       * Duplication needs refactor
       * */
      if (window.location.href.includes(`&${queryParamLayers}`)) {
        if (window.location.href.includes(`&${queryParamLayers}=${layerId}`)) {
          // If layerId is the first item in the query param list
          if (window.location.href.includes(`&${queryParamLayers}=${layerId},`)) {
            // If query param list has other layerIds
            pageURL = window.location.href.replace(
              `&${queryParamLayers}=${layerId},`,
              `&${queryParamLayers}=`
            );
          } else {
            // If layer Id is the only item in the query param list
            pageURL = window.location.href.replace(`&${queryParamLayers}=${layerId}`, '');
          }
        } else if (window.location.href.includes(`,${layerId}`)) {
          // If layer Id is not the first item in the query param list
          pageURL = `${window.location.href.split('&')[0]}&${window.location.href
            .split('&')[1]
            .replace(`,${layerId}`, '')}`;
        }
      }
      /**
       * Switch & to ? param when all `?` layers have been poppoed off
       */
      if (pageURL.includes('/&')) {
        pageURL = pageURL.replace('&', '?');
      }
      history.replaceState('', '', pageURL);
    }
  }

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
