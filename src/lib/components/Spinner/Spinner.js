import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

require('./Spinner.scss');

const mapStateToProps = (state, ownProps) => {
  const mapId = ownProps.mapId || 'map-1';
  const MAP = state[mapId] || { blockLoad: true };
  return {
    mapId,
    MAP,
  }
}

export class Spinner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div
        className="spinner"
        id={`spinner-${this.props.mapId}`}
        style={{ display: this.props.MAP.showSpinner ? 'block' : 'none'}} />
    );
  }
}

export default connect(mapStateToProps)(Spinner);

Spinner.propTypes = {
  MAP: PropTypes.objectOf(PropTypes.any).isRequired,
  mapId: PropTypes.string.isRequired,
}