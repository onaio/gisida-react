import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';
import { isNewSeriesData } from '../../../utils';

export const isNumber = (x) => !Number.isNaN(Number(x));

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
      chartSpacing,
      chartMargin,
      legendOptions,
      series,
      tooltip,
      showLegend
    } = this.props;
    const { spacingTop, spacingRight, spacingBottom, spacingLeft } = (chartSpacing || {});
    const { marginTop, marginRight, marginBottom, marginLeft } = (chartMargin || {});
    this.state = {
      chart: {
        type: 'column',
        height: chartHeight || null,
        width: chartWidth || null,
        backgroundColor: 'rgba(255,255,255,0)',
        alignTicks: false,
        left:0,
        marginTop: isNumber(marginTop) ? marginTop : null,
        marginRight: isNumber(marginRight) ? marginRight : null,
        marginBottom: isNumber(marginBottom) ? marginBottom : null,
        marginLeft: isNumber(marginLeft) ? marginLeft : null,
        spacingTop: isNumber(spacingTop) ? spacingTop : 15,
        spacingRight: isNumber(spacingRight) ? spacingRight : 10,
        spacingBottom: isNumber(spacingBottom) ? spacingBottom : null,
        spacingLeft: isNumber(spacingLeft) ? spacingLeft : null,
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
      tooltip: tooltip || {
        useHTML: true,
        shared: true,
        headerFormat: doubleChart ?  '<b>Range: </b> {point.key} <br/>' : '<b>{point.key}: </b>',
        pointFormat: chartType ? '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f}</b><br/></td></tr>' : '',
        pointFormatter: chartType ? null : pointFormatterFunc ||
          function pointFormatterFunc() {
            return  chartType ? `<tr><td style="color:${this.color};padding:0">${this.name}: </td>' +
            '<td style="padding:0"><b>${this.y}</b></td></tr>` : `<span>${this.y.toLocaleString()}</span>`;
          },
        shadow: doubleChart ? false : true,
        backgroundColor: doubleChart ? 'transparent' : undefined,
        borderWidth: doubleChart ? 0 : 1,
        padding: doubleChart ? 0 : 8,
      },
      title: {
        text: seriesTitle || null,
      },
      credits: {
        enabled: false,
      },
      legend: legendOptions || {
        enabled: showLegend ? showLegend : true,
      },
      plotOptions: {
        column: {
          showInLegend: legendOptions && typeof legendOptions.enabled !== 'undefined' ? legendOptions.enabled : false,
          pointPadding: doubleChart || chartType === 'multi' ? 0 : 0.2,
          groupPadding: doubleChart || chartType === 'multi' ? 0.1 : 0.2,
          borderWidth: 0
        },
      },
      series: series || (chartType === 'multi' ? seriesData : 
      [
        {	
          name: seriesTitle,	
          data: seriesData,	
        },	
      ]),
    };
  }

  componentDidMount() {
    const self = this;
    
    setTimeout(() => {
      self.chart = Highcharts.chart(self.chartEl, self.state);
    }, 300);
  }

  componentWillReceiveProps(nextProps) {
    const { seriesTitle, seriesData, series, chartHeight, chartWidth, categories, xAxis, chartType, doubleChart } = nextProps;
    
    if (isNewSeriesData(this.state.series[0].data, (seriesData || series[0].data))) {
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
           } : typeof xAxis !== 'undefined' ? xAxis || null : {
             categories,
             labels: {
              style: {
                fontSize: 9,
              },
            },
           },
          series: series || chartType === 'multi' ? seriesData : 
          [
            {	
              name: seriesTitle,	
              data: seriesData,	
              animation: {
                duration: 0,
              },
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
export const pointFormatterFunc = ColumnChart.pointFormatterFunc;
export default ColumnChart;