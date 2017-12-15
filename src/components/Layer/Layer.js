import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

class Layer extends Component {

  onLayerToggle = () => {
    //this.props.dispatch({ type: 'LOAD_LAYER' });
    console.log(this.props.dispatch);
  }

  render() {
    const mapTargetId= this.props.mapTargetId;
    const layer = this.props.layer;
    return (
      <li className={`layer ${mapTargetId}`}>
        <input
          type="checkbox"
          data-layer={layer.id}
          onChange={e => this.onLayerToggle(layer, e.target.checked, mapTargetId)}
        />
        <label htmlFor={layer.id} >{layer.label}</label>
      </li>
    );
  }
}

Layer.propTypes = {
  mapTargetId: PropTypes.string.isRequired,
  layer: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default connect(mapStateToProps)(Layer);
