import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';
import { isNewSeriesData } from '../../utils';

class PieChart extends React.Component {

  static tootltipPointFormatter() {
    return `${this.y.toLocaleString()}`;
  }

  static dataLabelFormatter() {
    return `${Math.round(this.percentage)}%`;
  }

  constructor(props) {
    super(props);
    const {
      seriesName,
      seriesData,
      seriesTitle,
      chartHeight,
      chartWidth,
      donut,
      tooltipOptions,
      dataLabelOptions,
      legendOptions,
      showInLegend,
      chartSpacing,
      titleOptions,
    } = this.props;

    this.state = {
      chart: {
        type: 'pie',
        width: chartWidth,
        height: chartHeight,
        backgroundColor: 'rgba(255,255,255,0)',
        spacing: (chartSpacing && chartSpacing.spacing) || [10, 10, 15, 10],
      },
      title: titleOptions || {
        text: seriesTitle || null,
      },
      tooltip: tooltipOptions || {},
      plotOptions: {
        pie: {
          cursor: 'pointer',
          hover: {
            enabled: true,
          },
          states: {
            hover: {
              halo: false,
            },
          },
          dataLabels: dataLabelOptions || {
            enabled: true,
            inside: true,
            formatter: function dataLabelFormatter() {
              if (this.y !== 0) {
                return `${Math.round(this.percentage)}%`;
              }
              return null;
            },
            distance: -24,
            style: {
              color: 'black',
              fontFamily: '\'Montserrat\', sans-serif',
            },
          },
          showInLegend: showInLegend || false,
        },
      },
      legend: legendOptions || {
        enabled: false,
      },
      series: [{
        name: seriesName,
        colorByPoint: true,
        innerSize: donut ? `${donut}%` : '0%',
        data: seriesData,
      }],
      credits: {
        enabled: false,
      },
    };
  }

  componentDidMount() {
    this.chart = Highcharts.chart(this.chartEl, this.state);
  }

  componentWillReceiveProps(nextProps) {
    const {
      seriesName,
      seriesData,
      seriesTitle,
      chartHeight,
      chartWidth,
      titleOptions,
      donut,
    } = nextProps;

    if (isNewSeriesData(this.state.series[0].data, seriesData)) {
      if (this.chart) {
        this.chart.destroy();
      }

      this.setState({
        chart: Object.assign({}, this.state.chart, {
          height: chartHeight,
          width: chartWidth,
        }),
        title: titleOptions || {
          text: seriesTitle || null,
        },
        series: [{
          name: seriesName,
          colorByPoint: true,
          innerSize: donut ? `${donut}%` : '0%',
          data: nextProps.seriesData,
        }],
      }, () => {
        this.chart = Highcharts.chart(this.chartEl, this.state);
      });
    }
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

PieChart.propTypes = {
  seriesName: PropTypes.string.isRequired,
  seriesData: PropTypes.arrayOf(PropTypes.any).isRequired,
  seriesTitle: PropTypes.string.isRequired,
  chartWidth: PropTypes.number.isRequired,
  chartHeight: PropTypes.number.isRequired,
  donut: PropTypes.number.isRequired,
  tooltipOptions: PropTypes.bool,
  dataLabelOptions: PropTypes.bool,
  legendOptions: PropTypes.bool,
  chartSpacing: PropTypes.bool,
  titleOptions: PropTypes.bool,
  showInLegend: PropTypes.bool,
};

PieChart.defaultProps = {
  tooltipOptions: false,
  dataLabelOptions: false,
  legendOptions: false,
  chartSpacing: false,
  titleOptions: false,
  showInLegend: false,
};

export default PieChart;
