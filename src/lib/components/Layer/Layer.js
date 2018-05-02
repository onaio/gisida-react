import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Actions, prepareLayer } from 'gisida'


const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId]
  if (!!!MAP) {
    debugger
  }
  return {
    timeSeriesObj: MAP.timeseries[MAP.visibleLayerId],
    timeseries: MAP.timeseries,
    layers: MAP.layers
  }
}

export class Layer extends Component {

  onLayerToggle = layer => {
    // dispatch toggle layer action
    const mapId = this.props.mapId;
    if (!mapId) {
      return null;
    }
    this.props.dispatch(Actions.toggleLayer(mapId, layer.id));

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
        <label
          htmlFor={`${layer.id}-${mapId}`} >
          {layer.label}
          {layer.layers ?
            <i
              data-balloon="Grouped"
              data-balloon-pos="up"
            >
              <span
                className="glyphicon glyphicon-th-list"
              />
            </i> : null}
        </label>
      </li>
    );
  }
}

Layer.propTypes = {
  layer: PropTypes.objectOf(PropTypes.any).isRequired,
  mapId: PropTypes.string,
};

export default connect(mapStateToProps)(Layer);
