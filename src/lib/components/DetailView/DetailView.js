import React, { Component } from 'react';
import { Actions } from 'gisida';
import { connect } from 'react-redux';

const mapStateToProps = (state, ownProps) => {
  return {
    APP: state.APP,
    MAP: state.MAP,
  }
}

class DetailView extends Component {
  render() {
    return null;
  }
}

export default connect(mapStateToProps)(DetailView);
