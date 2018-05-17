/* eslint-disable no-loop-func */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Actions, formatNum, hexToRgbA } from 'gisida';
import { buildLayersObj } from '../../utils';
import Parser from 'html-react-parser';
import './Legend.scss';

const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId] || { layers: {}}
  return {
    layerObj: MAP.layers[MAP.activeLayerId],
    layersData: buildLayersObj(MAP.layers),
    MAP,
    mapId: ownProps.mapId,
    primaryLayer: MAP.primaryLayer,
    showFilterPanel: MAP.showFilterPanel,
  }
}

export class Legend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      setPrimary: false,
    };
  }

  onUpdatePrimaryLayer(e) {
    e.preventDefault();
    const { dispatch, mapId } = this.props;
    const targetLayer = e.currentTarget.getAttribute('data-layer');
    // dispatch primary layer id
    dispatch(Actions.updatePrimaryLayer(mapId, targetLayer));
  }

  render() {
    const { layerObj, mapId } = this.props;
    if (!layerObj) {
      return false;
    }
    const legendItems = [];

    let primaryLegend;
    let layer;
    for (let l = 0; l < this.props.layersData.length; l += 1) {
      layer = this.props.layersData[l];
      const circleLayerType = (layer && layer.credit && layer.type === 'circle' && !layer.categories.shape && layer.visible);
      const symbolLayer = (layer && layer.credit && layer.categories &&  layer.categories.shape && layer.type !== 'circle'); 
      const fillLayerNoBreaks = (layer && layer.credit && layer.categories && layer.categories.breaks === 'no');
      const fillLayerWithBreaks = (!fillLayerNoBreaks && layer && layer.credit && layer.type !== 'chart' && layer.type !== 'circle');
      const activeLayerSelected =  this.props.primaryLayer === layer.id ? 'primary' : '';

      let background = [];

      if (layerObj.id === layer.id) {
        if (circleLayerType) {
          const circleBGcolor = Array.isArray(layer.categories.color)
            ? layer.categories.color
            : [layer.categories.color];

          primaryLegend = (
        <div
          id={`legend-${layer.id}-${mapId}`}
          className={`legend-shapes legend-row ${activeLayerSelected}`}
          data-layer={`${layer.id}`}
          onClick={(e) => this.onUpdatePrimaryLayer(e)}
          key={l}
        >
          <b>
            {layer.label}
          </b>
          <div className="legend-symbols">
          <span
            className="circle-sm"
            style={{ background: circleBGcolor[0] }}
          >
          </span>
          <span
            className="circle-md"
            style={{ background: circleBGcolor[Math.floor(circleBGcolor.length / 2)] }}
          >
          </span>
          <span
            className="circle-lg"
            style={{ background: circleBGcolor[circleBGcolor.length - 1] }}
          >
          </span>
          </div>
          <span>{layer.credit}</span>
        </div>);
        }
        if (fillLayerNoBreaks && !layer.parent) {
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
          );
        } if (fillLayerWithBreaks && layerObj.stops && layer.stops && !layer.parent) {
          const { stopsData, breaks, colors, Data } = layer;

          const dataValues = Data.map(values => parseInt(values[layer.property], 10));
          const colorLegend = [...new Set(stopsData.map(stop => stop[1]))];
          const legendSuffix = layer.categories.suffix ? layer.categories.suffix : '';

          if (colorLegend.includes('transparent') && !(colors).includes('transparent')) {
            colors.splice(0, 0, 'transparent');
            breaks.splice(1, 0, breaks[0]);
          }

          colorLegend.forEach((color, index) => {
            const stopsIndex = layerObj.stops[4].indexOf(color);

            if (stopsIndex !== -1) {
              const firstVal = stopsIndex ? layerObj.stops[3][stopsIndex - 1] : 0;
              const lastVal = layerObj.stops[3][stopsIndex];
              background.push((
                <li
                  key={index}
                  className={`background-block-${layer.id}-${mapId}`}
                  data-tooltip={`${formatNum(firstVal, 1)}-${formatNum(lastVal, 1)}${legendSuffix}`}
                  style={{ background: hexToRgbA(color, 0.9).toString(), width: (100 / colorLegend.length) + '%' }}
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
                {formatNum(Math.max(...dataValues), 1)}
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
              <span
                className="circle-sm"
                style={{ background: layer.categories.color }}
              >
              </span>
              <span
                className="circle-md"
                style={{ background: layer.categories.color }}
              >
              </span>
              <span
                className="circle-lg"
                style={{ background: layer.categories.color }}
              >
              </span>
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
                style={{styleString}}
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
      } else if (fillLayerWithBreaks && layer.stops && !layer.parent) {
        const { stopsData, breaks, colors, Data } = layer;

          const dataValues = Data.map(values => parseInt(values[layer.property], 10));
          const colorLegend = [...new Set(stopsData.map(stop => stop[1]))];
          const legendSuffix = layer.categories.suffix ? layer.categories.suffix : '';

          if (colorLegend.includes('transparent') && !(colors).includes('transparent')) {
            colors.splice(0, 0, 'transparent');
            breaks.splice(1, 0, breaks[0]);
          }

          colorLegend.forEach((color, index) => {
            const stopsIndex = layerObj.stops[4].indexOf(color);

            if (stopsIndex !== -1) {
              const firstVal = stopsIndex ? layerObj.stops[3][stopsIndex - 1] : 0;
              const lastVal = layerObj.stops[3][stopsIndex];
              background.push((
                <li
                  key={index}
                  className={`background-block-${layer.id}-${mapId}`}
                  data-tooltip={`${formatNum(firstVal, 1)}-${formatNum(lastVal, 1)}${legendSuffix}`}
                  style={{ background: hexToRgbA(color, 0.9).toString(), width: (100 / colorLegend.length) + '%' }}
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
                {formatNum(Math.max(...dataValues), 1)}
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
};

export default connect(mapStateToProps)(Legend);
