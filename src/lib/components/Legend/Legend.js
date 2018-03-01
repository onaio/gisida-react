/* eslint-disable no-loop-func */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Actions, formatNum, hexToRgbA } from 'gisida';
import { buildLayersObj } from '../../utils';
import Parser from 'html-react-parser';
import './Legend.scss';

const mapStateToProps = (state, ownProps) => {
  return {
    layerObj: state.MAP.layers[state.MAP.activeLayerId],
    layersData: buildLayersObj(state.MAP.layers),
    MAP: state.MAP,
    primaryLayer: state.MAP.primaryLayer,
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
    const dispatch = this.props.dispatch;
    const targetLayer = e.currentTarget.getAttribute('data-layer');
    // dispatch primary layer id
    dispatch(Actions.updatePrimaryLayer(targetLayer));
  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    const mapId = '01';
    const { layerObj } = this.props;
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
      const fillLayerWithBreaks = (layer && layer.credit && layer.type !== 'chart' && layer.type !== 'circle');
      const activeLayerSelected =  this.props.primaryLayer === layer.id ? 'primary' : '';
      const lastSelected = this.props.layersData[this.props.layersData.length - 1].id === layer.id  ? 'primary' : '';

      const boundaries = ["region-boundaries", "district-boundaries"];
      const isBoundaries = boundaries.indexOf(layer.id) !== -1;

      let background = [];

      if (layerObj.id === layer.id) {
        if (circleLayerType) {
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
        </div>);
        }
        if (fillLayerNoBreaks) {
          layer.categories.color.forEach((color, index) => {
            const fillWidth = (100 / layer.categories.color.length).toString();
            background.push((
              <li
                key={index}
                style={{ background: color, width: fillWidth + '%' }}>
                {layer.categories.label[index]}
              </li>
            ));
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
        }
        if (fillLayerWithBreaks && layerObj.stops && layer.stops) {
          const { stopsData, breaks, colors, Data } = layerObj;

          const dataValues = Data.map(values => values[layer.property]);
          const colorLegend = [...new Set(stopsData.map(stop => stop[1]))];
          const legendSuffix = layer.categories.suffix ? layer.categories.suffix : '';

          if (colorLegend.includes('transparent') && !(colors).includes('transparent')) {
            colors.splice(0, 0, 'transparent');
            breaks.splice(1, 0, breaks[0]);
          }

          colorLegend.forEach((color, index) => {
            const firstVal = breaks[index - 1] !== undefined ? breaks[index - 1] : 0;
            const lastVal = color === colorLegend[colorLegend.length - 1] || breaks[index] === undefined ? Math.max(...dataValues) : breaks[index];
            background.push((
              <li
                key={index}
                className={`background-block-${layer.id}-${mapId}`}
                data-tooltip={`${formatNum(firstVal, 1)}-${formatNum(lastVal, 1)}${legendSuffix}`}
                style={{ background: hexToRgbA(color, 0.9).toString(), width: (100 / colorLegend.length) + '%' }}
              >
              </li>
            ));
          });

          primaryLegend = (
            <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-row ${activeLayerSelected || lastSelected}`}
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
        if (!isBoundaries && !symbolLayer && !circleLayerType && !fillLayerNoBreaks && !fillLayerWithBreaks) {
          primaryLegend = (
            <div
              id={`legend-${layer.id}-${mapId}`}
              className={`legend-row primary`}
              data-layer={`${layer.id}`}
              key={l}
            >
              <b>
                {layer.label}
              </b>
              <span>
                {layer.credit ? Parser(layer.credit) : ''}
              </span>
            </div>
          );
        }
        continue;
      }
      if (circleLayerType) {
        legendItems.unshift((
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-shapes legend-row ${activeLayerSelected || lastSelected}`}
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
            className={`legend-row ${activeLayerSelected || lastSelected}`}
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

      } else if (fillLayerNoBreaks) {
        layer.categories.color.forEach((color, index) => {
          const fillWidth = (100 / layer.categories.color.length).toString();
          background.push((
            <li
              key={index}
              style={{ background: color, width: fillWidth + '%' }}>
              {layer.categories.label[index]}
            </li>
          ));
        });

        const legendClass = layer.categories ? 'legend-label' : '';

        legendItems.unshift((
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-row ${activeLayerSelected || lastSelected}`}
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
      } else if (fillLayerWithBreaks && layer.stops) {
        const { stopsData, breaks, colors, Data } = layer;

        const dataValues = Data.map(values => values[layer.property]);
        const colorLegend = [...new Set(stopsData.map(stop => stop[1]))];
        const legendSuffix = layer.categories.suffix ? layer.categories.suffix : '';

        if (colorLegend.includes('transparent') && !(colors).includes('transparent')) {
          colors.splice(0, 0, 'transparent');
          breaks.splice(1, 0, breaks[0]);
        }

        colorLegend.forEach((color, index) => {
          const firstVal = breaks[index - 1] !== undefined ? breaks[index - 1] : 0;
          const lastVal = color === colorLegend[colorLegend.length - 1] || breaks[index] === undefined ? Math.max(...dataValues) : breaks[index];
          background.push((
            <li
              key={index}
              className={`background-block-${layer.id}-${mapId}`}
              data-tooltip={`${formatNum(firstVal, 1)}-${formatNum(lastVal, 1)}${legendSuffix}`}
              style={{ background: hexToRgbA(color, 0.9).toString(), width: (100 / colorLegend.length) + '%' }}
            >
            </li>
          ));
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
        if (!isBoundaries && !symbolLayer && !circleLayerType && !fillLayerNoBreaks && !fillLayerWithBreaks) {
          legendItems.unshift((
            <div
              id={`legend-${layer.id}-${mapId}`}
              className={`legend-row`}
              data-layer={`${layer.id}`}
              key={l}
            >
              <b>
                {layer.label}
              </b>
              <span>
                {typeof layer.credit === "string" ? Parser(layer.credit) : null}
              </span>
            </div>
          ));
        }
      }
    }

    legendItems.unshift(primaryLegend);

    return (
      <div>
        <div className={`legend ${mapId}`}>
          {legendItems}
        </div>
      </div>
    );
  }
}

Legend.propTypes = {
  layerObj: PropTypes.objectOf(PropTypes.any).isRequired,
  layersData: PropTypes.arrayOf(PropTypes.any).isRequired,
  MAP: PropTypes.objectOf(PropTypes.any).isRequired,
  primaryLayer: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(Legend);
