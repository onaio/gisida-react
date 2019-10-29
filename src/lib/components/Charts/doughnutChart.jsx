import React from 'react'
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';

class DoughnutChart extends React.Component {
    constructor(props) {
        super(props);
        const {data, dimension, innerSize, title, container} = this.props
        this.state = {
            chart: {
                type: 'pie',
                spacing: 0,
                backgroundColor: 'transparent',
                height: dimension,
                width: dimension
            },
            title: {
              text: title ? title : ''
            },
            credits: {
              enabled: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(255,255,255,0)',
                borderWidth: 0,
                shadow: false,
                useHTML: true,
                formatter() {
                  if (this.point.options.label !== undefined) {
                    return `<div class="chart-Tooltip"><b>${this.point.options.label}: 
                      ${this.point.options.y.toFixed(0)}%</b></div>`;
                  }
                  return '';
                },
              },
            plotOptions: {
                series: {
                  animation: true,
                  states: {
                    hover: {
                      enabled: false,
                    },
                  },
                },
                pie: {
                  allowPointSelect: true,
                  // borderWidth: 0,
                  borderColor: '#fff',
                  dataLabels: {
                    enabled: false,
                    distance: 80,
                    crop: true,
                    overflow: 'none',
                    formatter() {
                      if (this.point.scoreLabel !== undefined) {
                        return `<b>${this.point.label}</b>`;
                      }
                      return '';
                    },
                    style: {
                      fontWeight: 'bold',
                    },
                  },
                  innerSize: innerSize ? innerSize+'%' : '50%',
                  center: ['50%', '50%'],
                },
              },
            series: data
        }
    }

    // componentDidMount() {
    //     const self = this;
    //     self.chart = Highcharts.chart(this.props.container, self.state);
    //   }

    componentWillReceiveProps(nextProps) {
      if (this.chart) {
        this.chart.destroy();
    }
    const {data, dimension, title} = nextProps
    this.setState({
        series: data,
        chart: Object.assign({}, this.state.chart,{
        height: dimension,
        width: dimension
        }),
        title: {
          text: title ? title : ''
        }
    }, () => {
      this.chart = Highcharts.chart(this.props.container, this.state);
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

DoughnutChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.any).isRequired,
    dimension: PropTypes.number.isRequired,
    innerSize: PropTypes.number,
    title: PropTypes.string
  };

export default DoughnutChart;