import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, addPopUp, sortLayers, addChart } from 'gisida';
import { detectIE, buildLayersObj } from '../../utils';
import './Map.scss';

const mapStateToProps = (state, ownProps) => {
  return {
    APP: state.APP,
    STYLES: state.STYLES,
    REGIONS: state.REGIONS,
    MAP: state.MAP,
    timeSeriesObj: state.MAP.timeseries[state.MAP.visibleLayerId],
    timeseries: state.MAP.timeseries,
    layersObj: buildLayersObj(state.MAP.layers),
    layerObj: state.MAP.layers[state.MAP.activeLayerId],
    primaryLayer: state.MAP.primaryLayer,
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

  findNextLayer(activelayersData, nextLayer) {
    return activelayersData.find(lo => lo.id === nextLayer);
  }

  setPrimaryLayer(primaryLayer, activeLayerId, layers, activeLayersData, activelayerObj) {
    const nextLayerId =  primaryLayer || activeLayerId;
    let nextLayerObj = activeLayersData.find(lo => lo.id === nextLayerId);
    if (!nextLayerObj && layers[nextLayerId].layers) {
      let nextLayer;
      for (let l = 0; l < layers[nextLayerId].layers.length; l += 1) {
        nextLayer = layers[nextLayerId].layers[l];
        nextLayerObj = this.findNextLayer(activeLayersData, nextLayer);
        if (nextLayerObj) break;
      }
    }
    if (!nextLayerObj) {
      return false;
    }

    // Move the selected primary layer to the top of the map layers
    if (this.map.getLayer(nextLayerId)) {
      this.map.moveLayer(nextLayerId);
    }
    let layerObj;
    // Loop throught all active map layers
    for (let i = activeLayersData.length - 1; i >= 0; i -= 1) {
      layerObj = activeLayersData[i];
      // If 'layerObj' is not a fill OR the selected primary layer
      if (layerObj.type !== 'fill' && layerObj.id !== nextLayerId) {
        // If 'layerObj' is not the same type as the selected
        if (layerObj.type !== nextLayerObj.type) {
          // Move 'layerObj' to the top of the map layers
          if (this.map.getLayer(layerObj.id)) {
            this.map.moveLayer(layerObj.id);
          }
        }
      }
    }

    // Re-order this.state.layersObj array
    const nextlayersObj = activeLayersData.filter(lo => lo.id !== nextLayerId);
    nextlayersObj.push(nextLayerObj);

    return true;
  }
  
  changeVisibility(layerId, visibility) {
    if (this.map.getLayer(layerId)) {
      this.map.setLayoutProperty(layerId, 'visibility', visibility ? 'visible' : 'none');
      // if layer has a highlight layer, update its visibility too
      if (this.map.getLayer(`${layerId}-highlight`)) {
        this.map.setLayoutProperty(`${layerId}-highlight`, 'visibility', visibility ? 'visible' : 'none');
      }
    }
  }

  componentWillReceiveProps(nextProps){
    const accessToken = nextProps.APP.accessToken;
    const mapConfig = nextProps.APP.mapConfig;
    const isRendered = nextProps.MAP.isRendered;
    const isLoaded = nextProps.MAP.isLoaded;
    const currentStyle = nextProps.MAP.currentStyle;
    const currentRegion = nextProps.MAP.currentRegion;
    const reloadLayers = nextProps.MAP.reloadLayers;
    const activelayersData = nextProps.layersObj;
    const activelayerObj = nextProps.layerObj;
    const primaryLayer = nextProps.MAP.primaryLayer;
    const activeLayerId = nextProps.MAP.activeLayerId;

    const layers = nextProps.MAP.layers;
    const styles = nextProps.STYLES;
    const regions = nextProps.REGIONS;
    const mapId = 'map-1';
  

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
          this.changeVisibility(layer.id, layer.visible);
          if (layer.layers) {
            layer.layers.forEach((subLayer) => {
              this.changeVisibility(subLayer, layer.visible);
            });
          }

          if (layer.visible && layer.type === 'chart' && (typeof layer.source.data !== 'string')) {
            const timefield = (layer.aggregate && layer.aggregate.timeseries) ? layer.aggregate.timeseries.field : '';
            let { data } = layer.source;
            if (timefield) {
              const period = [...new Set(layer.source.data.map(p => p[timefield]))];
              // newStops = { id: layer.id, period, timefield };
              data = layer.source.data.filter(d => d[timefield] === period[period.length - 1]);
            }
            addChart(layer, data, this.map);
          } else {
             $(`.marker-chart-${layer.id}-${mapId}`).remove();
          }
        });

        sortLayers(this.map, layers);
      }

      if (this.props.MAP.primaryLayer !== primaryLayer) {
        this.setPrimaryLayer(primaryLayer, activeLayerId, layers, activelayersData, activelayerObj);
      }
    }
    // Assign global variable for debugging purposes.
    window.GisidaMap = this.map;
  }

  componentDidUpdate(prevProps, prevState) {
    const { layersObj, primaryLayer } = this.props;
    // Update Timeseries
    const doUpdateTSlayers = this.doUpdateTSlayers(prevProps);
    if (doUpdateTSlayers) {
      this.updateTimeseriesLayers();
    }

    // Update Labels
    this.removeLabels();
    for (let l = 0; l < layersObj.length; l += 1) {
      if (layersObj[l].id === primaryLayer && layersObj[l].labels && layersObj[l].labels.labels) {
        this.addLabels(this.props.layersObj[l], this.props.timeseries);
      }
    }
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
        && this.map.getLayoutProperty(layerObj.id, 'visibility' ) === 'none') {
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
    let layerObj;
    let id;
    let doUpdateStateForFilters = false;
    // let tsFilter;
    // let nextLayerObj;
    // let featureLayerObj;

    let pIndex;
    let hasData;

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
          temporalIndex, stops, colorStops, strokeWidthStops,
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
                this.map.setLayoutProperty(`${layer.id}-highlight`, 'visibility', 'visible');
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

  addLabels(layerObj, timeseries) {
    let el;
    const { id } = layerObj;
    const { offset } = layerObj.labels;
    const labels = typeof timeseries[layerObj.id] !== 'undefined'
      ? layerObj.labels.labels[timeseries[layerObj.id].period[timeseries[layerObj.id].temporalIndex]]
      : layerObj.labels.labels;

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
