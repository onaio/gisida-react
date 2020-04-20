import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Actions, prepareLayer, lngLat } from 'gisida';

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
  onLayerToggle = (layer, e) => {
    // dispatch toggle layer action
    const { mapId, APP, LOC } = this.props;
    if (!mapId) {
      return null;
    }

    const layerId = layer.id.replace('.json', '');
    let pageURL = `${window.location.href}`;
    /**
     * Check for visibility. If false it means layer has been selected push to layer id to url
     * else if visible it means layer has been checked off pop layer from url
     */
    if (layer && layer.visible === false) {
      if (!window.location.href.includes('?layers=') && !window.location.href.includes('&primary=')) {
        /**
         * Query param `layers` does not exist. Have the layerId as the first
         * value of query param `layers`. The assumption made is that
         * there exists no other query params
         */
        pageURL = `${pageURL}?layers=${layerId}&primary=${layerId}`;
      } else {
        /**
         * Query param `layers` exists. Add to exist list
         * Update primary layer accordingly
         */
        pageURL = `${pageURL.split('&')[0]},${layerId}&primary=${layerId}`;
        // pageURL.splice pageURL.indexOf('&primary');
      }

      history.pushState('', '', pageURL);
    } else if (layer && layer.visible === true) {
      if (window.location.href.includes(`?layers=${layerId}`)) {
        // If layerId is the first item in the query param list
        if (window.location.href.includes(`?layers=${layerId},`)) {
          // If query param list has other layerIds
          pageURL = window.location.href.replace(`?layers=${layerId},`, '?layers=');
        } else {
          // If layer Id is the only item in the query param list
          pageURL = window.location.href.replace(`?layers=${layerId}`, '').replace(`&primary=${layerId}`, '');
        }
      } else if (window.location.href.includes(`,${layerId}`)) {
        // If layer Id is not the first item in the query param list
        pageURL = window.location.href.replace(`,${layerId}`, '');
      }
      /**
       * Update primarylayer when user unchecks the layer
       * activeLayerIds holds active layers in a sorted fashion
       * By subtracting two we get the next primary layer
       */
      if (e.currentTarget.getAttribute("data-layer") === this.props.primaryLayer) {
        const nextPrimaryLayer = this.props.activeLayerIds[this.props.activeLayerIds.length - 2].replace('.json', '');
        pageURL = pageURL.replace(`&primary=${layerId}`, `&primary=${nextPrimaryLayer}`);
      }

      history.replaceState('', '', pageURL);
    }
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
          onChange={e => this.onLayerToggle(layer, e)}
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
