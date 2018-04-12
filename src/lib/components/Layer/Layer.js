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

  onLayerToggle = (e, layer) => {
    // dispatch toggle layer action
    const mapId = this.props.mapId;
    this.props.dispatch(Actions.toggleLayer(mapId, layer.id, e.target.checked));

    // Prepare layer if layer had not been loaded
    if (!layer.loaded && !layer.isLoading) {
      prepareLayer(mapId, layer, this.props.dispatch);
    }
  }

  render() {
    const layer = this.props.layer; 
    return (
      <li className="layer">
        <input
          id={layer.id}  
          type="checkbox"
          data-layer={layer.id}
          onChange={e => this.onLayerToggle(e, layer)}
          checked={!!layer.visible}
        />
        <label htmlFor={layer.id} >{layer.label}</label>
      </li>
    );
  }
}

Layer.propTypes = {
  layer: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default connect(mapStateToProps)(Layer);
