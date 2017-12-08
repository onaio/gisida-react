import React from 'react';
import PropTypes from 'prop-types';

const Layer = ({ mapTargetId, layer, onLayerToggle = f => f }) =>
  (<li className={`layer ${mapTargetId}`}>  
    <input
      type="checkbox"
      data-layer={layer.id}
      onChange={e => onLayerToggle(layer, e.target.checked, mapTargetId)}
    />
    <label htmlFor={layer.id} >{layer.label}</label>
  </li>);

Layer.propTypes = {
  mapTargetId: PropTypes.string.isRequired,
  layer: PropTypes.objectOf(PropTypes.any).isRequired,
  onLayerToggle: PropTypes.func.isRequired,
};

export default Layer;
