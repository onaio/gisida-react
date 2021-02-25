/* eslint-disable no-loop-func */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Actions, formatNum, hexToRgbA, generateStops } from 'gisida';
import { buildLayersObj, isCircleLayer, isFillLayerNoBreaks, isFillLayerWithBreaks, isSymbolLayer } from '../../utils';
import { buildTimestamp, buildHyperLink, buildDescription, combinedLinks } from '../Legend/Utils';
import Parser from 'html-react-parser';
import './Legend.scss';

const mapStateToProps = (state, ownProps) => {
  const { hasNavBar } = ownProps;
  const mapId = ownProps.mapId || 'map-1';
  const MAP = state[ownProps.mapId] || { layers: {}, timeseries: {} };
  const APP = state['APP'];
  let subLayerCheck =
    MAP.primaryLayer === MAP.layers &&
    MAP.layers[MAP.primarySubLayer] &&
    MAP.layers[MAP.primarySubLayer].parent
      ? MAP.primarySubLayer
      : null;

  return {
    LOC: state.LOC,
    APP,
    timeseries: MAP.timeseries,
    layerObj: MAP.layers[MAP.primaryLayer],
    timeSeriesObj: MAP.timeseries[subLayerCheck || MAP.primaryLayer],
    lastLayerSelected: MAP.layers[MAP.lastLayerSelected],
    layersData: buildLayersObj(MAP.layers),
    MAP,
    mapId,
    activeLayerIds: MAP.activeLayerIds,
    layers: MAP.layers,
    primaryLayer: MAP.primaryLayer,
    showFilterPanel: MAP.showFilterPanel,
    primarySubLayer: MAP.primarySubLayer,
    mapStateToUrl: APP.mapStateToUrl,
    hasNavBar,
  };
};

export class Legend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      setPrimary: false,
      primaryLayer: this.props.primaryLayer,
      timeSeriesObj: undefined,
    };
  }
  shouldComponentUpdate(nextProps) {
    const { layerObj, timeSeriesObj } = nextProps;
    /**
     * Update component when categories are built and the nextprops layerobj don't 
     * match current props layerObj same for the timeseriesObj
     * Not certain why this work in some cases when checking for activelayerIds alone
     * Check if activelayerIds has changed too
     */
    return ((
      (layerObj && layerObj.categories)) &&
      layerObj !== this.props.layerObj) ||
      ((
        (timeSeriesObj && timeSeriesObj.categories)) &&
        timeSeriesObj !== this.props.timeSeriesObj) ||
      (this.props.activeLayerIds &&
        this.props.activeLayerIds.length !== nextProps.activeLayerIds &&
        nextProps.activeLayerIds.length)
      ? true
      : false;
  }
  componentWillReceiveProps(nextProps) {
    const { layerObj } = nextProps;
    /** generate stops if timeseriesObj has been updated */
    if (
      nextProps.timeSeriesObj &&
      this.props.timeSeriesObj !== nextProps.timeSeriesObj &&
      layerObj &&
      layerObj.type !== 'chart' &&
      layerObj.property
    ) {
      const { timeSeriesObj, dispatch } = nextProps;
      const stops = generateStops(
        timeSeriesObj,
        timeSeriesObj.layerObj.aggregate.timeseries.field,
        dispatch,
        timeSeriesObj.temporalIndex
      );
      if (
        timeSeriesObj &&
        timeSeriesObj.layerObj &&
        timeSeriesObj.layerObj.aggregate &&
        timeSeriesObj.layerObj.aggregate.timeseries
      ) {
        timeSeriesObj.newBreaks = stops[3];
        timeSeriesObj.newColors = [
          ...new Set(timeSeriesObj.colorStops[timeSeriesObj.temporalIndex].map(d => d[1])),
        ];
        this.setState({
          timeSeriesObj: timeSeriesObj,
        });
      }
    }
  }
  componentWillUpdate(nextProps) {
    const { layerObj } = nextProps;
    if (
      this.props.primaryLayer !== nextProps.primaryLayer &&
      layerObj &&
      layerObj.type !== 'chart' &&
      layerObj.property
    ) {
      const { timeSeriesObj } = nextProps;

      if (
        timeSeriesObj &&
        timeSeriesObj.layerObj &&
        timeSeriesObj.layerObj.aggregate &&
        timeSeriesObj.layerObj.aggregate.timeseries
      ) {
        const stops = generateStops(
          timeSeriesObj,
          timeSeriesObj.layerObj.aggregate.timeseries.field,
          this.props.dispatch,
          timeSeriesObj.temporalIndex
        );

        timeSeriesObj.newBreaks = stops[3];
        timeSeriesObj.newColors = [
          ...new Set(timeSeriesObj.colorStops[timeSeriesObj.temporalIndex].map(d => d[1])),
        ];
        /**
         * Set the next timeseriesObj to state
         */
        this.setState({
          timeSeriesObj: nextProps.timeSeriesObj,
        });
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { primaryLayer, layers } = this.props;
    if (
      primaryLayer !== prevProps.primaryLayer &&
      layers &&
      layers[primaryLayer] &&
      layers[primaryLayer].credit
    ) {
      this.setState({
        primaryLayer: primaryLayer,
      });
    }
  }
  /**
   * Handler responsible for closing the Legend and toggling off the layer 
   * @param {event} 
   */
  onCloseClick(e) {
    e.stopPropagation();
    const targetLayer = e.target.getAttribute('data-close-layer');
    const { mapId, layer, layerObj } = this.props;
    this.props.dispatch(Actions.toggleLayer(mapId, targetLayer || layerObj.id || layer.id));
  }
  /**
   * Works in the event many layers have been selected on the map.
   * Allows switching primary layer in a stacked fashion 
   * @param {event} e 
   */
  onUpdatePrimaryLayer(e) {
    if (
      e.target.getAttribute('data-download') !== 'download' &&
      e.target.getAttribute('data-link') !== 'resourceLink' &&
      e.target.getAttribute('data-credit') !== 'credit'
    ) {
      e.preventDefault();
    }
    const { dispatch, mapId } = this.props;
    const targetLayer = e.currentTarget.getAttribute('data-layer');
    /** Update primary layer based on legend selection */
    // Move to utils
    const removeJsonExtensions = layer => {
      return layer.replace('.json', '');
    };
    const targetLayerPageUrl = removeJsonExtensions(targetLayer);
    if (this.props.mapStateToUrl) {
      let pageURL = `${window.location.href.replace(
        `${targetLayerPageUrl},`,
        ''
      )},${targetLayerPageUrl}`;

      history.replaceState('', '', pageURL);
    }
    // dispatch primary layer id
    dispatch(Actions.updatePrimaryLayer(mapId, targetLayer));
  }

  
  render() {
    const {
      layerObj,
      mapId,
      lastLayerSelected,
      timeSeriesObj,
      layers,
      primaryLayer,
      activeLayerIds,
      mapStateToUrl
    } = this.props;

    if (!layerObj) {
      return false;
    }
    let latestTimestamp;
    /** Build timestamp */
    latestTimestamp = buildTimestamp(layerObj);
    const legendDescription = layerObj['legendDescription'] ? buildDescription(layerObj) : null;
    const legendItems = [];
    latestTimestamp = latestTimestamp ? <span>Timestamp: {latestTimestamp}</span> : null;
    const legendLink = combinedLinks(legendDescription);
    let primaryLegend;
    let layer;
    let exportLink = (
      <a
        className="glyphicon glyphicon-download-alt"
        data-download="download"
        target="_blank"
        href={layerObj.exportLink}
        download
      ></a>
    );
    let activeLegendLayer;
    for (let a = activeLayerIds.length - 1; a >= 0; a -= 1) {
      if (layers[activeLayerIds[a]] && layers[activeLayerIds[a]].credit) {
        activeLegendLayer = activeLayerIds[a];
        break;
      }
    }

    if (
      this.state.primaryLayer !== primaryLayer &&
      layers[primaryLayer] &&
      layers[primaryLayer].credit
    ) {
      activeLegendLayer = primaryLayer;
    }
    const legendLayers = this.props.layersData.filter(
      layer =>
        isCircleLayer(layer) ||
        isSymbolLayer(layer) ||
        isFillLayerNoBreaks(layer) ||
        isFillLayerWithBreaks(layer)
    );

    for (let l = 0; l < this.props.layersData.length; l += 1) {
      layer = this.props.layersData[l];
      const circleLayerType = isCircleLayer(layer);
      const symbolLayer = isSymbolLayer(layer);
      const fillLayerNoBreaks = isFillLayerNoBreaks(layer);
      const fillLayerWithBreaks = isFillLayerWithBreaks(layer);
      const multipleLegends = layer && layer.credit && Array.isArray(layer.categories);
      const activeLayerSelected = activeLegendLayer === layer.id ? 'primary' : '';

      let background = [];

      let uniqueStops;

      const quantiles = [];
      const rightListLimitStyle = {
        position: 'absolute',
        listStyle: 'none',
        display: 'inline',
        right: '3%',
      };
      const leftListLimitStyle = {
        position: 'absolute',
        listStyle: 'none',
        display: 'inline',
        left: '3%',
      };
      const legendLimitStyle = { padding: '0% 0% 3% 0%' };
      if (timeSeriesObj) {
        const { temporalIndex } = timeSeriesObj;
        if (circleLayerType && layer.breaks && layer.stops && layer.stops[0][temporalIndex]) {
          const currentColorStops = [...new Set(layer.stops[0][temporalIndex].map(d => d[1]))];
          const currentRadiusStops = [...new Set(layer.stops[1][temporalIndex].map(d => d[1]))];
          const currentBreakStops = [...new Set(layer.stops[6][temporalIndex])];
          currentRadiusStops.forEach((s, i) => {
            quantiles.push(
              <span className="circle-container" key={s}>
                <span
                  style={{
                    background: `${currentColorStops[i] || currentColorStops[0]}`,
                    width: `${s * 2}px`,
                    height: `${s * 2}px`,
                    margin: `0px ${currentRadiusStops[i] / 2}px`,
                  }}
                ></span>
                <p>{currentBreakStops[i]}</p>
              </span>
            );
          });
        }
      } else if (
        circleLayerType &&
        layer.breaks &&
        layer.stopsData &&
        layer.styleSpec &&
        layer.styleSpec.paint
      ) {
        const breaks = [...new Set(layer.breaks)];
        const colors = [...new Set(layer.colorStops.map(d => d[1]))];

        uniqueStops = [...new Set(layer.stopsData.map(d => d[1]))];
        uniqueStops.forEach((s, i) => {
          quantiles.push(
            <span className="circle-container" key={s}>
              <span
                style={{
                  background: Array.isArray(layer.categories.color)
                    ? layer.categories.color[i]
                    : colors[i] || colors[0] || colors,
                  width: `${s * 2}px`,
                  height: `${s * 2}px`,
                  margin: `0px ${i + 2}px`,
                }}
              ></span>
              <p>{breaks[i]}</p>
            </span>
          );
        });
      }
      if (lastLayerSelected && lastLayerSelected.id === layer.id) {
        if (circleLayerType) {
          primaryLegend = (
            <div
              id={`legend-${layer.id}-${mapId}`}
              className={`legend-shapes legend-row ${activeLayerSelected}`}
              data-layer={`${layer.id}`}
              key={l}
              onClick={e => this.onUpdatePrimaryLayer(e)}
            >
              <span
                onClick={e => this.onCloseClick(e)}
                data-close-layer={`${layer.id}`}
                className="glyphicon glyphicon-remove close"
              ></span>
              <b>{layer.label}</b>
              <div className="legend-symbols">{quantiles}</div>
              <span>{Parser(layer.credit)}</span>
              {layerObj.exportLink ? exportLink : ''}
              {legendLink}
              {latestTimestamp}
            </div>
          );
        }
        if (fillLayerNoBreaks && !layer.parent) {
          let hasShape;
          hasShape = layer.categories && layer.categories.shape && layer.categories.shape.length;
          const shapeAndBar = layer.categories && layer.categories.shapeAndBar;
          const fillWidth = (
            100 / layer.categories && layer.categories.color && layer.categories.color.filter(c => c !== 'transparent').length
          ).toString();
          const textColor = layer.categories && layer.categories['text-color'];
          /**
           * Add multiple shapes and labels
           */
          if (layer.categories.labelShape) {
          layer.categories.labelShape.forEach((labelShape, index) => {
            background.push(
              <li className="layer-symbols" key={index}>
                {labelShape.shape ? (
                  <img
                    className="legend-icon"
                    src={`/assets/img/${labelShape.shape}.svg`}
                  />
                ) : null}
                {labelShape.label}
              </li>
            );
            if (labelShape.break) {
              background.push(<hr/>);
            }
          });
        } else {
          layer.categories.color.forEach((color, index) => {
            const showBoth = shapeAndBar && shapeAndBar.length && shapeAndBar[index] === 'yes';
            if (color !== 'transparent') {
              if (showBoth && hasShape) {
                background.push(
                  <li className="layer-symbols" key={index}>
                    {layer.categories.img ? (
                      <img
                        className="legend-icon"
                        src={`/assets/img/${layer.categories.shape[index]}.svg`}
                      />
                    ) : null}
                    <ul className="legend bar-color" key={index}>
                      <li
                        style={{
                          background: color,
                          color: textColor ? textColor : '#fff',
                          width: `${fillWidth}%`,
                        }}
                      >
                        {layer.categories.label[index]}
                      </li>
                    </ul>
                  </li>
                );
              } else if (hasShape && !showBoth) {
                background.push(
                  <li className="layer-symbols" key={index}>
                    {layer.categories.img ? (
                      <img
                        className="legend-icon"
                        src={`/assets/img/${layer.categories.shape[index]}.svg`}
                      />
                    ) : null}
                    {layer.categories.label[index]}
                  </li>
                );
              } else {
                background.push(
                  <li
                    key={index}
                    style={{
                      background: color,
                      color: textColor ? textColor : '#fff',
                      width: `${fillWidth}%`,
                    }}
                  >
                    {layer.categories.label[index]}
                  </li>
                );
              }
            }
          }); 
        }
          const legendClass = layer.categories ? 'legend-label' : '';
          const circleQuantiles = quantiles ? (
            <div className="legend-symbols">{quantiles}</div>
          ) : null;

          primaryLegend = (
            <div
              id={`legend-${layer.id}-${mapId}`}
              className={`legend-shapes legend-row ${activeLayerSelected}`}
              data-layer={`${layer.id}`}
              onClick={e => this.onUpdatePrimaryLayer(e)}
              key={l}
            >
              <span
                onClick={e => this.onCloseClick(e)}
                data-close-layer={`${layer.id}`}
                className="glyphicon glyphicon-remove close"
              ></span>
              <b>{layer.label}</b>
              <div className={`${hasShape || layer.categories.labelShape ? 'legend-shapes' : 'legend-fill'} ${legendClass}`}>
                <ul>{background}</ul>
              </div>
              {circleQuantiles}
              <span>{Parser(layer.credit)}</span>
              {legendLink}
              {latestTimestamp}
            </div>
          );
        }
        if (multipleLegends && !layer.parent) {
          /**
           * This block implements multiple legends on the same layer
           */
          /**
           * fillCredit Builds credit text for fill legends
           * circleCredit Builds credit text for circle legends
           * circleTitle Builds Title for the circle legend
           */
          let fillCredit = null;
          let circleCredit = null;
          let circleTitle;
          if (Array.isArray(layer.categories)) {
            layer.categories.forEach((category, key) => {
              let textColor = category['text-color'];
              if (category.type === 'fill') {
                if (category.credit) {
                  fillCredit = Parser(category.credit);
                }
                let fillWidth = (
                  100 / category.color.filter(c => c !== 'transparent').length
                ).toString();
                category.color.forEach((color, index) => {
                  background.push(
                    <li
                      key={index}
                      style={{
                        background: color,
                        color: textColor ? textColor : '#fff',
                        width: `${fillWidth}%`,
                      }}
                    >
                      {category.label[index]}
                    </li>
                  );
                });
              } else if (category.type === 'circle') {
                /** Get this from spec
                 * Get the specific radiuses and the right values for the same
                 */
                if (category.credit) {
                  circleCredit = Parser(category.credit);
                }
                if (category.title) {
                  circleTitle = category.title;
                }
                category.radiuses.forEach((s, i) => {
                  quantiles.push(
                    <span className="circle-container" key={s}>
                      <span
                        style={{
                          background: Array.isArray(category.color)
                            ? category.color[i]
                            : colors[i] || colors[0],
                          width: `${s * 2}px`,
                          height: `${s * 2}px`,
                          margin: `0px ${i + 2}px`,
                        }}
                      ></span>
                      <p style={{ color: textColor ? textColor : '#fff' }}>{category.label[i]}</p>
                    </span>
                  );
                });
              }
            });
          }
          const legendClass = layer.categories ? 'legend-label' : '';
          const circleQuantiles = quantiles ? (
            <div className="legend-symbols">{quantiles}</div>
          ) : null;

          primaryLegend = (
            <div
              id={`legend-${layer.id}-${mapId}`}
              className={`legend-shapes legend-row ${activeLayerSelected}`}
              data-layer={`${layer.id}`}
              onClick={e => this.onUpdatePrimaryLayer(e)}
              key={l}
            >
              <span
                onClick={e => this.onCloseClick(e)}
                data-close-layer={`${layer.id}`}
                className="glyphicon glyphicon-remove close"
              ></span>
              <b>{layer.label}</b>
              <div className={`${'legend-fill'} ${legendClass}`}>
                <ul>{background}</ul>
              </div>
              {fillCredit}
              <b>{circleTitle}</b>
              {circleQuantiles}
              {circleCredit}
              <span>{Parser(layer.credit)}</span>
              {layerObj.exportLink ? exportLink : ''}
              {legendLink}
              {latestTimestamp}
            </div>
          );
        }
        if (fillLayerWithBreaks && layer.stops && !layer.parent) {
          const { stopsData, breaks } = layer;
          const colorLegend = layer &&
            layer.stopsData && [...new Set(stopsData.map(stop => stop[1]))];
          const legendSuffix = layer.categories.suffix ? layer.categories.suffix : '';
          const activeColors =
            timeSeriesObj && timeSeriesObj.newColors
              ? timeSeriesObj.newColors
              : timeSeriesObj &&
                timeSeriesObj.newColors &&
                layerObj.aggregate &&
                layerObj.aggregate.timeseries
              ? timeSeriesObj.newColors
              : this.state &&
                this.state.timeSeriesObj &&
                layerObj &&
                layerObj.aggregate &&
                layerObj.aggregate.timeseries
              ? this.state.timeSeriesObj.newColors
              : layerObj && layerObj.stops && layerObj.stops[0] && layerObj.stops[0][0]
              ? [...new Set(layerObj.stops[0][0].map(d => d[1]))]
              : layer.colors;

          if (
            colorLegend &&
            colorLegend.includes('transparent') &&
            !activeColors.includes('transparent')
          ) {
            activeColors.splice(0, 0, 'transparent');
            breaks.splice(1, 0, breaks[0]);
          }
          let lastVal;
          const stopsBreak =
            timeSeriesObj &&
            timeSeriesObj.newBreaks &&
            layerObj.aggregate &&
            layerObj.aggregate.timeseries
              ? timeSeriesObj.newBreaks
              : layers[primaryLayer].layers
              ? layerObj && layerObj.categories && layerObj.categories.breaks
              : layer.breaks;

          const lastBreaks = Math.max(...stopsBreak);
          const layerStops =
            timeSeriesObj &&
            timeSeriesObj.stops &&
            layerObj &&
            layerObj.aggregate &&
            layerObj.aggregate.timeseries
              ? [...new Set(timeSeriesObj.stops[timeSeriesObj.temporalIndex].map(d => d[1]))]
              : layerObj && layerObj.stops && layerObj.stops[0][0]
              ? [...new Set(layerObj.stops[0][0].map(d => d[1]))]
              : [...new Set(layer.colorStops.map(d => d[1]))];
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
              background.push(
                <li
                  key={index}
                  className={`background-block-${layer.id}-${mapId}`}
                  data-tooltip={`${
                    typeof formatNum(firstVal, 1) === 'undefined' ? 0 : formatNum(firstVal, 1)
                  }-${
                    typeof formatNum(lastVal, 1) === 'undefined' ? 0 : formatNum(lastVal, 1)
                  }${legendSuffix}`}
                  style={{
                    background: hexToRgbA(color, 0.9).toString(),
                    width: 100 / activeColors.length + '%',
                  }}
                ></li>
              );
            }
          });

          primaryLegend = (
            <div
              id={`legend-${layer.id}-${mapId}`}
              className={`legend-row ${activeLayerSelected}`}
              data-layer={`${layer.id}`}
              key={l}
              onClick={e => this.onUpdatePrimaryLayer(e)}
            >
              <span
                onClick={e => this.onCloseClick(e)}
                data-close-layer={`${layer.id}`}
                className="glyphicon glyphicon-remove close"
              ></span>
              <b>{layer.label}</b>
              <ul className="legend-limit" style={legendLimitStyle}>
                <li
                  id={`first-limit-${layer.id}`}
                  className={`${mapId}`}
                  style={leftListLimitStyle}
                >
                  {0}
                  {legendSuffix}
                </li>
                <li
                  id={`last-limit-${layer.id}`}
                  className={`${mapId}`}
                  style={rightListLimitStyle}
                >
                  {typeof formatNum(lastVal, 1) === 'undefined' ? 0 : formatNum(lastVal, 1)}
                  {legendSuffix}
                </li>
              </ul>
              <div className="legend-fill">
                <ul id="legend-background">{background}</ul>
              </div>
              <span>{Parser(layer.credit)}</span>
              {this.props.layerObj.exportLink ? exportLink : ''}
              {legendLink}
              {latestTimestamp}
            </div>
          );
        }
        continue;
      }
      if (circleLayerType && !fillLayerNoBreaks) {
        legendItems.unshift(
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-shapes legend-row ${activeLayerSelected}`}
            data-layer={`${layer.id}`}
            key={l}
            onClick={e => this.onUpdatePrimaryLayer(e)}
          >
            <span
              onClick={e => this.onCloseClick(e)}
              data-close-layer={`${layer.id}`}
              className="glyphicon glyphicon-remove close"
            ></span>
            <b>{layer.label}</b>
            <div className="legend-symbols">{quantiles}</div>
            <span>{Parser(layer.credit)}</span>
            {layerObj.exportLink ? exportLink : ''}
            {legendLink}
            {latestTimestamp}
          </div>
        );
      } else if (symbolLayer) {
        const shapeAndBar = layer.categories && layer.categories.shapeAndBar;
        const hasShape =
          layer.categories && layer.categories.shape && layer.categories.shape.length;
        layer.categories.color.forEach((color, index) => {
          const style =
            layer.categories.shape[index] === 'triangle-stroked-11' ||
            layer.categories.shape[index] === 'triangle-15'
              ? 'border-bottom-color:'
              : 'background:';
          const styleString = `${style}: ${color}`;
          const showBoth = shapeAndBar && shapeAndBar.length && shapeAndBar[index] === 'yes';
          const fillWidth = (
            100 / layer.categories.color.filter(c => c !== 'transparent').length
          ).toString();
          const textColor = layer.categories && layer.categories['text-color'];

          if (showBoth && hasShape) {
            background.push(
              <li className="layer-symbols" key={index}>
                {layer.categories.img ? (
                  <img
                    className="legend-icon"
                    src={`/assets/img/${layer.categories.shape[index]}.svg`}
                  />
                ) : null}
                <ul className="legend bar-color" key={index}>
                  <li
                    style={{
                      background: color,
                      color: textColor ? textColor : '#fff',
                      width: `${fillWidth}%`,
                    }}
                  >
                    {layer.categories.label[index]}
                  </li>
                </ul>
              </li>
            );
          } else {
            background.push(
              <li className="layer-symbols" key={index}>
                {layer.categories.img ? (
                  <img
                    className="legend-icon"
                    src={`/assets/img/${layer.categories.shape[index]}.svg`}
                  />
                ) : null}
                {layer.categories.label[index]}
              </li>
            );
          }
        });

        legendItems.unshift(
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-row ${activeLayerSelected}`}
            data-layer={`${layer.id}`}
            onClick={e => this.onUpdatePrimaryLayer(e)}
            key={l}
          >
            <span
              onClick={e => this.onCloseClick(e)}
              data-close-layer={`${layer.id}`}
              className="glyphicon glyphicon-remove close"
            ></span>
            <b>{layer.label}</b>
            <div className="legend-shapes">
              <ul style={{ left: '0' }}>{background}</ul>
            </div>
            <span>{Parser(layer.credit)}</span>
            {layerObj.exportLink ? exportLink : ''}
            {legendLink}
            {latestTimestamp}
          </div>
        );
      } else if (fillLayerNoBreaks && !layer.parent) {
        const fillWidth = (
          100 / layer.categories.color.filter(c => c !== 'transparent').length
        ).toString();
        if (layer.categories.labelShape) {
          layer.categories.labelShape.forEach((labelShape, index) => {
            background.push(
              <li className="layer-symbols" key={index}>
                {labelShape.shape ? (
                  <img
                    className="legend-icon"
                    src={`/assets/img/${labelShape.shape}.svg`}
                  />
                ) : null}
                {labelShape.label}
                <br/>
              </li>
            );
            if (labelShape.break) {
              background.push(<hr/>);
            }
          });
        } else {
        layer.categories.color.forEach((color, index) => {
          if (color !== 'transparent') {
            background.push(
              <li key={index} style={{ background: color, width: `${fillWidth}%` }}>
                {layer.categories.label[index]}
              </li>
            );
          }
        });
      }
        const legendClass = layer.categories ? 'legend-label' : '';
        legendItems.unshift(
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-row ${activeLayerSelected}`}
            data-layer={`${layer.id}`}
            onClick={e => this.onUpdatePrimaryLayer(e)}
            key={l}
          >
            <span
              onClick={e => this.onCloseClick(e)}
              data-close-layer={`${layer.id}`}
              className="glyphicon glyphicon-remove close"
            ></span>
            <b>{layer.label}</b>
            <div className={`legend-fill ${legendClass}`}>
              <ul>{background}</ul>
            </div>
            <span>{Parser(layer.credit)}</span>
            {layerObj.exportLink ? exportLink : ''}
            {legendLink}
            {latestTimestamp}
          </div>
        );
      } else if (multipleLegends && !layer.parent) {
        let fillCredit = null;
        let circleCredit = null;
        let circleTitle;
        if (Array.isArray(layer.categories)) {
          layer.categories.forEach((category, key) => {
            let textColor = category['text-color'];
            if (category.type === 'fill') {
              if (category.credit) {
                fillCredit = Parser(category.credit);
              }
              let fillWidth = (
                100 / category.color.filter(c => c !== 'transparent').length
              ).toString();
              category.color.forEach((color, index) => {
                background.push(
                  <li
                    key={index}
                    style={{
                      background: color,
                      color: textColor ? textColor : '#fff',
                      width: `${fillWidth}%`,
                    }}
                  >
                    {category.label[index]}
                  </li>
                );
              });
            } else if (category.type === 'circle') {
              /** Get this from spec
               * Get the specific radiuses and the right values for the same
               */
              if (category.credit) {
                circleCredit = Parser(category.credit);
              }
              if (category.title) {
                circleTitle = category.title;
              }
              category.radiuses.forEach((s, i) => {
                quantiles.push(
                  <span className="circle-container" key={s}>
                    <span
                      style={{
                        background: Array.isArray(category.color)
                          ? category.color[i]
                          : colors[i] || colors[0],
                        width: `${s * 2}px`,
                        height: `${s * 2}px`,
                        margin: `0px ${i + 2}px`,
                      }}
                    ></span>
                    <p style={{ color: textColor ? textColor : '#fff' }}>{category.label[i]}</p>
                  </span>
                );
              });
            }
          });
        }
        const legendClass = layer.categories ? 'legend-label' : '';
        const circleQuantiles = quantiles ? (
          <div className="legend-symbols">{quantiles}</div>
        ) : null;

        legendItems.unshift(
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-shapes legend-row ${activeLayerSelected}`}
            data-layer={`${layer.id}`}
            onClick={e => this.onUpdatePrimaryLayer(e)}
            key={l}
          >
            <span
              onClick={e => this.onCloseClick(e)}
              data-close-layer={`${layer.id}`}
              className="glyphicon glyphicon-remove close"
            ></span>
            <b>{layer.label}</b>
            <div className={`${'legend-fill'} ${legendClass}`}>
              <ul>{background}</ul>
            </div>
            {fillCredit}
            <b>{circleTitle}</b>
            {circleQuantiles}
            {circleCredit}
            <span>{Parser(layer.credit)}</span>
            {legendLink}
            {latestTimestamp}
          </div>
        );
      } else if (fillLayerWithBreaks && layer.stops && !layer.parent) {
        const { stopsData, breaks } = layer;
        const colorLegend = layer &&
          layer.stopsData && [...new Set(stopsData.map(stop => stop[1]))];
        const legendSuffix = layer.categories.suffix ? layer.categories.suffix : '';

        const activeColors =
          timeSeriesObj && timeSeriesObj.newColors
            ? timeSeriesObj.newColors
            : timeSeriesObj &&
              timeSeriesObj.newColors &&
              layerObj.aggregate &&
              layerObj.aggregate.timeseries
            ? timeSeriesObj.newColors
            : this.state &&
              this.state.timeSeriesObj &&
              layerObj &&
              layerObj.aggregate &&
              layerObj.aggregate.timeseries
            ? this.state.timeSeriesObj.newColors
            : layerObj && layerObj.stops && layerObj.stops[0] && layerObj.stops[0][0]
            ? [...new Set(layerObj.stops[0][0].map(d => d[1]))]
            : layer.colors;

        if (
          colorLegend &&
          colorLegend.includes('transparent') &&
          !activeColors.includes('transparent')
        ) {
          activeColors.splice(0, 0, 'transparent');
          breaks.splice(1, 0, breaks[0]);
        }
        let lastVal;
        const stopsBreak =
          timeSeriesObj &&
          timeSeriesObj.newBreaks &&
          layerObj.aggregate &&
          layerObj.aggregate.timeseries
            ? timeSeriesObj.newBreaks
            : layers[primaryLayer].layers
            ? layerObj && layerObj.categories && layerObj.categories.breaks
            : layer.breaks;
        const lastBreaks = stopsBreak && Math.max(...stopsBreak);
        const layerStops =
          timeSeriesObj &&
          timeSeriesObj.stops &&
          layerObj &&
          layerObj.aggregate &&
          layerObj.aggregate.timeseries
            ? [...new Set(timeSeriesObj.stops[timeSeriesObj.temporalIndex].map(d => d[1]))]
            : layerObj && layerObj.stops && layerObj.stops[0][0]
            ? [...new Set(layerObj.stops[0][0].map(d => d[1]))]
            : [...new Set(layer.colorStops.map(d => d[1]))];
        activeColors.forEach((color, index, activeColors) => {
          const stopsIndex = layerStops ? layerStops.indexOf(color) : -1;
          if (stopsIndex !== -1) {
            const firstVal = stopsIndex ? stopsBreak && stopsBreak[stopsIndex - 1] : 0;
            if (Object.is(activeColors.length - 1, index)) {
              // execute last item logic
              lastVal = lastBreaks;
            } else {
              lastVal = stopsBreak && stopsBreak[stopsIndex];
            }
            background.push(
              <li
                key={index}
                className={`background-block-${layer.id}-${mapId}`}
                data-tooltip={`${
                  typeof formatNum(firstVal, 1) === 'undefined' ? 0 : formatNum(firstVal, 1)
                }-${
                  typeof formatNum(lastVal, 1) === 'undefined' ? 0 : formatNum(lastVal, 1)
                }${legendSuffix}`}
                style={{
                  background: hexToRgbA(color, 0.9).toString(),
                  width: 100 / activeColors.length + '%',
                }}
              ></li>
            );
          }
        });

        legendItems.unshift(
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-row ${activeLayerSelected}`}
            data-layer={`${layer.id}`}
            key={l}
            onClick={e => this.onUpdatePrimaryLayer(e)}
          >
            <span
              onClick={e => this.onCloseClick(e)}
              data-close-layer={`${layer.id}`}
              className="glyphicon glyphicon-remove close"
            ></span>
            <b>{layer.label}</b>
            <ul className="legend-limit" style={legendLimitStyle}>
              <li id={`first-limit-${layer.id}`} className={`${mapId}`} style={leftListLimitStyle}>
                {0}
                {legendSuffix}
              </li>
              <li id={`last-limit-${layer.id}`} className={`${mapId}`} style={rightListLimitStyle}>
                {typeof formatNum(lastVal, 1) === 'undefined' ? 0 : formatNum(lastVal, 1)}
                {legendSuffix}
              </li>
            </ul>
            <div className="legend-fill">
              <ul id="legend-background">{background}</ul>
            </div>
            <span>{Parser(layer.credit)}</span>
            {layerObj.exportLink ? exportLink : ''}
            {legendLink}
            {latestTimestamp}
          </div>
        );
      } else {
      }
    }

    legendItems.unshift(primaryLegend);
    const showLoader = legendLayers.length > 0 && mapStateToUrl ? legendItems.length !== legendLayers.length : false;
    return (
      <div>
        <div
          className={this.props.hasNavBar ? `legend ${mapId} bottom` : `legend ${mapId}`}
          
        >

          {showLoader && (
            <div className="legend-row">
              <b>Loading...</b>
            </div>
          )}
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
