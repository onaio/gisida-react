import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Actions, getSliderLayers } from 'gisida';
import { buildLayersObj } from '../../utils';

require('./TimeSeriesSlider.scss');

const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId] || { layers: {}, timeseries: {} };
  let timeLayer;
  buildLayersObj(MAP.layers).forEach((layer) => {
    if (layer && layer.visible && layer.aggregate && layer.aggregate.timeseries) {
      timeLayer = layer.id;
    }
  });
  timeLayer = MAP.timeseries[MAP.primaryLayer] ? MAP.primaryLayer : timeLayer;
  return {
    timeSeriesObj: MAP.timeseries[timeLayer],
    timeseries: MAP.timeseries,
    layers: MAP.layers,
    showFilterPanel: MAP.showFilterPanel,
  }
}

class TimeSeriesSlider extends React.Component {
  static updateAnnualSelector(periods, year) {
    const periodArr = [];
    let period;
    let p;
    let y;

    for (p = 0; p < periods.length; p += 1) {
      period = periods[p];

      if (isNaN(parseInt(period, 10))) {
        period = period.slice(period.length - 4);
      } else {
        period = parseInt(period, 10).toString();
      }

      y = year.slice(year.length - 4);

      if (y === period) {
        periodArr.push((
          <option
            key={p}
          >
            {p}
          </option>
        ));
      }
    }
    return periodArr;
  }

  static filterPeriods(allPeriods, currentYear) {
    let parsedPeriods;
    return currentYear === 'All' ? allPeriods : allPeriods.filter((p) => {
      if (isNaN(parseInt(p, 10))) {
        parsedPeriods = p.slice(p.length - 4);
      } else {
        parsedPeriods = parseInt(p, 10).toString();
      }
      return parsedPeriods === currentYear;
    });
  }

  constructor(props) {
    super(props);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    if (!this.props.timeSeriesObj) {
      return null;
    }

    const { period, temporalIndex } = this.props.timeSeriesObj;
    this.state = {
      periods: period,
      index: temporalIndex,
      period: period[temporalIndex],
    };
  }

  componentWillMount() {
    this.setState({
      currentYear: 'All',
    });
  }



  updateTimeseriesState(nextIndex, sliderLayer, currentYear) {
    let nextTimeseriesLayer;
    let layerId;
    let temporalIndex;
    let period;
    const nextTimeseries = Object.assign({}, this.props.timeseries);
    const sliderLayerObj = Object.assign({}, sliderLayer);

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
        nextTimeseriesLayer.allPeriods = nextTimeseriesLayer.allPeriods || nextTimeseriesLayer.period;
        const filteredPeriods = TimeSeriesSlider.filterPeriods(nextTimeseriesLayer.allPeriods, currentYear);
        const { periodData } = nextTimeseriesLayer;
        period = currentYear === 'All' ? nextTimeseriesLayer.allPeriods : filteredPeriods;
        nextTimeseriesLayer.period = period;
        sliderLayerObj.period = period;

        if (layerId === sliderLayerObj.layerId) {
          temporalIndex = nextIndex;
        } else {
          temporalIndex = period ? period.indexOf(sliderLayerObj.period[nextIndex]) : -1;
        }

        if (temporalIndex !== -1) {
          nextTimeseries[layerId] = Object.assign(
            {},
            nextTimeseriesLayer,
            {
              temporalIndex,
              data: periodData[period[temporalIndex]].data,
            },
          );
        }
      }
    }

    this.props.dispatch(Actions.updateTimeseries(this.props.mapId, nextTimeseries))
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.timeSeriesObj && nextProps.timeSeriesObj.period) {
      const { allPeriods, period, temporalIndex } = nextProps.timeSeriesObj;
      this.setState({
        periods: this.state.currentYear === 'All' ? allPeriods : period,
        index: temporalIndex,
        period: period[temporalIndex],
      }); 
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.timeSeriesObj) {
      const { allPeriods, period, temporalIndex } = nextProps.timeSeriesObj;
      const { currentYear } = nextState;
      if (currentYear !== this.state.currentYear) {
        this.setState({
          currentYear: currentYear,
          index: temporalIndex,
          periods: currentYear === 'All' ? allPeriods : period,
        });
      }
    }
  }

  componentWillUnmount() {
    this.setState({
      index: 0,
      period: 0,
      currentYear: 'All',
    });
  }

  onAnnualSelectorChange(e) {
    e.preventDefault();
    const cy = e.currentTarget.value;
    let parsedPeriods;
    const { period, allPeriods } = this.props.timeSeriesObj;
    const currentPeriods = allPeriods || period;
    const periods = currentPeriods.filter((p) => {
      if (isNaN(parseInt(p, 10))) {
        parsedPeriods = p.slice(p.length - 4);
      } else {
        parsedPeriods = parseInt(p, 10).toString();
      }
      return parsedPeriods === cy;
    });
    const temporalIndex = cy === 'All' ? allPeriods.length - 1 : periods.length - 1;
    this.setState({
      currentYear: cy,
      periods: currentPeriods,
      period: currentPeriods[temporalIndex],
    });

    // const annualPeriods = ['2017', '2018'];
    // const isAnnualperiod = annualPeriods.indexOf(period) !== -1;
    // console.log("is annual period", isAnnualperiod);
    this.updateTimeseriesState(temporalIndex, this.props.timeSeriesObj, cy);
  }

  handleMouseUp(e) {
    const nextIndex = parseInt(e.target.value, 10);
    const { index } = this.state;
    if (nextIndex !== index) {
      this.updateTimeseriesState(e.target.value, this.props.timeSeriesObj, this.state.currentYear);
    }
  }

  render() {
    if (!this.props.timeSeriesObj) {
      return null;
    }

    const periodOptions = this.state.periods.map((p, i) => (
      <option
        key={i}
      >
        {i}
      </option>
    ));

    const annualPeriods = ['2017', '2018'];
    const annualSelComponent = [];
    annualPeriods.forEach((period) => {
      annualSelComponent.push((
        <option>
          {period}
        </option>
      ));
    });

    let isSingleAnnualPeriod = false;
    const periodArray = TimeSeriesSlider.updateAnnualSelector(this.state.periods, this.state.currentYear);
    if (this.state.currentYear !== 'All' && !periodArray.length) {
      isSingleAnnualPeriod = true;
    }
    return this.props.timeSeriesObj ? (
      <div
        className="series"
        style={{ right: this.props.showFilterPanel ? '310px' : '50px'}}>
        <label
          id={`${this.props.mapId}-label`}
          className="label"
          htmlFor="slider"
        >{this.state.period}</label>
        {annualPeriods.indexOf(this.state.period) === -1 ?
          <select
            className="annual-selector"
            onChange={e => this.onAnnualSelectorChange(e)}
          >
            <option>All</option>
            {annualSelComponent}
          </select>
          : null}
        {!isSingleAnnualPeriod || this.state.periods.length > 1 ?
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
          {this.state.currentYear === 'All' ? periodOptions : TimeSeriesSlider.updateAnnualSelector(this.state.periods, this.state.currentYear)}
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
