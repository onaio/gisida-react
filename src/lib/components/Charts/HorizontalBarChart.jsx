import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';

class HorizontalBarChart extends React.Component {
  static tooltipPointFormatter() {
    return `<b>${this.series.name}:</b> ${this.y.toLocaleString()}`;
  }

  constructor(props) {
    super(props);
    const {
      chartTitle,
      categories,
      series,
      chartHeight,
      chartWidth
    } = this.props;

    this.state = {
      chart: {
        type: 'bar',
        height: chartHeight || 400,
        width: chartWidth || 800,
      },
      title: {
        text: chartTitle || null
      },
      tooltip: {
        headerFormat: '',
        pointFormatter: HorizontalBarChart.tooltipPointFormatter,
      },
      xAxis: {
        categories: categories
      },
      yAxis: {
        min: 0,
        title: {
          text: null
        },
        labels: {
          overflow: 'justify'
        }
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          cursor: 'pointer',
          dataLabels: {
            enabled: true
          }
        }
      },
      series: series,
      credits: {
        enabled: false,
      }
    };
  }

  componentDidMount() {
    this.chart = Highcharts.chart(this.chartEl, this.state);
  }

  componentWillReceiveProps(nextProps) {
    this.chart.destroy();
    const { series, categories } = nextProps;
    this.setState({
      series: series,
      xAxis: {
        categories: categories,
      }
    });
  }

  componentDidUpdate() {
    this.chart = Highcharts.chart(this.chartEl, this.state);
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

HorizontalBarChart.propTypes = {
  series: PropTypes.arrayOf(PropTypes.any).isRequired,
  categories: PropTypes.arrayOf(PropTypes.any).isRequired,
  chartTitle: PropTypes.string,
  chartHeight: PropTypes.number,
  chartWidth: PropTypes.number,
};

export default HorizontalBarChart;
