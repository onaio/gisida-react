import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer/Layer';

export class Layers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  toggleSubMenu(e) {
    e.preventDefault();
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  render() {
    const { mapId, layers, currentRegion, preparedLayers } = this.props;

    let layerKeys;
    let layerObj;
    let layerItem = [];
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

    layers.forEach((layer) => {
      if ((!currentRegion
        || (layer.region
          && layer.region === currentRegion))
        && !subLayerIds.includes(layer.id)) {
        if (layer.id) {
          layerItem.push((<Layer
            key={layer.id}
            mapId={mapId}
            layer={layer}
          />))
        } else {
          Object.keys(layer).forEach((d, i) => {
            layerItem = layerItem.concat([
              (
                <a
                  key={i}
                  className="sub-category"
                  onClick={(e) => this.toggleSubMenu(e)}
                >
                  {d}
                  <span
                    className={`category glyphicon glyphicon-chevron-${this.state.isOpen ? 'down' : 'right'}`}
                  />
                </a>
              ),
              (this.state.isOpen ?
                <Layers
                  key={d}
                  mapId={mapId}
                  layers={layer[d].layers}
                  currentRegion={currentRegion}
                  preparedLayers={preparedLayers}
                />
              : null)
            ]);
          });
        }
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
