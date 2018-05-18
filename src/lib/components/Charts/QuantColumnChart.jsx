import React from 'react';
import PropTypes from 'prop-types';
import ColumnChart from './ColumnChart';

class QuantColumnChart extends React.Component {
  static buildSeries(data, passing) {
    // const data = Data.sort((a, b) => a - b);
    const optionCounts = {};
    for (let d = 0; d < data.length; d += 1) {
      if (!optionCounts[data[d]]) {
        optionCounts[data[d]] = 0;
      }
      optionCounts[data[d]] += 1;
    }

    const optionKeys = Object.keys(optionCounts).sort((a, b) =>
      Number(a) - Number(b)
    );
    const seriesData = [];
    let color;
    for (let o = 0; o < optionKeys.length; o += 1) {
      color = passing.indexOf(Number(optionKeys[o])) === -1
        && passing.indexOf(optionKeys[o]) === -1
        ? '#999999' : '#7cb5ec'
      seriesData.push({
        name: optionKeys[o],
        y: optionCounts[optionKeys[o]],
        color,
      });
    }

    return seriesData;
  }

  static pointFormatterFunc () {
    return `<span style="color: #999;">${this.name} (${this.y})</span>`
  }

  constructor(props) {
    super(props);
    const { data, passing } = this.props;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const categories = [...new Set(data)].sort((a, b) => a - b);
    this.state = {
      data,
      min,
      max,
      passing,
      doLog: max / min >= 100,
      seriesData: QuantColumnChart.buildSeries(data, (passing ? passing : categories)),
      categories,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { data, passing } = nextProps;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const categories = [...new Set(data)].sort((a, b) => a - b);
    this.setState({
      data,
      min,
      max,
      passing,
      doLog: max / min >= 100,
      seriesData: QuantColumnChart.buildSeries(data, (passing ? passing : categories)),
      categories,
    });
  }

  render() {
    const { seriesData, categories } = this.state;
    return (
      <ColumnChart
        chartHeight={150}
        chartWidth={230}
        categories={categories}
        yAxis={{
          visible: false,
          endOnTick: false,
        }}
        isPercent={false}
        pointFormatterFunc={QuantColumnChart.pointFormatterFunc}
        seriesData={seriesData}
      />
    );
  }
}

QuantColumnChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any).isRequired,
  passing: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default QuantColumnChart;
