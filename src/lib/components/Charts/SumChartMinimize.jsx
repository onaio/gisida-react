import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId] || { timeseries: {}, layers: {} };
  const { detailView } = MAP;
  return {
    showFilterPanel: MAP.showFilterPanel,
    showDetailView: (detailView && detailView.model && detailView.model.UID),
  }
}

class SumChartMinimize extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      isMin: false,
      bottom: this.props.bottom,
      label: this.props.label,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ bottom: nextProps.bottom });
  }

  handleClick(e) {
    e.preventDefault();
    this.props.toggleChart();
    this.setState({ isMin: !this.state.isMin });
  }

  render() {
    const { showDetailView, showFilterPanel } = this.props;
    let chartPos = "35px";
    if (showDetailView) {
      chartPos = "375px";
    } else if (showFilterPanel) {
      chartPos = "286px";
    }
    return (
      <a
        className="toggleChart"
        role="button"
        tabIndex="-1"
        onClick={(e) => { this.handleClick(e); }}
        title={`${this.state.isMin ? 'Show' : 'Hide'} Summary Charts`}
        style={{ bottom: this.state.bottom, right: chartPos, zIndex: 5000 }}
        data-icon-credit="Created by Barracuda from the Noun Project"
        data-icon-credit-url="https://thenounproject.com/barracuda/collection/chart/?i=1217547"
      >
        <span />
      </a>
    );
  }
}

SumChartMinimize.propTypes = {
  toggleChart: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  bottom: PropTypes.number.isRequired,
};

export default connect(mapStateToProps)(SumChartMinimize);
