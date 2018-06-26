import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Actions, prepareLayer } from 'gisida'


const mapStateToProps = (state, ownProps) => {
  const { APP } = state;
  const MAP = state[ownProps.mapId]
  if (!!!MAP) {
    debugger
  }
  return {
    APP,
    timeSeriesObj: MAP.timeseries[MAP.visibleLayerId],
    timeseries: MAP.timeseries,
    layers: MAP.layers
  }
}

export class Layer extends Component {

  onLayerToggle = layer => {
    // dispatch toggle layer action
    const { mapId, APP } = this.props;
    if (!mapId) {
      return null;
    }
    this.props.dispatch(Actions.toggleLayer(mapId, layer.id));

    if (layer.visible) {
      window.maps.forEach((e) => {
        e.easeTo({
          center: {
            lng: APP.mapConfig.center[0],
            lat: APP.mapConfig.center[1],
          },
          zoom: APP.mapConfig.zoom,
        });
      });
    }

    // Prepare layer if layer had not been loaded
    if (!layer.loaded && !layer.isLoading) {
      prepareLayer(mapId, layer, this.props.dispatch);
    }
  }

  render() {
    const layer = this.props.layer;
    const mapId = this.props.mapId;
    if (!mapId) {
      return null;
    }
    return (
      <li className="layer">
        <input
          id={`${layer.id}-${mapId}`}
          type="checkbox"
          data-layer={layer.id}
          onChange={e => this.onLayerToggle(layer)}
          checked={!!layer.visible}
        />
        <label htmlFor={`${layer.id}-${mapId}`} >{layer.label}</label>
      </li>
    );
  }
}

Layer.propTypes = {
  layer: PropTypes.objectOf(PropTypes.any).isRequired,
  mapId: PropTypes.string,
};

export default connect(mapStateToProps)(Layer);
