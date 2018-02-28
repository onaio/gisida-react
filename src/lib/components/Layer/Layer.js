import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Actions, prepareLayer } from 'gisida'

export default class Layer extends Component {

  onLayerToggle = (e, layer) => {
    // dispatch toggle layer action
    this.props.dispatch(Actions.toggleLayer(layer.id, e.target.checked));

    // Prepare layer if layer had not been loaded
    if (!layer.loaded && !layer.isLoading) {
      prepareLayer(layer, this.props.dispatch);
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
