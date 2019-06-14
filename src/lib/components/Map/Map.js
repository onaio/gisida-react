import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, addPopUp, sortLayers, addChart, buildDetailView, prepareLayer } from 'gisida';
import { detectIE, buildLayersObj, detailViewData, orderLayers } from '../../utils';
import './Map.scss';

const mapStateToProps = (state, ownProps) => {
  const { APP, STYLES, REGIONS, VIEW, FILTER, LOC } = state;
  const mapId = ownProps.mapId || 'map-1';
  const MAP = state[mapId] || { blockLoad: true, layers: {}};
  const { detailView } = MAP;
  const activeLayers = [];
  Object.keys(MAP.layers).forEach((key) => {
    const layer = MAP.layers[key];
    if (layer.visible && layer.type !== 'chart') {
      activeLayers.push(key);
    }
  });

  MAP.blockLoad = mapId === 'map-1'
    ? false
    : !VIEW || !VIEW.splitScreen;

  return {
    mapId,
    APP,
    STYLES,
    REGIONS,
    MAP,
    LOC,
    VIEW,
    FILTER,
    layers: MAP.layers,
    primarySubLayer: MAP.primarySubLayer,
    activeLayerIds: MAP.activeLayerIds,
    detailView: MAP.detailView,
    timeSeriesObj: MAP.timeseries ? MAP.timeseries[MAP.primarySubLayer || MAP.activeLayerId]: null,
    timeseries:  MAP.timeseries,
    layersObj: MAP.layers ? buildLayersObj(MAP.layers) : {},
    layerObj: MAP.layers ? MAP.layers[MAP.primaryLayer || MAP.activeLayerId]: null,
    primaryLayer: MAP.primaryLayer,
    oldLayerObj: MAP.oldLayerObjs ? MAP.oldLayerObjs[MAP.primaryLayer] : {},
    showDetailView: (detailView && detailView.model && detailView.model.UID),
    showFilterPanel: !!MAP.showFilterPanel,
    activeLayers,
    handlers: ownProps.handlers,
  }
}

const isIE = detectIE();

window.maps = [];

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layersObj: this.props.layersObj,
    }
  }
  initMap(accessToken, mapConfig, mapId) {
    if (accessToken && mapConfig) {
      mapboxgl.accessToken = accessToken;
      this.map = new mapboxgl.Map(mapConfig);
      window.maps.push(this.map);
      this.map.controls = new mapboxgl.NavigationControl();
      this.map.addControl(this.map.controls);
      this.map.scale_controls = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
    });
    this.map.addControl(this.map.scale_controls);
  
      // Handle Map Load Event
      this.map.on('load', () => {
        const mapLoaded = true;
        this.addMouseEvents(mapId);
        this.setState({ mapLoaded });
        this.props.dispatch(Actions.mapLoaded(mapId, true));
      });

      // Handle Style Change Event
      this.map.on('style.load', (e) => {
        let mapLoad = false;
        // Define on map on render listener for current stlye loads
        const onStyleLoad = (e) => {
          // check if map is loaded before reloading layers
          if (e.target.loaded() && mapLoad !== e.target.loaded() && this.props.MAP.isLoaded) {
            mapLoad = true;
            this.props.dispatch(Actions.reloadLayers(mapId, Math.random()));
          }
        };
        // remove render listener for previous style.load event
        e.target.off('render', onStyleLoad);
        // add render listener for current style.load event
        e.target.on('render', onStyleLoad);
      });

      this.map.on('data', (data) => {
        if (data.isSourceLoaded) {
          this.props.dispatch(Actions.triggerSpinner(this.props.mapId));
        }
      });

      // Handle adding/removing labels when zooming
      this.map.on('zoom', this.handleLabelsOnMapZoom.bind(this))

      // Dispach map rendered to indicate map was rendered
      this.props.dispatch(Actions.mapRendered(mapId, true));
    }
  }

  addMouseEvents(mapId) {
    const { handlers, APP } = this.props;
    if (handlers && Array.isArray(handlers)) {
      let handler;
      for (let c = 0; c < handlers.length; c += 1) {
        handler = handlers[c];
        if (Array.isArray(handler.layer)) {
          for (let l = 0; l < handler.layer.length; l += 1) {
            this.map.on(handler.type, handler.layer[l], handler.method)
          }
        } else {
          this.map.on(handler.type, handler.method);
        }
      }
    }

    if (APP.disableDefaultMapListeners) {
      return false
    }



    if (!APP.disableTooltip) {
      addPopUp(mapId, this.map, this.props.dispatch);
      // this.addMapClickEvents()
      // this.addMouseMoveEvents()
      // etc
      this.map.on('mousemove', (e) => {
        const { activeLayers, layerObj } = this.props;
        if (!layerObj) {
          return false;
        }
        const features = this.map.queryRenderedFeatures(e.point, {
          layers: activeLayers.filter(i => this.map.getLayer(i) !== undefined)
        });
        const feature = features.find(f => f.layer.id === layerObj.id);
        if (!feature) {
          return false;
        }
        this.map.getCanvas().style.cursor = layerObj['detail-view']
          ? 'pointer' : '';
        return true;
      });
    }

    if (!APP.disableDefaultFeatureClick) {
      this.map.on('click', this.onFeatureClick.bind(this));
    }
  }

  // componentWillUpdate (nextProps, nextState) {
  //   if((this.props && this.props.primaryLayer) !== 
  //       (nextProps && nextProps.primaryLayer)) {
  //     this.updateTimeseriesLayers(nextProps);
  //   }
  // }
  onFeatureClick(e) {
    const activeLayers = this.props.layersObj.map(l => l.id)
    const { mapId } = this.props;
    const features = this.map.queryRenderedFeatures(e.point, {
      layers: activeLayers.filter(l => this.map.getLayer(l) !== undefined)
    });
    const feature = features[0];
    if (!feature) return false;
    const activeLayerObj = this.props.layersObj.find((l) => l.id === feature.layer.id);

    if (feature && activeLayerObj['detail-view']) {
      const newZoom = this.map.getZoom() < 7.5 ? 7.5 : this.map.getZoom();
      this.map.easeTo({
        center: e.lngLat,
        zoom: newZoom
      });
      buildDetailView(
        mapId,
        activeLayerObj,
        feature.properties,
        this.props.dispatch,
        this.props.timeSeriesObj
      );
    }
    return true;
  }

  findNextLayer(activelayersData, nextLayer) {
    return activelayersData.find(lo => lo.id === nextLayer);
  }

  setPrimaryLayer(primaryLayer, activeLayerId, layers, activeLayersData, activeLayerIds) {
    const sortedLayers = [];
    activeLayerIds.forEach(id => {
      activeLayersData.forEach(l => {
        if (id === l.id || id === l.parent) {
          sortedLayers.push(l);
        }
      });
    });
    const nextLayerId =  primaryLayer || activeLayerId;
    let nextLayerObj = activeLayersData.find(lo => lo.id === nextLayerId);
    if (nextLayerId && !nextLayerObj && layers[nextLayerId].layers) {
      let nextLayer;
      for (let l = 0; l < layers[nextLayerId].layers.length; l += 1) {
        nextLayer = layers[nextLayerId].layers[l];
        nextLayerObj = this.findNextLayer(activeLayersData, nextLayer);
        if (nextLayerObj) break;
      }
    }
    let map = this.map;
    if (nextLayerObj && nextLayerId) {
      const parentLayer = layers[nextLayerId];
      if (parentLayer.layers) {
        const sublayers = parentLayer.layers;
        if (sublayers) {
          for (let s = 0; s < sublayers.length; s += 1) {
            if (this.map.getLayer(sublayers[s])) {
              this.map.moveLayer(sublayers[s]);
            }
          }
          orderLayers(sortedLayers, map, nextLayerId);
        }
      }
    }

    if (!nextLayerObj) {
      return false;
    }

    // Move the selected primary layer to the top of the map layers
    // let layerObj;
    if (!nextLayerObj.layers && this.map.getLayer(nextLayerId)) {
      this.map.moveLayer(nextLayerId); 
      //move icon with detail view to top of the map layers wip
      if (activeLayersData.find(d => d['detail-view']) && this.map.getLayer(activeLayersData.find(d => d['detail-view']).id)) {
        this.map.moveLayer(activeLayersData.find(d => d['detail-view']).id);
      } 
    }
    // Loop throught all active map layers
    // for (let i = activeLayersData.length - 1; i >= 0; i -= 1) {
    //   layerObj = activeLayersData[i];
      
    //   // If 'layerObj' is not a fill OR the selected primary layer
    //   if (layerObj.type !== 'fill' && layerObj.id === nextLayerId && !layerObj.layers && !layerObj.parent) {
    //     // If 'layerObj' is not the same type as the selected
    //     if (layerObj.type !== nextLayerObj.type) {
    //       // Move 'layerObj' to the top of the map layers
    //       if (this.map.getLayer(layerObj.id)) {
    //         this.map.moveLayer(layerObj.id);
    //       }
    //       if (activeLayersData.find(d => d['detail-view'])
    //        && this.map.getLayer(activeLayersData.find(d => d['detail-view']).id)) {
    //         this.map.moveLayer(activeLayersData.find(d => d['detail-view']).id);
    //       } 

    //     }
    //   }
    // }
    // Order active layers

    orderLayers(sortedLayers, map, nextLayerId);
    const nextlayersObj = activeLayersData.filter(lo => lo.id !== nextLayerId);
    nextlayersObj.push(nextLayerObj);

    this.setState({
      layersObj: nextlayersObj,
    });
    
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

  componentWillReceiveProps(nextProps) {
    if (this.map) {
      this.map.resize();
    }
    const accessToken = nextProps.APP.accessToken;
    let mapConfig = nextProps.APP.mapConfig;
    const isRendered = nextProps.MAP.isRendered;
    const isLoaded = nextProps.MAP.isLoaded;
    const currentStyle = nextProps.MAP.currentStyle;
    const currentRegion = nextProps.MAP.currentRegion;
    const reloadLayers = nextProps.MAP.reloadLayers;
    const activelayersData = nextProps.layersObj;
    const activeLayerIds = nextProps.activeLayerIds;
    const primaryLayer = nextProps.MAP.primaryLayer;
    const activeLayerId = nextProps.MAP.activeLayerId;

    const layers = nextProps.MAP.layers;
    const styles = nextProps.STYLES || [];
    const regions = nextProps.REGIONS;
    const mapId = nextProps.mapId;
    mapConfig.container = mapId
  

    // Check if map is initialized.
    if (!isRendered && (!isIE || mapboxgl.supported()) && !nextProps.MAP.blockLoad) {
      this.initMap(accessToken, mapConfig, mapId);
    }
    // Check if rendererd map has finished loading
    if (isLoaded) {
      // Set current style (basemap)
      styles.forEach((style) => {
        if (style[mapId] && style[mapId].current && this.props.MAP.currentStyle !== currentStyle) {
          this.map.setStyle(style.url);
        }
      });

      // Zoom to current region (center and zoom)
      regions && regions.forEach((region) => {
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
            this.map.addLayer({ ...layer.styleSpec });

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
              if (!this.map.getLayer(highlightLayer.id)) {
                this.map.addLayer(highlightLayer);
              }
            }
          } else if (this.map.getLayer(layer.id) && nextProps.MAP.reloadLayerId === layer.id) {
            // 1) remove layer and source
            let doUpdateTsLayer = true;
            let filterOptions = false;
            this.map.removeLayer(layer.id);
            this.map.removeSource(layer.id);
            // 2) dispatch action to set reloadLayerId to null
            this.props.dispatch(Actions.layerReloaded(mapId));
            const originalLayer = nextProps.FILTER &&
              nextProps.FILTER[layer.id] &&
              nextProps.FILTER[layer.id].isClear ? nextProps.MAP.oldLayerObjs[layer.id] : layer;
            prepareLayer(mapId, originalLayer, this.props.dispatch, filterOptions, doUpdateTsLayer);
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
            addChart(layer, data, this.map, mapId);
          } else {
             $(`.marker-chart-${layer.id}-${mapId}`).remove();
          }
        });
        const intelLayers = []
        activeLayerIds.forEach(id => {
          activelayersData.forEach(l => {
            if (id === l.id | id === l.parent) {
              intelLayers.push(l);
            }
          });
        });
        sortLayers(this.map, (intelLayers || layers), (primaryLayer || activeLayerId));
      }

      if (this.props.MAP.primaryLayer !== primaryLayer) {
        this.setPrimaryLayer(primaryLayer, activeLayerId, layers, activelayersData, activeLayerIds);
        if (layers[primaryLayer] && layers[primaryLayer].location) {
          this.map.easeTo(layers[primaryLayer].location);
        } else {
          if (!Array.isArray(mapConfig.center)) {
            this.map.easeTo({
              center: mapConfig.center,
              zoom: mapConfig.zoom
            });
          } else {
            this.map.easeTo({
              center: {
                "lng": mapConfig.center[0],
                "lat": mapConfig.center[1]
              },
              zoom: mapConfig.zoom
            });
          }
        }
      }
    }
    // Assign global variable for debugging purposes.
    // window.GisidaMap = this.map;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.map) {
      this.map.resize();
      const { layersObj, layerObj, primaryLayer, FILTER, LOC, mapId, timeSeriesObj } = this.props;
      if (LOC && LOC.doUpdateMap === mapId && LOC.location &&
         ((prevProps.LOC.active !== LOC.active) || (prevProps.layersObj.length !== layersObj.length) ||
          (this.map.getZoom() !== LOC.location.zoom && LOC.location.doUpdateLOC))) {
            
        const { bounds, boundsPadding, center, zoom } = LOC.location;
        if (bounds) {
          this.map.fitBounds(bounds, {
            padding: boundsPadding || 0,
            linear: true,
          });
        } else {
          this.map.easeTo({ center, zoom });
        }
        this.props.dispatch(Actions.locationUpdated(mapId));
  
        if (this.props.LOC.location.doUpdateLOC) {
          this.props.dispatch(Actions.toggleMapLocation(LOC.active));
          }
      }
      // Update Timeseries
      const doUpdateTSlayers = this.doUpdateTSlayers(prevProps);
      if (((layerObj && layerObj.aggregate && layerObj.aggregate.timeseries) || timeSeriesObj)
        && (doUpdateTSlayers || (FILTER && FILTER[primaryLayer] && FILTER[primaryLayer].isClear))) {
        this.updateTimeseriesLayers();
      }

      // Update Labels and handle labels visibility at different
      // zoom levels
      this.removeLabels();
      this.handleLabelsOnMapZoom();
    }

    // Update Layer Filters
    if (this.map && this.props.layerObj && this.map.getLayer(this.props.layerObj.id)) {
      const { FILTER, primaryLayer } = this.props;
      if (this.props.MAP.doApplyFilters ||
        (FILTER && FILTER[primaryLayer]
          && !FILTER[primaryLayer].doUpdate
          && prevProps.FILTER[primaryLayer]
          && prevProps.FILTER[primaryLayer].doUpdate)) {
        this.buildFilters();
      }
    }
  }

  componentWillUnmount() {
    const { dispatch, mapId } = this.props;
    const index = window.maps.map(m => m['_container'].id).indexOf(mapId);
    window.maps.splice(index, 1);
    dispatch(Actions.mapRendered(mapId, false));
    dispatch(Actions.mapLoaded(mapId, false));
  }
  

  buildFilters() {
    const { layerObj, mapId } = this.props;
    if (!layerObj || !this.map.getLayer(layerObj.id)) {
      return false
    };

    this.props.dispatch(Actions.filtersUpdated(mapId));
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
    } else if (combinedFilters.length === 1 && combinedFilters[0] === 'all') {
      // if nothing was added to the combined filter array, removal all filters
      this.applyFilters(layerId, null);
    }
  }

  applyFilters(layerId, filters) {
    if (this.map.getLayer(layerId)) {
      this.map.setFilter(layerId, filters);
    }
  }

  doUpdateTSlayers(prevProps) {
    const { timeSeriesObj, timeseries, layersObj } = this.props;

    // if no timeseries object, don't update the timeseries
    if (!timeSeriesObj) {
      return false;
    }

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
        && this.map.getLayoutProperty(layerObj.id, 'visibility') === 'none') {
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

  updateTimeseriesLayers(nextProps) {
    const { timeSeriesObj, timeseries, layersObj, FILTER } = nextProps ?
       nextProps : this.props;
    const timeSeriesLayers = Object.keys(timeseries);

    // determine what the currently timeperiod to see if layers should be hidden
    const currPeriod = timeSeriesObj && timeSeriesObj.period &&
       timeSeriesObj.period[timeSeriesObj.temporalIndex];

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
          temporalIndex, stops, strokeWidthStops,
        } = tsObj;

        index = parseInt(temporalIndex, 10);

        // if (layerObj.type === 'chart') {
          // $(`.marker-chart-${id}-${this.props.mapId}`).remove();
          // this.addChart(layerObj, data);

        // if not a chart, layer is on the map, and layer is visible
        // } else if (this.map.getLayer(id) && layer && layer.visible) {

          // look through the layer periods for a match
          pIndex = timeseries[id].period.indexOf(currPeriod);
          hasData = pIndex !== -1 ? ((FILTER && FILTER[id] && FILTER[id].isClear) || timeseries[id].periodData[currPeriod].hasData) : false;

          // if the layer is in the map and has no period match, hide it
          if (!hasData || pIndex === -1) {

            this.map.setLayoutProperty(layerObj.id, 'visibility', 'none');
            // if layer has a highlight layer, update its visibility too
            if (this.map.getLayer(`${layerObj.id}-highlight`)) {
              this.map.setLayoutProperty(`${layerObj.id}-highlight`, 'visibility', 'none');
            }

          // if the layer is not in the map and does have a match, handle it
          } else if (this.map.getLayer(id) && hasData && pIndex !== -1) {
            // if layer is hidden, reveal it
            if (this.map.getLayoutProperty(id, 'visibility') === 'none') {
              this.map.setLayoutProperty(layerObj.id, 'visibility', 'visible');
              // if layer has a highlight layer, update its visibility too
              if (this.map.getLayer(`${layerObj.id}-highlight`)) {
                this.map.setLayoutProperty(`${layerObj.id}-highlight`, 'visibility', 'visible');
              }
            }

            // if layer has stops, update them
            if (stops && stops[index] !== undefined && stops[index][0][0] !== undefined) {
              defaultValue = layerObj.type === 'circle' ? 0 : 'rgba(0,0,0,0)';
              paintProperty = layerObj.type === 'circle' ? 'circle-radius' : 'fill-color';
              newStops = {
                property: layerObj.categories['vector-prop'] || layerObj.source.join[0],
                stops: stops[index],
                type: 'categorical',
                default: defaultValue,
              };

              if (layerObj.type === 'circle' && (layerObj.categories.color instanceof Array || layerObj.colorStops)) {
                newColorStops = {
                  property: layerObj.categories['vector-prop'] || layerObj.source.join[0],
                  stops: layerObj.stops[0][index],
                  type: 'categorical',
                };
                newStrokeStops = {
                  property: layerObj.categories['vector-prop'] || layerObj.source.join[0],
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
    const labels = timeseries && typeof timeseries[layerObj.id] !== 'undefined'
      ? layerObj.labels.labels[timeseries[layerObj.id].period[timeseries[layerObj.id].temporalIndex]]
      : layerObj.labels.labels;

    if (!labels) {
      return false;
    }

    for (let l = 0; l < labels.length; l += 1) {
      el = document.createElement('div');
      el.className = `map-label label-${id}`;
      el.innerHTML = labels[l].label;
      new mapboxgl.Marker(el, {
        offset: labels[l].offset,
      })
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
    let activeId;
    let id;
    let hasLabel;
    let layerObj;
    let slId;
    const sortedLayers = [];
    if (this.props && this.props.layersObj) {
      for (let a = this.props.activeLayerIds.length - 1; a >= 0; a -= 1) {
        id = this.props.activeLayerIds[a];
        if (this.props.layers[id].layers) {
          for (let sl = 0; sl < this.props.layers[id].layers.length; sl += 1) {
            slId = this.props.layers[id].layers[sl];
            if (this.props.layers[slId].labels) {
              hasLabel = slId;
              break;
            }
          }
          break;
        } else if (!this.props.layers[id].layers && this.props.layers[id] && this.props.layers[id].labels) {
          hasLabel = id;
          break;
        }
      }

      this.props.activeLayerIds.forEach(id => {
        this.props.layersObj
          .filter(d => !d.layers)
          .forEach((l) => {
            if (id === l.id || id === l.parent) {
              sortedLayers.push(l);
            }
          });
      });

       for (let l = 0; l < sortedLayers.length; l += 1) {
         layerObj = sortedLayers[l];
         if (layerObj.labels) {
           minZoom = layerObj.labels.minZoom || layerObj.labels.minzoom || 0;
           maxZoom = layerObj.labels.maxZoom || layerObj.labels.maxzoom || 22;
           isRendered = (document.getElementsByClassName(`label-${layerObj.id}`)).length;
           activeId = layerObj.id || layerObj.parent;
           if ((zoom < minZoom || zoom > maxZoom)) {
             this.removeLabels(`label-${layerObj.id}`);
           } else if (!isRendered && (activeId === this.props.primaryLayer || activeId === hasLabel)) {
             this.addLabels(layerObj, this.props.timeseries);
           }
         }
      }
    }
  }

  render() {
    // todo - move this in to this.props.MAP.sidebarOffset for extensibility
    const { detailView, layerObj, timeSeriesObj, showDetailView } = this.props;
    const join = layerObj && ((layerObj['detail-view'] &&
      layerObj['detail-view'].join) || (layerObj.source && layerObj.source.join));
    let detailViewProps = join && showDetailView &&
      timeSeriesObj &&
      timeSeriesObj.data &&
      timeSeriesObj.data.length &&
      timeSeriesObj.data.find(d => (d.properties || d)[join[1]] === detailView.properties[join[0]]);

    const showDetailViewBool = timeSeriesObj &&
     timeSeriesObj.layerId === this.props.primaryLayer ?
      detailViewProps && typeof detailViewProps !== undefined : this.props.showDetailView;
    let mapWidth = '100%';
    if (this.props.VIEW && this.props.VIEW.splitScreen) {
      mapWidth = this.props.mapId === 'map-1' ? '52%' : '48%';
    }
    if (this.props.showFilterPanel) {
      mapWidth = this.props.mapId === 'map-1' ? `calc(${mapWidth} - 250px)` : '48%';
    }
    if (showDetailViewBool) {
      mapWidth = this.props.mapId === 'map-1' ? `calc(${mapWidth} - 345px)` : '48%';
    }
    return (
      <div>
        {isIE || !mapboxgl.supported() 
          ?
          (
            <div className="alert alert-info">
              Your browser is not supported. Please open link in another browser e.g Chrome or Firefox
            </div>
          ) :
          (
            <div id={this.props.mapId} 
            className = {`${this.props.mapId === 'map-2' && this.props.showFilterPanel ? 'splitScreenClass': ''}` }
            style={{
              width: mapWidth,
              display: this.props.MAP.blockLoad
                || (this.props.VIEW && !this.props.VIEW.showMap)
                ? 'none' : 'inline'
            }} >
              <div className="widgets">
                {/* Render Children elemets with mapId prop added to each child  */}
                {
                  React.Children.map(this.props.children, child => {
                    return React.cloneElement(child, {
                      mapId: this.props.mapId
                    });
                  })
                }
              </div>
            </div>
          )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Map);
