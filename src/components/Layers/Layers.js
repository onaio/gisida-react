import React from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer/Layer';
import LayerContainer from '../../containers/LayerContainer'

const Layers = ({ mapTargetId, layers}) =>
  (<ul className="layers">
    {layers.map(layer =>
      (<LayerContainer
        key={layer}
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
