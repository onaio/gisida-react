import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';
import { isNewSeriesData } from '../../utils';

class PieChart extends React.Component {

  static tootltipPointFormatter() {
    return `<b>${this.point.name}</b>: € ${this.y}`;
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
      doubleChart,
      chartIcon,                                                                                                                                     
    } = this.props;
    const chartImage = chartIcon === 'Community' ? 'community.png' : 'police.png';
    this.state = {
      chart: {
        type: 'pie',
        events: doubleChart === 'multipie' ? {
          load: function(event) {
            var chart = this,
              points = chart.series[0].points,
              len = points.length,
              total = 0,
              i = 0;
  
            for (; i < len; i++) {
              total += points[i].y;
            }
  
            chart.setTitle({
              useHTML: true,
            text: `${total}<br/><img src="/assets/img/${chartImage}" width="30"/>`,
              align: 'center',
              verticalAlign: 'middle',
              y: -10,
              style: {
                fontWeight: 'bold',
                fontSize: '17px',
                left: '58px'
              },
            });
          }
        } : null,
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
            enabled: doubleChart === 'multipie' ? false : true,
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
