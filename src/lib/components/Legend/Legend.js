/* eslint-disable no-loop-func */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Actions, formatNum, hexToRgbA, generateStops } from 'gisida';
import { buildLayersObj } from '../../utils';
import Parser from 'html-react-parser';                                                                                                               
import './Legend.scss';

const mapStateToProps = (state, ownProps) => {
  const mapId = ownProps.mapId || 'map-1';
  const MAP = state[ownProps.mapId] || { layers: {}, timeseries: {} }

  return {
    timeseries: MAP.timeseries,
    layers: MAP.layers,
    layerObj: MAP.layers[MAP.activeLayerId],
    timeSeriesObj: MAP.timeseries[MAP.primaryLayer],
    lastLayerSelected: MAP.layers[MAP.lastLayerSelected],
    layersData: buildLayersObj(MAP.layers),
    MAP,
    mapId,
    primaryLayer: MAP.primaryLayer,
    showFilterPanel: MAP.showFilterPanel,
  }
}

export class Legend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      setPrimary: false,
      timeSeriesObj: undefined,
    };
  }

componentWillReceiveProps(nextProps) {
  if(nextProps.layerObj &&
       nextProps.layerObj.aggregate &&
        nextProps.layerObj.aggregate.timeseries) {
    if(nextProps.timeSeriesObj &&
       (this.props.timeSeriesObj !== nextProps.timeSeriesObj)) {
      const { timeSeriesObj, dispatch, layerObj } = nextProps;

      const stops = generateStops(timeSeriesObj,
        timeSeriesObj.layerObj.aggregate.timeseries.field,
        dispatch);
        
        if(timeSeriesObj && timeSeriesObj.layerObj && 
          timeSeriesObj.layerObj.aggregate &&
            timeSeriesObj.layerObj.aggregate.timeseries) {

                timeSeriesObj.newBreaks = stops[3];
                timeSeriesObj.newColors = [...new Set(layerObj.stops[0][0].map(d => d[1]))];
                  this.setState({
                  timeSeriesObj: timeSeriesObj
          })
        }
      }
  }
}
 componentWillUpdate(nextProps, nextState) {
  if(nextProps.layerObj &&
    nextProps.layerObj.aggregate &&
     nextProps.layerObj.aggregate.timeseries) { 
   if (this.props.primaryLayer !== nextProps.primaryLayer ) {
     const { timeSeriesObj, layerObj } = nextProps;
     
     if(timeSeriesObj && timeSeriesObj.layerObj && 
        timeSeriesObj.layerObj.aggregate &&
          timeSeriesObj.layerObj.aggregate.timeseries) {
            const stops = generateStops(timeSeriesObj, 
            timeSeriesObj.layerObj.aggregate.timeseries.field, 
            this.props.dispatch);

            timeSeriesObj.newBreaks = stops[3];
            timeSeriesObj.newColors = [...new Set(layerObj.stops[0][0].map(d => d[1]))];
            
            this.setState({
              timeSeriesObj: nextProps.timeSeriesObj
              });
      }
    }
  }
}
  onUpdatePrimaryLayer(e) {
    e.preventDefault();
    const { dispatch, mapId } = this.props;
    const targetLayer = e.currentTarget.getAttribute('data-layer');
    // dispatch primary layer id
    dispatch(Actions.updatePrimaryLayer(mapId, targetLayer));
  }
 
  render() {
    const { layerObj, mapId, lastLayerSelected,
       timeSeriesObj, timeseries, layers, primaryLayer } = this.props;
    if (!layerObj) {
      return false;
    }

    const legendItems = [];

    let primaryLegend;
    let layer;
    for (let l = 0; l < this.props.layersData.length; l += 1) {
      layer = this.props.layersData[l];
      const circleLayerType = (layer && layer.credit &&
         layer.type === 'circle' && !layer.categories.shape &&
          layer.visible);

      const symbolLayer = (layer && layer.credit && layer.categories &&
         layer.categories.shape && layer.type !== 'circle');

      const fillLayerNoBreaks = (layer && layer.credit && layer.categories &&
         layer.categories.breaks === 'no');

      const fillLayerWithBreaks = (layer && layer.credit &&
         layer.type !== 'chart' && layer.type !== 'circle' &&
          layer.categories && layer.categories.breaks === 'yes');

      const activeLayerSelected = this.props.primaryLayer === layer.id ? 'primary' : '';
      let background = [];

      let uniqueStops;

      const quantiles = [];

      if (timeSeriesObj) {
        const { temporalIndex } = timeSeriesObj;
        if (circleLayerType && layer.breaks && layer.stops && layer.stops[0][temporalIndex]) {
          const currentColorStops = [...new Set(layer.stops[0][temporalIndex].map(d => d[1]))];
          const currentRadiusStops = [...new Set(layer.stops[1][temporalIndex].map(d => d[1]))];
          const currentBreakStops = [...new Set(layer.stops[6][temporalIndex])];

          currentRadiusStops.forEach((s, i) => {
            quantiles.push((
              <span
                className="circle-container"
                key={s}>
                <span
                  style={
                    {
                      background: `${currentColorStops[i]}`,
                      width: `${s * 2}px`,
                      height: `${s * 2}px`,
                      margin: `0px ${currentRadiusStops[i] / 2}px`
                    }
                  }
                ></span>
                <p>{currentBreakStops[i]}</p>
              </span>
            ));
          });
        }
      } else if (circleLayerType && layer.breaks && layer.stopsData &&
         layer.styleSpec && layer.styleSpec.paint) {

        const stopVals = [];
        layer.stopsData.forEach((s) => {
          stopVals.push(s[1]);
        });

        layer.styleSpec.paint['circle-radius'].stops.forEach((s) => {
          stopVals.push(s[1]);
        });

        uniqueStops = [...new Set(stopVals)].sort((a, b) => a - b);

        uniqueStops.forEach((s, i) => {
          quantiles.push((
            <span
              className="circle-container"
              key={s}>
              <span
                style={
                  {
                    background: Array.isArray(layer.categories.color) ? layer.categories.color[i]
                      : layer.stops[4][i],
                    width: `${s * 2}px`,
                    height: `${s * 2}px`,
                    margin: `0px ${i + 2}px`
                  }
                }
              ></span>
              <p>{layer.breaks[i]}</p>
            </span>
          ));
        });
      }

      if ((layerObj.id === layer.id) && (lastLayerSelected && 
        lastLayerSelected.id === layer.id)) {
        if (circleLayerType) {
          primaryLegend = (
            <div
              id={`legend-${layer.id}-${mapId}`}
              className={`legend-shapes legend-row ${activeLayerSelected}`}
              data-layer={`${layer.id}`}
              key={l}
              onClick={(e) => this.onUpdatePrimaryLayer(e)}
            >
              <b>
                {layer.label}
              </b>
              <div className="legend-symbols">
                {quantiles}
              </div>
              <span>{layer.credit}</span>
            </div>);
        }
        if (fillLayerNoBreaks && !layer.parent) {
          debugger
          
          if (layers[primaryLayer].layers) {
            let uls = [];
            let background_grouped = [];

            let subLayers = Object.keys(this.props.timeseries).map(d => {
              const s = timeseries[d];

              if (s.layerObj && s.layerObj.parent) {
                return s
              }
            }).filter((s) => typeof s !== 'undefined');

            if (layers[primaryLayer].layers.length === subLayers.length) {
              subLayers = subLayers.sort((a, b) => {
                return a.index - b.index;
              });

              Object.keys(subLayers).forEach(key => {
                let colors = [...new Set(subLayers[key].colorStops[subLayers[key].temporalIndex].map(
                  d => d[1]))] || subLayers[key].newColors ||
                  subLayers[key].colors;

                let childCredit = subLayers[key].layerObj['child-credit'];
                let lastVal;

                let legendSuffix = subLayers[key].layerObj.categories.suffix ?
                subLayers[key].layerObj.categories.suffix : '';

                let breaks = subLayers[key].newBreaks || subLayers[key].breaks;

                const fillWidth = (100 / colors.filter(c =>
                    c !== "transparent").length).toString();

                const lastBreaks = Math.max(...breaks);
                const layerStops = [...new Set(subLayers[key].colorStops[subLayers[key].temporalIndex].map(
                      d => d[1]))] || subLayers[key].layerObj.stops[4];

                colors && colors.map((color) => {
                  const stopsIndex = layerStops ? layerStops.indexOf(color) : -1;
                    if(stopsIndex !== -1) {
                      const firstVal = stopsIndex ? breaks[stopsIndex - 1] : 0;

                      if (Object.is(colors.length - 1)) {
                        // execute last item logic
                        lastVal = lastBreaks;
                        
                      } else {
                      lastVal = breaks[stopsIndex];
                      }
                    if (color !== "transparent") {
                     background_grouped.push((
                        <li
                          style={{ background: color, width: `${fillWidth}%`}}
                          data-tooltip={`${(typeof formatNum(firstVal, 1) === 'undefined' ? 0 : formatNum(firstVal, 1))}-${(typeof formatNum(lastVal, 1) === 'undefined' ? 0 : formatNum(lastVal, 1))}${legendSuffix}`}
                          >
                        </li>
                      ));
                      }  
                    }
                    });
                  
                    uls.push(
                      <div>
                          <ul>
                            {background_grouped}
                          </ul>
                          <br/>
                          <span>
                            {childCredit}
                          </span>
                      </div>
                      )
                      background_grouped = [];
                 });
              const legendClass = layer.categories ? 'legend-label' : '';

              primaryLegend = (
              <div
                  id={`legend-${layer.id}-${mapId}`}
                  data-layer={`${layer.id}`}
                  onClick={(e) => this.onUpdatePrimaryLayer(e)}
                  key={l}
                >
                 
                <br/>
                <b>
                  {layer.label}
                </b>
                <div className={`legend-fill ${legendClass}`}>
                  {uls}
                </div>
                 
              </div>
                
              );

            }
          } else {
          const fillWidth = (100 / layer.categories.color.filter(c =>
            c !== "transparent").length).toString();

          layer.categories.color.forEach((color, index) => {
            if (color !== "transparent") {
              background.push((
                <li
                  key={index}
                  style={{ background: color, width: `${fillWidth}%` }}>
                  {layer.categories.label[index]}
                </li>
              ));
            }
          });
       
          
          const legendClass = layer.categories ? 'legend-label' : '';

          primaryLegend = (
            <div
              id={`legend-${layer.id}-${mapId}`}
              className={`legend-row ${activeLayerSelected}`}
              data-layer={`${layer.id}`}
              onClick={(e) => this.onUpdatePrimaryLayer(e)}
              key={l}
            >
            <br/>
              <b>
                {layer.label}
              </b>
              <div className={`legend-fill ${legendClass}`}>
                <ul>
                  {background}
                </ul>
              </div>
              <span>
                {Parser(layer.credit)}
              </span>
              <br/>
            </div>
            
            );
          } 
        } if (fillLayerWithBreaks && layer.stops && !layer.parent) {
            
          const { stopsData, breaks} = layer;
          const colorLegend = layer && layer.stopsData && [...new Set(stopsData.map(stop => stop[1]))];
          const legendSuffix = layer.categories.suffix ? layer.categories.suffix : '';
          
          let activeColors;
          let stopsBreak;

          //add activeColors  fallback colors for timeseries layers
          if (layerObj && layerObj.aggregate && layerObj.aggregate.timeseries) {
            // colors
            console.log("timeSeriesObj", timeSeriesObj && timeSeriesObj.newColors);
            activeColors = (timeSeriesObj && timeSeriesObj.newColors) ||

             (this.state && this.state.timeSeriesObj &&
               this.state.timeSeriesObj.newColors) || 
             (timeSeriesObj && timeSeriesObj.stops && timeSeriesObj.stops[timeSeriesObj]

              && [...new Set(timeSeriesObj.stops[timeSeriesObj.temporalIndex].map(d => d[1]))])
               || layer.colors;
            
              // breaks
            stopsBreak = (timeSeriesObj && timeSeriesObj.newBreaks) || 

              (this.state && this.state.timeSeriesObj && 
                this.state.timeSeriesObj.newBreaks) || 

                (layerObj && layerObj.stops && layerObj.stops[3]);

          } else {
            /*non-timeseries layer 
            color */
            activeColors = (layerObj && layerObj.colorStops &&
               [...new Set(layerObj.colorStops.map(d => d[1]))]) || layerObj.colors;
            //breaks
            stopsBreak = (layerObj && layerObj.stops
               && [...new Set(layerObj.stops[6][0])]) ||
               (layerObj && layerObj.breaks);
          }
           let lastVal; 
          if (colorLegend && colorLegend.includes('transparent') && !(activeColors).includes('transparent')) {
            activeColors.splice(0, 0, 'transparent');
            breaks.splice(1, 0, breaks[0]);
          }
          const lastBreaks = Math.max(...stopsBreak);
          const layerStops = [...new Set(layerObj.stops[0][0].map(d => d[1]))] ||
            layerObj.colors

          activeColors.forEach((color, index, activeColors) => {
            const stopsIndex = layerStops ? layerStops.indexOf(color) : -1;
            if (stopsIndex !== -1) {
              const firstVal = stopsIndex ? stopsBreak[stopsIndex - 1] : 0;
            
              if (Object.is(activeColors.length - 1, index)) {
                // execute last item logic
                lastVal = lastBreaks;

              } else {
                lastVal = stopsBreak[stopsIndex];
              }
              console.log(color);
              background.push((
                <li
                  key={index}
                  className={`background-block-${layer.id}-${mapId}`}
                  data-tooltip={`${(typeof formatNum(firstVal, 1) === 'undefined' ? 0 : formatNum(firstVal, 1))}-${(typeof formatNum(lastVal, 1) === 'undefined' ? 0 : formatNum(lastVal, 1))}${legendSuffix}`}
                  style={{ background: hexToRgbA(color, 0.9).toString(), width: (100 / activeColors.length) + '%' }}
                >
                </li>
              ));
            }
          });

          primaryLegend = (
            <div
              id={`legend-${layer.id}-${mapId}`}
              className={`legend-row ${activeLayerSelected}`}
              data-layer={`${layer.id}`}
              key={l}
              onClick={(e) => this.onUpdatePrimaryLayer(e)}
            >
              <b>
                {layer.label}
              </b>
              <ul
                className="legend-limit"
                style={{ padding: '0% 0% 3% 0%' }}
              >
                <li
                  id={`first-limit-${layer.id}`}
                  className={`${mapId}`}
                  style={{ position: 'absolute', listStyle: 'none', display: 'inline', left: '3%' }}
                >
                  {0}
                  {legendSuffix}
                </li>
                <li
                  id={`last-limit-${layer.id}`}
                  className={`${mapId}`}
                  style={{ position: 'absolute', listStyle: 'none', display: 'inline', right: '3%' }}
                >
                  {typeof formatNum(lastVal, 1) === 'undefined' ? 0 : formatNum(lastVal, 1)}
                  {legendSuffix}
                </li>
              </ul>
              <div
                className="legend-fill"
              >
                <ul
                  id="legend-background"
                >
                  {background}
                </ul>
              </div>
              <span>{Parser(layer.credit)}</span>
            </div>
            );
          // }
        }
        continue;
      }

      if (circleLayerType) {
        legendItems.unshift((
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-shapes legend-row ${activeLayerSelected}`}
            data-layer={`${layer.id}`}
            key={l}
            onClick={(e) => this.onUpdatePrimaryLayer(e)}
          >
            <b>
              {layer.label}
            </b>
            <div className="legend-symbols">
              {quantiles}
            </div>
            <span>{layer.credit}</span>
          </div>
        ));

      } else if (symbolLayer) {
        layer.categories.color.forEach((color, index) => {
          const style = layer.categories.shape[index] === 'triangle-stroked-11' ||
            layer.categories.shape[index] === 'triangle-15' ?
            'border-bottom-color:' : 'background:';
          const styleString = `${style}: ${color}`;
          background += (
            <li
              className="layer-symbols"
              key={index}
            >
              <span
                className={`${layer.categories.shape[index]}`}
                style={{ styleString }}
              />
              {layer.categories.label[index]}
            </li>
          );
        });

        legendItems.unshift((
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-row ${activeLayerSelected}`}
            data-layer={`${layer.id}`}
            onClick={(e) => this.onUpdatePrimaryLayer(e)}
            key={l}
          >
            <b>
              {layer.label}
            </b>
            <div className="legend-shapes">
              <ul style={{ left: '0' }}>
                {background}
              </ul>
            </div>
            <span>
              {Parser(layer.credit)}
            </span>
          </div>
        ));

      } else if (fillLayerNoBreaks && !layer.parent) {
        debugger
        
          if (layers[primaryLayer].layers && layerObj.id === layer.id) {
            let uls = [];
            let background_grouped = [];
            let subLayers = Object.keys(this.props.timeseries).map(d => {
              const s = timeseries[d];
              if (s.layerObj && s.layerObj.parent) {
                return s
              }
            }).filter((s) => typeof s !== 'undefined');

            if (layers[primaryLayer].layers.length === subLayers.length) {
              subLayers = subLayers.sort((a, b) => {
                return a.index - b.index;
              });

              Object.keys(subLayers).forEach(key => {
                let colors = [...new Set(subLayers[key].colorStops[subLayers[key].temporalIndex].map(
                  d => d[1]))] || subLayers[key].newColors ||
                  subLayers[key].colors;

                let childCredit = subLayers[key].layerObj['child-credit'];
                let lastVal;

                let legendSuffix = subLayers[key].layerObj.categories.suffix ?
                subLayers[key].layerObj.categories.suffix : '';

                let breaks = subLayers[key].newBreaks || subLayers[key].breaks;
                const fillWidth = (100 / colors.filter(c =>
                    c !== "transparent").length).toString();

                const lastBreaks = Math.max(...breaks);
                const layerStops = [...new Set(subLayers[key].colorStops[subLayers[key].temporalIndex].map(
                      d => d[1]))] || subLayers[key].layerObj.stops[4];

                colors && colors.map((color) => {
                  const stopsIndex = layerStops ? layerStops.indexOf(color) : -1;
                    
                  if(stopsIndex !== -1) {
                      const firstVal = stopsIndex ? breaks[stopsIndex - 1] : 0;

                      if (Object.is(colors.length - 1)) {
                        // execute last item logic if colors are few than breaks
                        lastVal = lastBreaks;
                        
                      } else {
                      lastVal = breaks[stopsIndex];
                      }
                    if (color !== "transparent") {
                     background_grouped.push((
                        <li
                          style={{ background: color, width: `${fillWidth}%`}}
                          data-tooltip={`${(typeof formatNum(firstVal, 1) === 'undefined' ? 0 : formatNum(firstVal, 1))}-${(typeof formatNum(lastVal, 1) === 'undefined' ? 0 : formatNum(lastVal, 1))}${legendSuffix}`}
                          >
                        </li>
                      ));
                      }  
                    }
                    });
                  
                    uls.push(
                      <div>
                          <ul>
                            {background_grouped}
                          </ul>
                          <br/>
                          <span>
                            {childCredit}
                          </span>
                      </div>
                      )
                      background_grouped = [];
                 });
              const legendClass = layer.categories ? 'legend-label' : '';

              legendItems.unshift((
                <div
                    id={`legend-${layer.id}-${mapId}`}
                    data-layer={`${layer.id}`}
                    onClick={(e) => this.onUpdatePrimaryLayer(e)}
                    key={l}
                  >
                      <br/>
                      <b>
                        {layer.label}
                      </b>
                      <div className={`legend-fill ${legendClass}`}>
                        {uls}
                      </div>
                </div>
               ));

            }
          }
        else {
        const fillWidth = (100 / layer.categories.color.filter(c =>
          c !== "transparent").length).toString();

        layer.categories.color.forEach((color, index) => {
          if (color !== "transparent") {
            background.push((
              <li
                key={index}
                style={{ background: color, width: `${fillWidth}%` }}>
                {layer.categories.label[index]}
              </li>
            ));
          }
        });

        const legendClass = layer.categories ? 'legend-label' : '';
        legendItems.unshift((
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-row ${activeLayerSelected}`}
            data-layer={`${layer.id}`}
            onClick={(e) => this.onUpdatePrimaryLayer(e)}
            key={l}
          >
            <b>
              {layer.label}
            </b>
            <div className={`legend-fill ${legendClass}`}>
              <ul>
                {background}
              </ul>
            </div>
            <span>
              {Parser(layer.credit)}
            </span>
          </div>
        ));
      }
    } else if (fillLayerWithBreaks && layer.stops && !layer.parent) {
        const { stopsData, breaks, colors} = layer;
        const colorLegend = [...new Set(stopsData.map(stop => stop[1]))];
        const legendSuffix = layer.categories.suffix ? layer.categories.suffix : '';
        let activeColors;
        let stopsBreak;
        //add activeColors  fallback colors for timeseries layers
        if (layerObj && layerObj.aggregate && layerObj.aggregate.timeseries) {
          // colors
          activeColors = (timeSeriesObj && timeSeriesObj.newColors) ||

           (this.state && this.state.timeSeriesObj &&
             this.state.timeSeriesObj.newColors) || 
           (timeSeriesObj && timeSeriesObj.stops && timeSeriesObj.stops[timeSeriesObj]

            && [...new Set(timeSeriesObj.stops[timeSeriesObj.temporalIndex].map(d => d[1]))])
             || layer.colors;
          
            // breaks
          stopsBreak = (timeSeriesObj && timeSeriesObj.newBreaks) || 

            (this.state && this.state.timeSeriesObj && 
              this.state.timeSeriesObj.newBreaks) || 

              (layerObj && layerObj.stops && layerObj.stops[3]);

        } else {
          /*non-timeseries layer 
          color */
          activeColors = (layerObj && layerObj.colorStops &&
             [...new Set(layerObj.colorStops.map(d => d[1]))]) ||
              (layerObj.colors) || colors;
          //breaks
          stopsBreak = (layerObj && layerObj.stops
             && [...new Set(layerObj.stops[6][0])]) ||
             (layerObj && layerObj.breaks) || breaks;
        }
         let lastVal; 
          if (colorLegend && colorLegend.includes('transparent') &&
          !(activeColors).includes('transparent')) {
            
            activeColors.splice(0, 0, 'transparent');
            breaks.splice(1, 0, breaks[0]);
          }
        activeColors.forEach((color, index) => {
          const stopsIndex = layerObj.stops ? layerObj.stops[4].indexOf(color) : -1;

          if (stopsIndex !== -1) {
            const firstVal = stopsIndex ? stopsBreak[stopsIndex - 1] : 0;
            lastVal = stopsBreak[stopsIndex];
            background.push((
              <li
                key={index}
                className={`background-block-${layer.id}-${mapId}`}
                data-tooltip={`${typeof formatNum(firstVal, 1) === 'undefined' ? 0 : formatNum(firstVal, 1)}-${typeof formatNum(lastVal, 1) === 'undefined' ? 0 : formatNum(lastVal, 1)}${legendSuffix}`}
                style={{ background: hexToRgbA(color, 0.9).toString(), width: (100 / activeColors.length) + '%' }}
              >
              </li>
            ));
          }
        });

        legendItems.unshift((
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-row ${activeLayerSelected}`}
            data-layer={`${layer.id}`}
            key={l}
            onClick={(e) => this.onUpdatePrimaryLayer(e)}
          >
            <b>
              {layer.label}
            </b>
            <ul
              className="legend-limit"
              style={{ padding: '0% 0% 3% 0%' }}
            >
              <li
                id={`first-limit-${layer.id}`}
                className={`${mapId}`}
                style={{ position: 'absolute', listStyle: 'none', display: 'inline', left: '3%' }}
              >
                {0}
                {legendSuffix}
              </li>
              <li
                id={`last-limit-${layer.id}`}
                className={`${mapId}`}
                style={{ position: 'absolute', listStyle: 'none', display: 'inline', right: '3%' }}
              >
                {typeof formatNum(lastVal, 1) === 'undefined' ? 0 : formatNum(lastVal, 1)}
                {legendSuffix}
              </li>
            </ul>
            <div
              className="legend-fill"
            >
              <ul
                id="legend-background"
              >
                {background}
              </ul>
            </div>
            <span>{Parser(layer.credit)}</span>
          </div>
          ));
        // } 
      }
      else {

      }
    }
    legendItems.unshift(primaryLegend);

    return (
      <div>
        <div
          className={`legend ${mapId}`}
          style={{ right: this.props.showFilterPanel ? '30px' : '20px' }}>
          {legendItems}
        </div>
      </div>
    );
  }
}

Legend.propTypes = {
  layerObj: PropTypes.objectOf(PropTypes.any),
  layersData: PropTypes.arrayOf(PropTypes.any).isRequired,
  MAP: PropTypes.objectOf(PropTypes.any).isRequired,
  primaryLayer: PropTypes.string.isRequired,
  timeSeriesObj: PropTypes.objectOf(PropTypes.any),
};

export default connect(mapStateToProps)(Legend);
