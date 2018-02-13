import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, addLayer, addPopUp } from 'gisida';
import { detectIE } from '../../utils';
import Filter from '../Filter/Filter';
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

  /*getLayerFilter(layerId) {
    let layerObj;
    for (let i = 0; i < this.state.layersObj.length; i += 1) {
      layerObj = this.state.layersObj[i];
      if (layerObj.id === layerId) {
        return layerObj.filters && layerObj.filters.layerFilters;
      }
    }
    return null;
  }

  setLayerFilter(layerId, filters) {
    let nextLayerObj;
    let featureLayerObj;
    const nextLayersObj = [];
    for (let i = 0; i < this.state.layersObj.length; i += 1) {
      nextLayerObj = this.state.layersObj[i];
      if (nextLayerObj.id === layerId) {
        nextLayerObj.filters.layerFilters = filters;
        featureLayerObj = Object.assign({}, nextLayerObj);
      }
      nextLayersObj.push(nextLayerObj);
    }
    this.setState({
      layerObj: nextLayerObj,
      layersObj: nextLayersObj,
    }, () => {
      this.buildFilters(featureLayerObj);
    });
  }

  buildFilters(layerObj) {
    const layerId = layerObj.id;
    const filterKeys = Object.keys(layerObj.filters);
    let filter;
    const combinedFilters = ['all'];

    // loop through filters object
    for (let f = 0; f < filterKeys.length; f += 1) {
      filter = layerObj.filters[filterKeys[f]];

      if (filterKeys[f] === 'highlight') {
        // handle highlight filter seperately
        this.applyFilters(`${layerId}-highlight`, filter);
      } else if (filter) {
        // build out combined filters
        combinedFilters.push(filter);
      }
    }

    if (combinedFilters.length > 2) {
      // if there are multiple filters apply as is
      this.applyFilters(layerId, combinedFilters);
    } else if (combinedFilters.length === 2) {
      // if there is only one filter, apply the only one
      this.applyFilters(layerId, combinedFilters[1]);
    }
  }*/

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
    console.log("props", this.props);
    return (
        <div>
        {isIE || !mapboxgl.supported() ?
        (<div className="alert alert-info">Your browser is not supported. Please open link in another browser e.g Chrome or Firefox
        </div>):
            ( <div id='map' />)}
          <button
            className="filterButton glyphicon glyphicon-filter"
          />
          {/* <Filter /> */}
        </div>
    );
  }
}

export default connect(mapStateToProps)(Map);
