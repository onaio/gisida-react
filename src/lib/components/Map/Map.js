import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, addLayer } from 'gisida';
import './Map.scss';

const mapStateToProps = (state, ownProps) => {
  return {
    mapConfig: state.APP.mapConfig,
    accessToken: state.APP.accessToken,
    layers: state.LAYERS,
    isLoaded: state.MAP.isLoaded,
  }
}

class Map extends Component {

  initMap(accessToken, mapConfig) {
    if (accessToken && mapConfig) {
      mapboxgl.accessToken = accessToken;
      this.map = new mapboxgl.Map(mapConfig);
      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.on('load', () => {
        this.addMouseEvents();
        this.props.dispatch(Actions.mapLoaded(true));
      });
    }  
  }

  addMouseEvents() {
    // this.addMapClickEvents()
    // this.addMouseMoveEvents()
    // etc
  }
  
  componentWillReceiveProps(nextProps) {
    const isLoaded = nextProps.isLoaded;
    const layers = nextProps.layers;
    const accessToken = nextProps.accessToken
    const mapConfig = nextProps.mapConfig;
  
    // Check if map isLoad and initialize.
    if (!isLoaded) {
      this.initMap(accessToken, mapConfig);
    }

    // Add Layers to map from props
    if (isLoaded && layers && Object.keys(layers).length > 0) {
      Object.keys(layers).forEach((key) => {
        const layer = layers[key];
        if (layer.loaded) {
          addLayer(this.map, layer, mapConfig);
        }
      }); 
    }
  }

  render() {
    return (
      <div id='map' />
    );
  }
}

export default connect(mapStateToProps)(Map);
