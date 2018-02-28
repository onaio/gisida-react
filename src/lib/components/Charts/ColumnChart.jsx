import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';
import { isNewSeriesData } from '../../utils';

class ColumnChart extends React.Component {
  static pointFormatterFunc() {
    return `<span>${this.y}%</span>`;
  }

  constructor(props) {
    super(props);
    const {
      seriesTitle,
      seriesData,
      chartHeight,
      chartWidth,
      categories,
      yAxisLabel,
    } = this.props;

    this.state = {
      chart: {
        type: 'column',
        height: chartHeight || 225,
        width: chartWidth || 600,
        backgroundColor: 'rgba(255,255,255,0)',
        spacingTop: 15,
        spacintRight: 10,
      },
      xAxis: {
        categories,
        labels: {
          style: {
            fontSize: 9,
          },
        },
      },
      yAxis: [
        {
          title: {
            text: (yAxisLabel && yAxisLabel) || 'Target Percentage (%)',
            y: 10,
          },
          endOnTick: false,
        },
        {
          linkedTo: 0,
          opposite: true,
          title: {
            text: (yAxisLabel && yAxisLabel) || 'Target Percentage (%)',
            y: 10,
            x: -10,
          },
        },
      ],
      tooltip: {
        useHTML: false,
        headerFormat: '',
        pointForamt: '',
        shadow: false,
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
      },
      title: {
        text: seriesTitle || null,
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        column: {
          showInLegend: false,
          pointPadding: 0,
          tooltip: {
            distance: 0,
            padding: 0,
            pointFormatter: ColumnChart.pointFormatterFunc,
          },
        },
      },
      series: [{
        name: seriesTitle,
        data: seriesData,
      }],
    };
  }

  componentDidMount() {
    const self = this;
    setTimeout(() => {
      self.chart = Highcharts.chart(self.chartEl, self.state);
    }, 300);
  }

  componentWillReceiveProps(nextProps) {
    const {
      seriesTitle,
      seriesData,
      chartHeight,
      chartWidth,
      categories,
    } = nextProps;

    if (isNewSeriesData(this.state.series[0].data, seriesData)) {
      this.chart.destroy();

      this.setState({
        chart: Object.assign({}, this.state.chart, {
          height: chartHeight || 250,
          width: chartWidth || 600,
        }),
        title: {
          text: seriesTitle || null,
        },
        xAxis: {
          categories,
          labels: {
            style: {
              fontSize: 9,
            },
          },
        },
        series: [{
          name: seriesTitle,
          data: seriesData,
        }],
      }, () => {
        this.chart = Highcharts.chart(this.chartEl, this.state);
      });
    } else if (this.chart && (chartWidth !== this.chart.chartWidth || this.chart.chartHeight)) {
      this.chart.setSize(chartWidth, chartHeight);
    }
  }

  componentWillUnmount() {
    if (this.chart) this.chart.destroy();
  }

  render() {
    return <div ref={(el) => { this.chartEl = el; }} />;
  }
}

ColumnChart.propTypes = {
  seriesData: PropTypes.objectOf(PropTypes.any).isRequired,
  seriesTitle: PropTypes.string.isRequired,
  chartWidth: PropTypes.number.isRequired,
  chartHeight: PropTypes.number.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  yAxisLabel: PropTypes.string.isRequired,
};


export default ColumnChart;
