import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, addPopUp, sortLayers } from 'gisida';
import { detectIE } from '../../utils';
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
    layersObj: layersObj,
    timeSeriesObj: state.MAP.timeseries[state.MAP.visibleLayerId],
    timeseries: state.MAP.timeseries
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

      // Handle adding/removing labels when zooming
      this.map.on('zoom', this.handleLabelsOnMapZoom.bind(this))

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
    // Update Timeseries
    const doUpdateTSlayers = this.doUpdateTSlayers(prevProps);
    if (doUpdateTSlayers) {
      this.updateTimeseriesLayers();
    }

    // Update Labels
    this.removeLabels();
    this.props.layersObj.forEach(layerObj => {
      if (layerObj.labels && layerObj.labels.labels) {
        this.addLabels(layerObj);
      }
    });
  }

  doUpdateTSlayers(prevProps) {
    const { timeseries, layersObj } = this.props;
    // if timeseries objects' keys don't match, update the timeseries
    if (prevProps.timeseries &&
      Object.keys(prevProps.timeseries).length !== Object.keys(timeseries).length) {
      return true;
    }

    let layerObj;
    for (let lo = 0; lo < layersObj.length; lo += 1) {
      layerObj = layersObj[lo];
      // If layerObj mapbox layer is transparent, update the timeseries
      if (layerObj && this.map.getLayer(layerObj.id)
        && this.map.getPaintProperty(layerObj.id, `${layerObj.type}-opacity`) === 0) {
        return true;
      }
    }

    // if still unsure if timeseries objects match
    const tsKeys = Object.keys(timeseries);
    let layer;
    // loop through timeseries object checking for missmatching temporalIndecies
    for (let i = 0; i < tsKeys.length; i += 1) {
      layer = tsKeys[i];
      // if temporalIndecies don't match, then definitely update the timeseries
      if (timeseries[layer].temporalIndex !== prevProps.timeseries[layer].temporalIndex) {
        return true;
      }
    }

    return false;
  }

  updateTimeseriesLayers() {
    const { timeSeriesObj, timeseries, layersObj } = this.props; 
    const timeSeriesLayers = Object.keys(timeseries);

    // determine what the currently timeperiod to see if layers should be hidden
    const currPeriod = timeSeriesObj.period[timeSeriesObj.temporalIndex];

    let layer;
    let tsObj;
    let tsFilter;
    let layerObj;
    let id;
    let doUpdateStateForFilters = false;
    let nextLayerObj;
    let featureLayerObj;

    let pIndex;
    let hasData;
    let type;

    let index;
    let defaultValue;
    let paintProperty;
    let newStops;
    let newColorStops;
    let newStrokeStops;

    for (let i = 0; i < layersObj.length; i += 1) {
      layerObj = layersObj[i];
      id = layerObj.id;

      if (timeSeriesLayers.includes(id)) {
        tsObj = timeseries[id];

        const {
          temporalIndex, data, stops, colorStops, strokeWidthStops, breaks, colors,
        } = tsObj;

        index = parseInt(temporalIndex, 10);

        // if (layerObj.type === 'chart') {
          // $(`.marker-chart-${id}-${this.props.mapId}`).remove();
          // this.addChart(layerObj, data);

        // if not a chart, layer is on the map, and layer is visible
        // } else if (this.map.getLayer(id) && layer && layer.visible) {

          // look through the layer periods for a match
          pIndex = timeseries[id].period.indexOf(currPeriod);
          hasData = pIndex !== -1 ? timeseries[id].periodData[currPeriod].hasData : false;
          type = layerObj.type !== 'symbol' ? layerObj.type : 'icon';

          // if the layer is in the map and has no period match, hide it
          if (!hasData || pIndex === -1) {

            this.map.setLayoutProperty(layer.id, 'visibility', 'none');
            // if layer has a highlight layer, update its visibility too
            if (this.map.getLayer(`${layer.id}-highlight`)) {
              this.map.setLayoutProperty(`${layer.id}-highlight`, 'visibility', 'none');
            }

          // if the layer is not in the map and does have a match, handle it
          } else if (this.map.getLayer(id) && hasData && pIndex !== -1) {
            // if layer is hidden, reveal it
            if (this.map.getLayoutProperty(id, 'visibility') === 'none') {
              this.map.setLayoutProperty(layer.id, 'visibility', 'visible');
              // if layer has a highlight layer, update its visibility too
              if (this.map.getLayer(`${layer.id}-highlight`)) {
                this.map.setLayoutProperty(`${layer.id}-highlight`, 'visibility', 'visibile');
              }
            }

            // if layer has stops, update them
            if (stops && stops[index] !== undefined && stops[index][0][0] !== undefined) {
              defaultValue = layerObj.type === 'circle' ? 0 : 'rgba(0,0,0,0)';
              paintProperty = layerObj.type === 'circle' ? 'circle-radius' : 'fill-color';
              newStops = {
                property: layerObj.source.join[0],
                stops: stops[index],
                type: 'categorical',
                default: defaultValue,
              };

              if (layerObj.type === 'circle' && layerObj.categories.color instanceof Array) {
                newColorStops = {
                  property: layerObj.source.join[0],
                  stops: colorStops[index],
                  type: 'categorical',
                };
                newStrokeStops = {
                  property: layerObj.source.join[0],
                  stops: strokeWidthStops[index],
                  type: 'categorical',
                };
                this.map.setPaintProperty(id, 'circle-color', newColorStops);
                this.map.setPaintProperty(id, 'circle-stroke-width', newStrokeStops);
              }

              this.map.setPaintProperty(id, paintProperty, newStops);

              // TODO : update legend?
              // this.removeLegend(layerObj);
              // this.addLegend(layerObj, stops[index], data, breaks, colors);

            // TODO : handle timeseries without stops via filters
            // } else {
            //   for (let i = 0; i < nextLayersObj.length; i += 1) {
            //     nextLayerObj = Object.assign({}, nextLayersObj[i]);
            //     if (nextLayerObj.id === id) {
            //       nextLayerObj.filters.tsFilter = ['==', layerObj.aggregate.timeseries.field, currPeriod]
            //       nextLayersObj[i] = Object.assign({}, nextLayerObj);
            //     }
            //   }
            //   doUpdateStateForFilters = true;
            }
          }
        // }
      }
    }

    if (doUpdateStateForFilters) {
      // this.setState({
      //   layerObj: nextLayersObj[nextLayersObj.length - 1],
      //   layersObj: nextLayersObj,
      // }, () => {
      //   for (let lo = 0; lo < nextLayersObj.length; lo += 1) {
      //     if (nextLayersObj[lo].filters && typeof nextLayersObj[lo].filters.tsFilter !== 'undefined') {
      //       this.buildFilters(nextLayersObj[lo]);
      //     }
      //   }
      // });
    }
  }

  addLabels(layerObj) {
    let el;
    const { id } = layerObj;
    const { offset, labels } = layerObj.labels;
    for (let l = 0; l < labels.length; l += 1) {
      el = document.createElement('div');
      el.className = `map-label label-${id}`;
      el.innerHTML = labels[l].label;
      new mapboxgl.Marker(el, { offset })
        .setLngLat(labels[l].coordinates)
        .addTo(this.map);
    }
  }

  removeLabels(labelClass) {
    const classItems = document.getElementsByClassName((labelClass || 'map-label'));
    while (classItems[0]) {
      classItems[0].parentNode.removeChild(classItems[0]);
    }
  }

  handleLabelsOnMapZoom() {
    let minZoom;
    let maxZoom;
    let zoom = this.map.getZoom();
    let isRendered;
    this.props.layersObj.forEach(layerObj => {
      if (layerObj.labels) {
        minZoom = layerObj.labels.minZoom || layerObj.labels.minzoom || 0;
        maxZoom = layerObj.labels.maxZoom || layerObj.labels.maxzoom || 22;
        isRendered = (document.getElementsByClassName(`label-${layerObj.id}`)).length;

        if (zoom < minZoom || zoom > maxZoom) {
          this.removeLabels(`label-${layerObj.id}`);
        } else if (!isRendered) {
          this.addLabels(layerObj);
        }
      }
    });
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
