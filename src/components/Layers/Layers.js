import React from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer/Layer'

const Layers = ({ mapTargetId, layers}) =>
  (<ul className="layers">
    {layers.map(layer =>
      (<Layer
        key={layer.id}
        mapTargetId={mapTargetId}
        layer={layer}
      />))
  }
  </ul>);

Layers.propTypes = {
  mapTargetId: PropTypes.string.isRequired,
  layers: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default Layers;
