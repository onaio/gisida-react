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
    styles: state.STYLES,
    regions: state.REGIONS
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
      let theMap = this.map; 

      this.map.on('mousedown', function (e) {
        document.getElementById('info').innerHTML =
          // e.point is the x, y coordinates of the mousemove event relative
          // to the top-left corner of the map
          JSON.stringify(e.point) + '<br />' +
          // e.lngLat is the longitude, latitude geographical position of the event
          JSON.stringify(e.lngLat) + '<br />' +
          'Zoom: ' + theMap.getZoom()  + '<br />' +
          'Center: ' + theMap.getCenter() + '<br />';
      })
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
    const accessToken = nextProps.accessToken;
    const mapConfig = nextProps.mapConfig;
    const styles = nextProps.styles;
    const regions = nextProps.regions;
  
    // Check if map isLoad and initialize.
    if (!isLoaded) {
      this.initMap(accessToken, mapConfig);
    }

    this.map.on('styledata', () => {
     // Handle Style Changes
    });

    // Check for changes in Map Style
    styles.forEach((style) => {
      if (style.current && mapConfig.style !== style.style) {
        this.map.setStyle(style.style);
      }
    });

    // Add Layers to map from props
    if (isLoaded && layers && Object.keys(layers).length > 0) {
      Object.keys(layers).forEach((key) => {
        const layer = layers[key];
        if (layer.loaded) {
          addLayer(this.map, layer, mapConfig);
        }
      });
    }

    // Set region from props
    regions.forEach((region) => {
      if (region.current) {
        this.map.easeTo({ center: region.center, zoom: region.zoom })
      }
    });
    window.GisidaMap = this.map;
  }

  render() {
    return (
      <div>
        <div id='map' />
        <pre id='info'></pre>
      </div>  
    );
  }
}

export default connect(mapStateToProps)(Map);
