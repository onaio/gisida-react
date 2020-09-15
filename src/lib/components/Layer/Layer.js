import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Actions, prepareLayer, lngLat } from 'gisida';
import { pushLayerToURL } from './utils';

const mapStateToProps = (state, ownProps) => {
  const { APP, LOC } = state;
  const MAP = state[ownProps.mapId];
  if (!!!MAP) {
    throw 'MAP not found';
  }
  return {
    APP,
    LOC,
    MAP,
  };
};

export class Layer extends Component {
  /**
   * Return true if a  layer is visible, false otherwise
   * @param {*} layerId
   */
  isLayerVisible(layerId) {
    const { MAP } = this.props;
    const { activeLayerIds } = MAP;

    return activeLayerIds.indexOf(layerId) >= 0;
  }

  onLayerToggle = layer => {
    // dispatch toggle layer action
    const { mapId, APP, LOC, MAP } = this.props;
    if (!mapId) {
      return null;
    }
    // mapstatetorurl is being set on the site config
    if (APP.mapStateToUrl) {
      pushLayerToURL(layer, mapId);
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
    if (!MAP.layers[layer.id].loaded && !MAP.layers[layer.id].isLoading) {
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
          onChange={e => this.onLayerToggle(layer)}
          checked={this.isLayerVisible(layer.id)}
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
