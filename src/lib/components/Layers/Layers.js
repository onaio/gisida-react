import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer/Layer';

export class Layers extends Component {
  render() {
    const { mapId, layers, currentRegion, preparedLayers } = this.props;

    let layerKeys;
    let layerObj;
    const layerItem = [];
    const subLayerIds = [];

    if (!preparedLayers) {
      return false;
    }

    layerKeys = Object.keys(preparedLayers);

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
            mapId={mapId}
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
  mapId: PropTypes.string.isRequired,
  layers: PropTypes.arrayOf(PropTypes.any).isRequired,
  currentRegion: PropTypes.string,
};

export default Layers;
