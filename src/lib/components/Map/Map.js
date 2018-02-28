import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, addLayer, addPopUp, prepareLayer, sortLayers } from 'gisida';
import { detectIE } from '../../utils';
import Filter from '../Filter/Filter';
import './Map.scss';

const mapStateToProps = (state, ownProps) => {
  let layersObj = [];
  Object.keys(state.MAP.layers).forEach((key) => {
    const layer = state.MAP.layers[key];
    if (layer.visible) {
      layersObj.push(layer);
    }
  });

  return {
    APP: state.APP,
    STYLES: state.STYLES,
    REGIONS: state.REGIONS,
    MAP: state.MAP,
    layersObj: layersObj
  }
}

const isIE = detectIE();

class Map extends Component {
  initMap(accessToken, mapConfig) {
    if (accessToken && mapConfig) {
      mapboxgl.accessToken = accessToken;
      this.map = new mapboxgl.Map(mapConfig);
      this.map.addControl(new mapboxgl.NavigationControl());
  
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
        // Define on map on render listener for current stlye loads
        const onStyleLoad = (e) => {
          // check if map is loaded before reloading layers
          if (e.target.loaded() && mapLoad !== e.target.loaded() && this.props.MAP.isLoaded) {
            mapLoad = true;
            this.props.dispatch(Actions.reloadLayers(Math.random()));
          }
        };
        // remove render listener for previous style.load event
        e.target.off('render', onStyleLoad);
        // add render listener for current style.load event
        e.target.on('render', onStyleLoad);
      });

      // Dispach map rendered to indicate map was rendered
      this.props.dispatch(Actions.mapRendered());
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
    const currentRegion = nextProps.MAP.currentRegion;
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
        if (region.current && this.props.MAP.currentRegion !== currentRegion) {
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
          const timeSeriesLayer = nextProps.MAP.timeseries[layer.id];
          // Add layer to map if visible
          if (!this.map.getLayer(layer.id) && layer.visible && layer.styleSpec) {
            this.map.addLayer(layer.styleSpec);

            // if layer has a highlight layer
            if (layer.filters && layer.filters.highlight) {
              // create a copy of the layer
              const highlightLayer = Object.assign({}, layer.styleSpec);
              // apply layout and paint properties to the highlight layer
              if (layer['highlight-layout']) {
                highlightLayer.layout = Object.assign({}, highlightLayer.layout, layer['highlight-layout']);
              }
              if (layer['highlight-paint']) {
                highlightLayer.paint = Object.assign({}, highlightLayer.paint, layer['highlight-paint']);
              }
              // append suffix to highlight layer id
              highlightLayer.id += '-highlight';
              // add the highlight layer to the map
              this.map.addLayer(highlightLayer);
            }
          } 
          // Change visibility if layer is already on map
          if (this.map.getLayer(layer.id)) {
            this.map.setLayoutProperty(layer.id, 'visibility', layer.visible ? 'visible' : 'none');
            // if layer has a highlight layer, update its visibility too
            if (this.map.getLayer(`${layer.id}-highlight`)) {
              this.map.setLayoutProperty(`${layer.id}-highlight`, 'visibility', layer.visibile ? 'visibile': 'none');
            }
          }
        });

        sortLayers(this.map, layers);
      }
    }
    // Assign global variable for debugging purposes.
    window.GisidaMap = this.map;

  }

  componentDidUpdate(prevProps, prevState) {
    
  }

  render() {
    return (
        <div>
        {isIE || !mapboxgl.supported() ?
        (<div className="alert alert-info">
          Your browser is not supported. Please open link in another browser e.g Chrome or Firefox
        </div>) :
          (<div id='map' style={{ width: this.props.MAP.showFilterPanel ? 'calc(100% - 250px)' : '100%'}}/>)}
        </div>
    );
  }
}

export default connect(mapStateToProps)(Map);
