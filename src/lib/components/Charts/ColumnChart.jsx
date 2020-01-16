import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';
import { isNewSeriesData } from './../../utils';

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
      xAxis,
      yAxis,
      yAxisLabel,
      pointFormatterFunc,
      chartType,
      doubleChart,
    } = this.props;

    this.state = {
      chart: {
        type: 'column',
        height: chartHeight || null,
        width: chartWidth || null,
        backgroundColor: 'rgba(255,255,255,0)',
        alignTicks: false,
				left:0,
				marginRight:2,
				marginLeft:1,
				marginTop:1,
				marginBotton:20,
				spacingBottom:8,
				borderWidth: 0,
				borderRadius:0
      },
      xAxis: (doubleChart === 'multibar' || chartType === 'multi') ? { 
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        categories,  
        labels: {
            enabled: true
        },
        minorTickLength: 0,
        tickLength: 0
       } :
        typeof xAxis !== 'undefined'
          ? xAxis || null
          : {
              categories,
              labels: {
                style: {
                  fontSize: 9,
                },
              },
            },
      yAxis: (doubleChart === 'multibar' || chartType === 'multi') ? [{gridLineWidth: 0, visible: false}, ] :
        typeof yAxis !== 'undefined'
          ? yAxis || null
          : [
              {
                title: {
                  text: (yAxisLabel && yAxisLabel) || 'Target Percentage (%)',
                  y: 10,
                },
                endOnTick: false,
              },
              /** The code shows the second label which in some cases maybe undesiarable */
              /**{
                linkedTo: 0,
                opposite: true,
                title: {
                  text: (yAxisLabel && yAxisLabel) || 'Target Percentage (%)',
                  y: 10,
                  x: -10,
               },
            }, **/
            ],
      tooltip: {
        useHTML: true,
        shared: true,
        headerFormat: '<b>Range: </b> {point.key} <br/>',
        pointFormat: chartType ? '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f}</b><br/></td></tr>' : null,
        pointFormatter: chartType ? null : pointFormatterFunc ||
          function pointFormatterFunc() {
            return  chartType ? `<tr><td style="color:${this.color};padding:0">${this.name}: </td>' +
            '<td style="padding:0"><b>${this.y}</b></td></tr>` : `<span>${this.y.toLocaleString()}</span>`;
          },
        //shadow: false,
        //backgroundColor: 'transparent',
        //borderWidth: 0,
        //padding: 0,
      },
      title: {
        text: seriesTitle || null,
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        column: {
          showInLegend: true,
          pointPadding: doubleChart ? 0 : 0.2,
          groupPadding: 0,
          borderWidth: 0,
          /*tooltip: {
            distance: 0,
            padding: 0,
            pointFormatter: pointFormatterFunc || function pointFormatterFunc() {
              if (isPercent) {
                return `<span>${this.y}%</span>`;
              } else {
                return `<span>${this.y}</span>`;
              }
            },
          },*/
        },
      },
      series: chartType === 'multi' ? seriesData : 
      [
        {	
          name: seriesTitle,	
          data: seriesData,	
        },	
      ],
    };
  }

  componentDidMount() {
    const self = this;
    
    setTimeout(() => {
      self.chart = Highcharts.chart(self.chartEl, self.state);
    }, 300);
  }

  componentWillReceiveProps(nextProps) {
    const { seriesTitle, seriesData, chartHeight, chartWidth, categories, xAxis, chartType, doubleChart } = nextProps;
    
    if (isNewSeriesData(this.state.series[0].data, seriesData)) {
      if (this.chart) {
        this.chart.destroy();
      }

      this.setState(
        {
          chart: Object.assign({}, this.state.chart, {
            height: chartHeight || null,
            width: chartWidth || null,
          }),
          title: {
            text: seriesTitle || null,
          },
          xAxis: (chartType === 'multi' || doubleChart === 'multibar') ? { 
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            categories,    
            labels: {
                enabled: true
            },
            minorTickLength: 0,
            tickLength: 0
           } : {
             categories
           },
            // typeof xAxis !== 'undefined'
            //   ? xAxis || null
            //   : {
            //       categories,
            //       labels: {
            //         style: {
            //           fontSize: 9,
            //         },
            //       },
            //     },
          series: chartType === 'multi' ? seriesData : 
          [
            {	
              name: seriesTitle,	
              data: seriesData,	
            },	
          ],
        },
        () => {
          this.chart = Highcharts.chart(this.chartEl, this.state);
        }
      );
    } else if (this.chart && (chartWidth !== this.chart.chartWidth || this.chart.chartHeight)) {
      this.chart.setSize(chartWidth, chartHeight);
    }
  }

  componentWillUnmount() {
    if (this.chart) this.chart.destroy();
  }

  render() {
    return (
      <div
        ref={el => {
          this.chartEl = el;
        }}
      />
    );
  }
}

ColumnChart.propTypes = {
  seriesData: PropTypes.arrayOf(PropTypes.any).isRequired,
  seriesTitle: PropTypes.string.isRequired,
  chartWidth: PropTypes.number.isRequired,
  chartHeight: PropTypes.number.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  yAxisLabel: PropTypes.string.isRequired,
};

export default ColumnChart;
