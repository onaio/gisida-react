import React from 'react';
import PropTypes from 'prop-types';
import PieChart from './PieChart';
import { hexToRgbA } from '../../utils';

class SumPieChart extends React.Component {
  static tooltipFormatter() {
    return `<div style="text-align:center;">
              <b style="font-size:30px">${this.y}</b>
              <br>
              <span style="font-size:12px">${this.point.options.x}</span>
            </div>`;
  }

  static tooltipPositioner(labelWidth, labelHeight) {
    const chartHeight = this.chart.options.chart.height;

    return {
      x: (chartHeight / 2) - (labelWidth / 2),
      y: (chartHeight / 2) - (labelHeight / 2),
    };
  }

  static buildPieData(layerData, chartSpec, layer) {
    if (!chartSpec) return [];

    const { breaks, colors } = layer;

    const dataMap = {};
    let i = 0;
    let datum = null;
    let dBreak;
    const column = chartSpec.column; // column name definied by host
    const layerObj = layer.layerObj ? layer.layerObj : layer;

    let dataBreaks;
    if (breaks) {
      dataBreaks = layerData.map((d) => {
        for (let b = 0; b < breaks.length; b += 1) {
          if (d[column] <= breaks[b]) return b;
        }
        return breaks.length - 1;
      });
    }

    // Aggregate data
    if (chartSpec.type === 'status') {
      // loop through dataset
      for (i; i < layerData.length; i += 1) {
        datum = layerData[i];
        // check for status category in dataMap
        if (!dataMap[datum[column]]) {
          // create it if it doesn't exist
          dataMap[datum[column]] = {
            count: 0, // start with a count of 0
            color: layerObj.categories.color[datum[column] - 1], // define the color to use
            label: layerObj.categories.label[datum[column] - 1],
          };
        }
        // increment the count of the datum category
        dataMap[datum[column]].count += 1;
      }
    } else if (chartSpec.type === 'breaks') {
      for (i; i < layerData.length; i += 1) {
        datum = layerData[i];
        dBreak = dataBreaks[i];
        if (!dataMap[dBreak]) {
          dataMap[dBreak] = {
            count: 0,
            color: Array.isArray(colors) ? colors[dBreak] : colors,
            label: layer.categories && layer.categories.label && layer.categories.label[dBreak]
              ? layer.categories.label[dBreak]
              : `${!dBreak ? 0 : breaks[dBreak - 1]} - ${breaks[dBreak]}`,
          };
        }
        dataMap[dBreak].count += 1;
      }
    }

    // return an array suitable for Highcharts
    return Object.keys(dataMap).map(category => ({
      name: dataMap[category].label,
      y: dataMap[category].count,
      x: dataMap[category].count > 1 ? `${chartSpec.level}s` : chartSpec.level,
      color: hexToRgbA(dataMap[category].color, 0.8),
    }));
  }

  constructor(props) {
    super(props);
    const { layerId, layerData, layer, chartSpec } = this.props;
    this.toggleChart = this.toggleChart.bind(this);

    this.state = {
      isChartMin: false,
      layerId,
      chartSpec,
      seriesData: SumPieChart.buildPieData(layerData, chartSpec, layer),
      tooltipOptions: {
        backgroundColor: 'rgba(255,255,255,0)',
        borderWidth: 0,
        shadow: false,
        useHTML: true,
        formatter: SumPieChart.tooltipFormatter,
        positioner: SumPieChart.tooltipPositioner,
      },
      legendOptions: {
        align: 'right',
        layout: 'vertical',
        floating: true,
        itemStyle: {
          lineHeight: 21,
        },
        labelFormat: chartSpec.percentSuffix ? '{name}%' : '{name}',
        verticalAlign: 'middle',
        x: 110,
        y: 0,
      },
      chartSpacing: {
        spacing: [10, 100, 10, 0],
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    const { layerId, layerData, layer, chartSpec } = nextProps;

    this.setState({
      layerId,
      chartSpec,
      seriesData: SumPieChart.buildPieData(layerData, chartSpec, layer),
    });
  }

  toggleChart() {
    this.setState({
      isChartMin: !this.state.isChartMin,
    });
  }

  render() {
    const { seriesName, seriesData, tooltipOptions, legendOptions, chartSpacing } = this.state;
    const { chartSpec } = this.state;

    const chartClass = `pie${this.state.isChartMin ? ' min' : ''}`;

    return (
      <div className={chartClass}>
        {chartSpec.title ? (<h6>{chartSpec.title}</h6>) : ''}
        <PieChart
          seriesName={seriesName}
          seriesData={seriesData}
          chartWidth={325}
          chartHeight={225}
          donut={50}
          tooltipOptions={tooltipOptions}
          legendOptions={legendOptions}
          showInLegend
          chartSpacing={chartSpacing}
        />
      </div>
    );
  }
}

SumPieChart.propTypes = {
  layerId: PropTypes.string.isRequired,
  layerData: PropTypes.objectOf(PropTypes.any).isRequired,
  chartSpec: PropTypes.objectOf(PropTypes.any).isRequired,
  layer: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default SumPieChart;
