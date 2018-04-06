import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer/Layer';
import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
  return {
    preparedLayers: state.MAP.layers
  }
}

export class Layers extends Component {
  render() {
    const { mapTargetId, layers, currentRegion } = this.props;

    let layerKeys;
    let layerObj;
    let layer;
    const layerItem = [];
    const subLayerIds = [];

    layerKeys = Object.keys(this.props.preparedLayers);

    for (let lo = 0; lo < layerKeys.length; lo += 1) {
      layerObj = this.props.preparedLayers[layerKeys[lo]];
      if (layerObj.layers) {
        for (let s = 0; s < layerObj.layers.length; s += 1) {
          subLayerIds.push(layerObj.layers[s]);
        }
      }
    }

    layers.map((layer) => {
      if ((!currentRegion || (layer.region && layer.region === currentRegion)) && !subLayerIds.includes(layer.id)) {
        layerItem.push(
          (<Layer
            key={layer.id}
            mapTargetId={mapTargetId}
            layer={layer}
          />)
        );
      }
      return null;
    });

    return (
      <ul className="layers">
        {layerItem}
      </ul>
    );
  }
}

Layers.propTypes = {
  mapTargetId: PropTypes.string.isRequired,
  layers: PropTypes.arrayOf(PropTypes.any).isRequired,
  currentRegion: PropTypes.string,
};

export default connect(mapStateToProps)(Layers);
