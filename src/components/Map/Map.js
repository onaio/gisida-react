import React, { Component } from 'react';
import { connect } from 'react-redux'
import { formatNum, getLastIndex } from '../../utils'
import { processLayer,   } from 'gisida';
import './Map.css';

const mapboxgl = require('mapbox-gl');

const mapStateToProps = (state, ownProps) => {
  return {
    mapConfig: state.APP.mapConfig,
    accessToken: state.APP.accessToken,
    layers: state.LAYERS
  }
}

class Map extends Component {

  constructor(props) {
    super(props);

    // todo - bind all the functions
    // todo - move state to store
    this.state = 
    {
      loaded: false
    }
  }

  initMap(accessToken, mapConfig) {
    if (accessToken && mapConfig) {
      mapboxgl.accessToken = accessToken;
      this.map = new mapboxgl.Map(mapConfig);
      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.on('load', () => {
        this.addMouseEvents();
        // todo - dispatch MAP_LOADED action, triggering default layers to process
      });
    }  
  }

  addMouseEvents() {
    // this.addMapClickEvents()
    // this.addMouseMoveEvents()
    // etc
  }
  
  componentWillReceiveProps(nextProps) {
    // todo - remove this
    if (!this.state.loaded) {
      this.initMap(nextProps.accessToken, nextProps.mapConfig);
    }
    // todo - handle adding and removing layers based on props
  }

  componentDidUpdate(prevProps, prevState) {
    // todo - handle this is in componentWillReceiveProps
   
  }

  componentDidMount() {
    this.initMap(this.props.accessToken, this.props.mapConfig);
  }

  // todo - handle removing layers
  // todo - handle timeseries changes
  // todo - create timeseriesSliderContainer
  // todo - create legendContainer

  // todo - HANDLE THIS.PROPS.CHILDREN

  render() {
    return (
      <div id='map' />
    );
  }
}

export default connect(mapStateToProps)(Map);
