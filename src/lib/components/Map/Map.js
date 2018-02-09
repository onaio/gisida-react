import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, addLayer, addPopUp } from 'gisida';
import { detectIE } from '../../utils';
import './Map.scss';

const mapStateToProps = (state, ownProps) => {
  return {
    APP: state.APP,
    STYLES: state.STYLES,
    REGIONS: state.REGIONS,
    MAP: state.MAP
  }
}

const isIE = detectIE();

class Map extends Component {

  initMap(accessToken, mapConfig) {
    if (accessToken && mapConfig) {
      mapboxgl.accessToken = accessToken;
      this.map = new mapboxgl.Map(mapConfig);
      this.map.addControl(new mapboxgl.NavigationControl());
      // Map Rendered
      this.props.dispatch(Actions.mapRendered());
      // Handle Map Load Event
      this.map.on('load', () => {
        const mapLoaded = true;
        this.addMouseEvents();
        this.setState({ mapLoaded });
        this.props.dispatch(Actions.mapLoaded(true));
      });

      // Handle Style Change Event
      this.map.on('style.load', (e) => {
        let mapLoad = false;
        // Render Event listner function for style load
        const onStyleLoad = (e) => {
          if (e.target.loaded() && mapLoad !== e.target.loaded() && this.props.MAP.isLoaded) {
            mapLoad = true;
            this.props.dispatch(Actions.reloadLayers(Math.random()));
          }
        };
        e.target.off('render', onStyleLoad);
        e.target.on('render', onStyleLoad);
      });
    }
  }

  addMouseEvents() {
    addPopUp(this.map, this.props.dispatch);
    // this.addMapClickEvents()
    // this.addMouseMoveEvents()
    // etc
  }
  
  componentWillReceiveProps(nextProps){
    const accessToken = nextProps.APP.accessToken;
    const mapConfig = nextProps.APP.mapConfig;

    const isRendered = nextProps.MAP.isRendered;
    const isLoaded = nextProps.MAP.isLoaded;
    const currentStyle = nextProps.MAP.currentStyle;
    const reloadLayers = nextProps.MAP.reloadLayers;


    const layers = nextProps.MAP.layers;
    const styles = nextProps.STYLES;
    const regions = nextProps.REGIONS;

    // Check if map is initialized.
    if (!isRendered && (!isIE || mapboxgl.supported())) {
      this.initMap(accessToken, mapConfig);
    }
    // Check if rendererd map has finished loading
    if (isLoaded) {

      // Set current style (basemap)
      styles.forEach((style) => {
        if (style.current && this.props.MAP.currentStyle !== currentStyle) {
          this.map.setStyle(style.url);
        }
      });

      // Zoom to current region (center and zoom)
      regions.forEach((region) => {
        if (region.current) {
          this.map.easeTo({
            center: region.center,
            zoom: region.zoom,
            duration: 1200
          })
        }
      });

      // Add current layers to map
      if (this.props.MAP.reloadLayers !== reloadLayers) {
        Object.keys(layers).forEach((key) => {
          const layer = layers[key];
          if (layer.loaded) {
            addLayer(this.map, layer, mapConfig);
          }
        });
      }
    }
    // Assign global variable for debugging purposes.
    window.GisidaMap = this.map;
  }

  render() {
    return (
        <div>
        {isIE || !mapboxgl.supported() ?
        (<div className="alert alert-info">Your browser is not supported. Please open link in another browser e.g Chrome or Firefox
        </div>):
            ( <div id='map' />)}
          <button
            className="filterButton glyphicon glyphicon-filter"
          />
        </div>
    );
  }
}

export default connect(mapStateToProps)(Map);
