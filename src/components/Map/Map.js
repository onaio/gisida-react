import React, { Component } from 'react';
import { MapboxWrapper } from 'gisida';
import './Map.css';

const containerID = 'map';

class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
   
    };
  }
  componentDidMount() {
    MapboxWrapper.renderMap(this.props.mapConfig, this.props.accessToken)
  }

  render() {
    return (
      <div id='map' />
    );
  }
}

export default Map;
