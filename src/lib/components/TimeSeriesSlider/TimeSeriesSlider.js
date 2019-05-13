import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Actions, getSliderLayers, generateStops } from 'gisida';
import { buildLayersObj } from '../../utils';



require('./TimeSeriesSlider.scss');

const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId] || { layers: {}, timeseries: {} };
  let timeLayer;
  let timeSubLayer;
  buildLayersObj(MAP.layers).forEach((layer) => {
    if (layer && layer.visible && layer.aggregate && layer.aggregate.timeseries) {
      timeLayer = layer.id;
    }
  });
  timeLayer = MAP.primaryLayer && MAP.primaryLayer.length && MAP.timeseries[MAP.primaryLayer] ? MAP.primaryLayer : timeLayer;
  timeSubLayer = MAP.primarySubLayer && MAP.primarySubLayer.length && MAP.timeseries[MAP.primarySubLayer] ? MAP.primarySubLayer : null;
  return {
    timeSeriesObj: MAP.timeseries[timeSubLayer || timeLayer],
    timeseries: MAP.timeseries,
    layers: MAP.layers,
    primaryLayer: MAP.primaryLayer,
    showFilterPanel: MAP.showFilterPanel,
    timeLayer,
  }
}

class TimeSeriesSlider extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  updateTimeseriesState(nextIndex, sliderLayerObj) {
    let nextTimeseriesLayer;
    let layerId;
    let temporalIndex;
    let period;
    const nextTimeseries = Object.assign({}, this.props.timeseries);

    const timeSeriesLayers = getSliderLayers(this.props.layers);

    const activeLayers = [];
    const layers = [];
    const loadedlayers = this.props.layers;
    Object.keys(loadedlayers).forEach((key) => {
      if (loadedlayers[key].visible) {
        activeLayers.push(loadedlayers[key].id);
        layers.push(loadedlayers[key]);
      }
    });

    for (let i = 0; i < timeSeriesLayers.length; i += 1) {
      layerId = timeSeriesLayers[i];
      if (activeLayers.includes(layerId) && nextTimeseries[layerId]) {
        nextTimeseriesLayer = nextTimeseries[layerId];
        const {
          periodData
        } = nextTimeseriesLayer;

        period = nextTimeseriesLayer.period;

        if (layerId === sliderLayerObj.layerId) {
          temporalIndex = nextIndex;
        } else {
          temporalIndex = period.indexOf(sliderLayerObj.period[nextIndex]);
        }

        if (temporalIndex !== -1) {
          nextTimeseries[layerId] = Object.assign({},
            nextTimeseriesLayer, {
              temporalIndex,
              data: periodData[period[temporalIndex]].data,
              adminFilter: periodData[period[temporalIndex]].adminFilter && [...periodData[period[temporalIndex]].adminFilter],
            },
          );
        }
      }
    }
    const {
      field
    } = sliderLayerObj.layerObj.aggregate.timeseries;
    sliderLayerObj.data = sliderLayerObj.periodData[sliderLayerObj.period[nextIndex]].data;
    const activeStops = generateStops(sliderLayerObj, field, this.props.dispatch, nextIndex);

    const {
      primaryLayer
    } = this.props;
    if (this.props.layers[primaryLayer].layers) {
      this.props.layers[primaryLayer].layers.map(i =>
        nextTimeseries[i].newBreaks = activeStops[3]);
      this.props.layers[primaryLayer].layers.map(i =>
        nextTimeseries[i].newColors = [...new Set(sliderLayerObj.colorStops[nextIndex].map(d =>
          d[1]))]);

      this.props.dispatch(Actions.updateTimeseries(this.props.mapId, nextTimeseries, this.props.timeLayer));
    } else {
      nextTimeseries[sliderLayerObj.layerId].newBreaks = activeStops[3];
      nextTimeseries[sliderLayerObj.layerId].newColors = [...new Set(sliderLayerObj.colorStops[nextIndex].map(d => d[1]))];
      this.props.dispatch(Actions.updateTimeseries(this.props.mapId, nextTimeseries, this.props.timeLayer));
    }
  }

  componentWillReceiveProps(nextProps) {
    
    if (nextProps.timeSeriesObj && nextProps.timeSeriesObj.periodData) {
      const { period, temporalIndex } = nextProps.timeSeriesObj;
      this.setState({
        periods: period,
        index: temporalIndex,
        period: period[temporalIndex],
      }); 
    }
  }

  handleMouseUp(e) {
    const nextIndex = parseInt(e.target.value, 10);
    const { index } = this.state;
    if (nextIndex !== index) {
      this.updateTimeseriesState(e.target.value, this.props.timeSeriesObj);
    }
  }

  render() {
    return ((this.props.timeSeriesObj) && (this.state && this.state.periods.length > 1)) ? (
      <div
        className="series"
        style={{ right: '50px'}}>
        <label
          id={`${this.props.mapId}-label`}
          className="label"
          htmlFor="slider"
        >{this.state.period}</label>
        {this.state.periods.length > 1 ?
          <input
            id={`${this.props.mapId}-slider`}
            className="slider"
            type="range"
            list={`${this.props.mapId}-datalist`}
            max={this.state.periods.length - 1}
            value={this.state.index}
            onChange={(e) => { this.handleMouseUp(e); }}
            data-html2canvas-ignore
          /> : null}
        <datalist id={`${this.props.mapId}-datalist`}>
          {this.state.periods.map((p, i) => <option key={i}>{i}</option>)}
        </datalist>
      </div>
    ) : null;
  }
}

TimeSeriesSlider.propTypes = {
  mapId: PropTypes.string.isRequired,
  timeSeriesObj: PropTypes.objectOf(PropTypes.any),
  updateTimeseriesState: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(TimeSeriesSlider);
