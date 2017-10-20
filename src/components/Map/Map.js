import React, { Component } from 'react';
import { formatNum, getLastIndex } from '../../lib/utils'
import { processNode, generateStops } from 'gisida';

import './Map.css';

const mapboxgl = require('mapbox-gl');

class Map extends Component {

  constructor(props) {
    super(props);
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
        this.addDefaultLayers();
        this.addMousemoveEvent(); 
      });
    }  
  }

  addLayer(layer) {

    const self = this;
    const timefield = (layer.aggregate && layer.aggregate.timeseries) ? layer.aggregate.timeseries.field : '';
    let stops;

    if (layer === undefined) {
      return null;
    }

    if (layer.property) {
      stops = generateStops(layer, timefield);
    }

    if (stops) {
      this.setState({ stops: { stops, id: layer.id } });
      const colorStops = timefield ? stops[0][stops[0].length - 1] : stops[0][0];
      const radiusStops = stops[1][0];
      const stopsData = layer.type === 'circle' ? radiusStops : colorStops;
      const breaks = stops[3];
      const colors = stops[4];
      const currPeriod = stops[2][stops[2].length - 1];
      const currData = layer.source.data.filter(data => data[timefield] === currPeriod);
      const Data = timefield ? currData : layer.source.data;

      this.addLegend(layer, stopsData, Data, breaks, colors);
      this.addLabels(layer, Data);
    } else if (layer.credit && layer.categories.breaks === 'no') {
      this.addLegend(layer);
    }

    /*
     * CIRCLE ==========================================================
     */
    if (layer.type === 'circle') {
      const circleLayer = {
        id: layer.id,
        type: 'circle',
        source: {
          type: layer.source.type,
        },
        layout: {},
        paint: {
          'circle-color': (layer.categories.color instanceof Array && !layer.paint) ?
            {
              property: layer.source.join[0],
              stops: timefield ? stops[0][stops[0].length - 1] : stops[0][0],
              type: 'categorical',
            } :
            layer.categories.color,
          'circle-opacity': 0.8,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': (layer.categories.color instanceof Array && !layer.paint) ?
            {
              property: layer.source.join[0],
              stops: timefield ? stops[5][stops[5].length - 1] : stops[5][0],
              type: 'categorical',
              default: 0,
            } :
            1,
          'circle-stroke-opacity': 1,
        },
      };

      // override from layers.json
      if (layer.paint) {
        circleLayer.paint = layer.paint;
      }

      if (layer.source.data) {
        if (layer.source.type === 'vector') {
          const layerStops = stops ?
            timefield ? stops[1][stops[1].length - 1] : stops[1][0] :
            [[0, 0]];
          circleLayer.paint['circle-radius'] = {
            property: layer.source.join[0],
            stops: layerStops,
            type: 'categorical',
            default: stops ? 0 : 3,
          };
          circleLayer.source.url = layer.source.url;
          circleLayer['source-layer'] = layer.source.layer;
        } else if (layer.source.type === 'geojson') {
          if (stops) {
            circleLayer.paint['circle-radius'] = {
              property: layer.source.join[0],
              stops: stops[1][0],
            };
          }
          circleLayer.source.data = layer.source.data;
        }
      }
      // add filter
      if (layer.filter) {
        circleLayer.filter = layer.filter;
      }

      this.map.addLayer(circleLayer);
    }

    /*
     * FILL ==========================================================
     */
    if (layer.type === 'fill') {
      const fillLayer = {
        id: layer.id,
        type: 'fill',
        source: {
          type: layer.source.type,
        },
        layout: {},
        paint: {
          'fill-color': '#f00',
          'fill-opacity': 0.7,
        },
      };

      // override from layers.json
      if (layer.paint) {
        fillLayer.paint = layer.paint;
      }
      if (layer.source.minzoom) {
        fillLayer.minzoom = layer.source.minzoom;
      }
      if (layer.maxzoom) {
        fillLayer.maxzoom = layer.maxzoom;
      }

      if (!(layer['no-outline'])) {
        fillLayer.paint['fill-outline-color'] = '#fff';
      }

      if (layer.source.type === 'geojson') {
        fillLayer.source.data = layer.source.data;
      } else {
        fillLayer.source.url = layer.source.url;
        fillLayer['source-layer'] = layer.source.layer;
      }

      if (layer.source.data && !layer.paint) {
        const layerStops = timefield ? stops[0][stops[1].length - 1] : stops[0][0];

        fillLayer.paint['fill-color'] = {
          property: layer.source.join[0],
          stops: layerStops,
          type: 'categorical',
          default: 'rgba(0,0,0,0)',
        };
      }
      // add filter
      if (layer.filter) {
        fillLayer.filter = layer.filter;
      }

      this.map.addLayer(fillLayer);
    }

    /*
     * LINE ==========================================================
     */
    if (layer.type === 'line') {
      const lineLayer = {
        id: layer.id,
        type: 'line',
        source: {
          type: layer.source.type,
        },
        layout: {},
        paint: {
          'line-color': '#f00',
          'line-width': 1,
        },
      };
      if (layer.paint) {
        lineLayer.paint = layer.paint;
      }
      if (layer.source.minzoom) {
        lineLayer.minzoom = layer.source.minzoom;
      }
      if (layer.maxzoom) {
        lineLayer.maxzoom = layer.maxzoom;
      }
      if (layer.source.type === 'geojson') {
        lineLayer.source.data = layer.source.data;
      } else {
        lineLayer.source.url = layer.source.url;
        lineLayer['source-layer'] = layer.source.layer;
      }
      this.map.addLayer(lineLayer);
    }

    /*
     * SYMBOL ==========================================================
     */
    if (layer.type === 'symbol') {
      const symbolLayer = {
        id: layer.id,
        type: 'symbol',
        source: {
          type: layer.source.type,
        },
        minzoom: layer.source.minzoom ? layer.source.minzoom : this.props.mapConfig.mapZoom,
        maxzoom: layer.source.maxzoom ? layer.source.maxzoom : 22,
        layout: layer.layout,
        paint: layer.paint,
      };

      // add filter
      if (layer.filter) {
        symbolLayer.filter = layer.filter;
      }

      if (layer.source.type === 'geojson') {
        symbolLayer.source.data = layer.source.data;
      } else {
        symbolLayer.source.url = layer.source.url;
        symbolLayer['source-layer'] = layer.source.layer;
      }

      if (layer.categories && layer.categories.shape) {
        const iconStops = [];
        layer.categories.type.forEach((type, index) => {
          iconStops.push([type, layer.categories.shape[index]]);
        });
        symbolLayer.layout['icon-image'].stops = iconStops;
      }

      this.map.addLayer(symbolLayer);
    }
    /*
     * CHART ==========================================================
     */
    if (layer.type === 'chart') {
      let data = layer.source.data;
      if (timefield) {
        const period = [...new Set(layer.source.data.map(p => p[timefield]))];
        this.setState({ stops: { id: layer.id, period, timefield } });
        data = layer.source.data.filter(d => d[timefield] === period[period.length - 1]);
      }
      this.addChart(layer, data);
    }

    // sort the layers
    self.sortLayers();

    return null;
  }

  addDefaultLayers() {
  }

  addMousemoveEvent() {
  }

  changeStyle(style) {
    const mapLayers = this.props.layers.layers.filter(layer => layer.map === this.props.mapId);
    const layers = mapLayers.map(layer => layer.title);
    const layerProp = [];

    for (let i = 0; i < layers.length; i += 1) {
      const index = getLastIndex(layers, layers[i]);
      if (mapLayers[index].visible === true) {
        layerProp.push(this.state.layersObj.filter(layer => layer.id === layers[i]));
      }
    }

    this.map.setStyle(style);
    this.map.on('style.load', () => {
      layers.forEach((id) => {
        const prop = this.state.layersObj.filter(layer => layer.id === id);
        this.removeLayer(prop[0]);
      });
      for (let j = 0; j < layerProp.length; j += 1) {
        if (!this.map.getSource(layerProp[j][0].id)) {
          this.addLayer(layerProp[j][0]);
        }
      }
    });
    this.setState({ style });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.loaded) {
      this.initMap(nextProps.accessToken, nextProps.mapConfig);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.loaded) {
      this.props.layers.map((layer) => {
        this.addLayer(layer)
      });
    }  
  }

  componentDidMount() {
    this.initMap(this.props.accessToken, this.props.mapConfig);
  }

  render() {
    return (
      <div id='map' />
    );
  }
}

export default Map;
