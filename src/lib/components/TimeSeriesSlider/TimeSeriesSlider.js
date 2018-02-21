import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

require('./TimeSeriesSlider.scss');

const mapStateToProps = (state, ownProps) => {
  return {  
  }
}

class TimeSeriesSlider extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    const { period, temporalIndex } = this.props.timeSeriesObj;
    this.state = {
      periods: period,
      index: temporalIndex,
      period: period[temporalIndex],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { period, temporalIndex } = nextProps.timeSeriesObj;
    this.setState({
      periods: period,
      index: temporalIndex,
      period: period[temporalIndex],
    });
  }

  handleMouseUp(e) {
    const nextIndex = parseInt(e.target.value, 10);
    const { index } = this.state;

    if (nextIndex !== index) {
      this.props.updateTimeseriesState(e.target.value, this.props.timeSeriesObj);
    }
  }


  render() {
    return (
      <div className="series">
        <label
          id={`${this.props.mapId}-label`}
          className="label"
          htmlFor="slider"
        >{this.state.period}</label>
        <input
          id={`${this.props.mapId}-slider`}
          className="slider"
          type="range"
          list={`${this.props.mapId}-datalist`}
          max={this.state.periods.length - 1}
          value={this.state.index}
          onInput={(e) => { this.handleMouseUp(e); }}
          data-html2canvas-ignore
        />
        <datalist id={`${this.props.mapId}-datalist`}>
          {this.state.periods.map((p, i) => <option key={i}>{i}</option>)}
        </datalist>
      </div>
    );
  }
}

TimeSeriesSlider.propTypes = {
  mapId: PropTypes.string.isRequired,
  timeSeriesObj: PropTypes.objectOf(PropTypes.any).isRequired,
  updateTimeseriesState: PropTypes.func.isRequired,
};
export default connect(mapStateToProps)(TimeSeriesSlider);
