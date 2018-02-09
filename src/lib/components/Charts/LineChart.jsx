import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';

class LineChart extends React.Component {
  constructor(props) {
    super(props);
    const {
      categories,
      series,
      indicator,
      pointClickCallback,
      chartTitle,
      chartHeight,
    } = this.props;

    this.state = {
      chart: {
        type: 'line',
        height: chartHeight || 200,
        backgroundColor: 'rgba(255,255,255,0)',
      },
      title: {
        text: chartTitle || null,
      },
      xAxis: {
        categories: categories.categories,
      },
      yAxis: {
        title: {
          text: indicator,
        },
        endOnTick: false,
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        dataLabels: {
          enabled: false,
        },
        series: {
          cursor: 'pointer',
          animation: false,
          events: {
            click: (e) => {
              pointClickCallback(e);
            },
          },
        },
      },
      series: series.series,
      credits: {
        enabled: false,
      },
    };
  }

  componentDidMount() {
    const self = this;
    setTimeout(() => {
      self.chart = Highcharts.chart(self.chartEl, self.state);
    }, 300);
  }

  componentWillReceiveProps(nextProps) {
    if (this.chart) {
      this.chart.destroy();
    }
    const { categories, series, indicator } = nextProps;

    this.setState({
      xAxis: {
        categories: categories.categories,
      },
      yAxis: {
        title: {
          text: indicator,
        },
      },
      series: series.series,
    }, () => {
      this.chart = Highcharts.chart(this.chartEl, this.state);
    });
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  render() {
    return <div ref={(el) => { this.chartEl = el; }} />;
  }
}

LineChart.propTypes = {
  categories: PropTypes.objectOf(PropTypes.array).isRequired,
  series: PropTypes.objectOf(PropTypes.array).isRequired,
  indicator: PropTypes.string.isRequired,
  pointClickCallback: PropTypes.func.isRequired,
  chartTitle: PropTypes.string.isRequired,
  chartHeight: PropTypes.number.isRequired,
};

export default LineChart;
