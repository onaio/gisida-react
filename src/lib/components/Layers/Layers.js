import React from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer/Layer'

const Layers = ({ mapTargetId, layers, currentRegion}) =>
  (<ul className="layers">
    {layers.map(layer => {
      if (!currentRegion || (layer.region && layer.region === currentRegion)) {
        return (<Layer
          key={layer.id}
          mapTargetId={mapTargetId}
          layer={layer}
        />)
      }
      return ""
    })
  }
  </ul>);

Layers.propTypes = {
  mapTargetId: PropTypes.string.isRequired,
  layers: PropTypes.arrayOf(PropTypes.any).isRequired,
  currentRegion: PropTypes.string.isRequired,
};

export default Layers;
