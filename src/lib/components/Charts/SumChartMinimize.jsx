import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId];
  return {
    showFilterPanel: MAP.showFilterPanel,
    isMin: ownProps.isChartMin,
    bottom: ownProps.bottom,
    label: ownProps.label,
  };
}

class SumChartMinimize extends React.Component {
  constructor(props) {
    super(props);
    const { isMin, bottom, label } = this.props;
    this.handleClick = this.handleClick.bind(this);
    this.state = { isMin, bottom, label };
  }

  componentWillReceiveProps(nextProps) {
    const { isMin, bottom, label } = nextProps;
    this.setState({ isMin, bottom, label });
  }

  handleClick(e) {
    e.preventDefault();
    this.props.toggleChart();
    this.setState({ isMin: !this.state.isMin });
  }

  render() {
    return (
      <a
        className="toggleChart"
        role="button"
        tabIndex="-1"
        onClick={(e) => { this.handleClick(e); }}
        title={`${this.props.isMin ? 'Show' : 'Hide'} Summary Charts`}
        style={{ bottom: this.props.bottom, right: this.props.showFilterPanel ? '286px' : '35px' }}
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
