import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';

class BarChartStacked extends React.Component {
  static tooltipPointFormatter() {
    return `<b>${this.series.name}:</b> ${this.y.toLocaleString()}`;
  }

  static stackLabelsFormatter() {
    // Custom formatting to get the label below the bar as designed
    const over = this.axis.series[0].yData[this.x];
    const actual = this.axis.series[2].yData[this.x] + over;
    const planned = this.axis.series[1].yData[this.x] + this.axis.series[2].yData[this.x];
    let percent = 0;

    // Color to be used in styling the resulting percentage
    const color = actual > planned ? '#66ba4b' : '#349ac4';

    // Handle missing / zero data situations
    if (planned !== 0) {
      percent = Math.floor((actual / planned) * 100).toLocaleString();
    } else if (planned === 0 && actual !== 0) {
      percent = 'NaN';
    }

    return `${actual.toLocaleString()} of ${planned.toLocaleString()} planned <span style="color:${color};">(${percent}%)</span>`;
  }

  constructor(props) {
    super(props);

    const { barCategories, barSeries } = this.props;

    this.state = {
      chart: {
        type: 'bar',
      },
      title: {
        text: null,
      },
      tooltip: {
        headerFormat: '',
        pointFormatter: BarChartStacked.tooltipPointFormatter,
      },
      xAxis: {
        categories: barCategories.categories,
        labels: {
          align: 'right',
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: null,
        },
        stackLabels: {
          enabled: true,
          align: 'left',
          verticalAlign: 'bottom',
          y: 15,
          formatter: BarChartStacked.stackLabelsFormatter,
        },
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          cursor: 'pointer',
          stacking: 'normal',
          dataLabels: {
            enabled: false,
          },
        },
      },
      series: barSeries.series,
      credits: {
        enabled: false,
      },
    };
  }

  componentDidMount() {
    this.chart = Highcharts.chart(this.chartEl, this.state);
  }

  componentWillReceiveProps(nextProps) {
    this.chart.destroy();
    const { barSeries, barCategories } = nextProps;
    this.setState({
      series: barSeries.series,
      xAxis: {
        categories: barCategories.categories,
        labels: {
          align: 'right',
        },
      },
    });
  }

  componentDidUpdate() {
    this.chart = Highcharts.chart(this.chartEl, this.state);
  }

  componentWillUnmount() {
    this.chart.destroy();
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

BarChartStacked.propTypes = {
  barCategories: PropTypes.objectOf(PropTypes.any).isRequired,
  barSeries: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default BarChartStacked;
