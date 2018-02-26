import React from 'react';
import PropTypes from 'prop-types';
import ColumnChart from './ColumnChart';
import { debounce, hexToRgbA } from '../../utils';

class SumColumnChart extends React.Component {
  static buildColData(layerData, chartSpec, layer, locations) {
    if (!chartSpec) return [];

    const { breaks, colors } = layer;

    const dataMap = {};
    const categories = [];
    let i = 0;
    let datum = null;
    const column = chartSpec.column; // column name definied by host
    let catCol = '';
    let mapCol = false; // bool for whether or not to use the "locations" map

    // deifine which break each datum falls into
    let dataBreaks;
    if (breaks) {
      dataBreaks = layerData.map((d) => {
        for (let b = 0; b < breaks.length; b += 1) {
          if (Number(d[column]) <= Number(breaks[b])) return b;
        }
        return breaks.length - 1;
      });
    }

    // Push the data into categorical buckets
    catCol = chartSpec.level;
    if (catCol === 'district_id' && locations && Object.keys(locations).length) mapCol = true;
    for (i; i < layerData.length; i += 1) {
      datum = layerData[i];
      if (!dataMap[datum[catCol]]) {
        dataMap[datum[catCol]] = {
          sum: 0,
          count: 0,
          color: '',
          name: !mapCol ? datum[catCol] : locations[datum[catCol]],
        };
      }
      dataMap[datum[catCol]].count += 1;
      dataMap[datum[catCol]].sum += Number(datum[column]);
      if (dataBreaks) dataMap[datum[catCol]].color = hexToRgbA(colors[dataBreaks[i]], 0.8);
    }

    // Structure the data in a way that highcharts can use
    let data = [];
    const dataKeys = Object.keys(dataMap);
    let category;
    for (let d = 0; d < dataKeys.length; d += 1) {
      category = dataKeys[d];
      if (typeof dataMap[category].name !== 'undefined') {
        data.push({
          name: dataMap[category].name,
          y: dataMap[category].sum / dataMap[category].count,
          color: dataMap[category].color,
        });
      }
    }

    // Sort the data by value (greatest to lowest)
    data = data.sort((a, b) => b.y - a.y);
    // build the categories from sorted data
    for (i = 0; i < data.length; i += 1) {
      categories.push(data[i].name);
    }

    return {
      categories,
      data,
    };
  }

  constructor(props) {
    super(props);
    const { layerId, layerData, chartSpec, layer, isPrimary, locations } = this.props;
    const { chartHeight, chartWidth, isFullBleed, isChartMin } = this.props;

    this.state = {
      isChartMin: isPrimary ? isChartMin : false,
      layerId,
      chartSpec,
      layer,
      chartHeight,
      chartWidth,
      isFullBleed,
      isPrimary,
      seriesName: layerData.label,
      seriesData: SumColumnChart.buildColData(layerData, chartSpec, layer, locations),
    };
  }

  componentDidMount() {
    if (this.state.isPrimary) {
      if (this.state.isFullBleed) {
        this.props.moveMapLedgend(175);
      }
      this.d_setChartWidth = debounce(this.setChartWidth, 200);
      $(window).on('toggleSector', this.setChartWidth.bind(this));
      $(window).on('resize', {
        mapId: this.props.mapId,
        sectorsId: `${(this.props.mapId).replace('map-', 'sector-menu-')}-wrapper`,
      }, this.d_setChartWidth.bind(this));
    }
  }

  componentWillReceiveProps(nextProps) {
    const { layerId, layerData, chartSpec, layer, isPrimary, locations } = nextProps;
    const { chartHeight, chartWidth, isFullBleed, isChartMin } = nextProps;

    this.setState({
      layerId,
      chartSpec,
      layer,
      isChartMin: isPrimary ? isChartMin : false,
      chartHeight,
      chartWidth,
      isFullBleed,
      seriesData: SumColumnChart.buildColData(layerData, chartSpec, layer, locations),
    });
  }

  componentWillUnmount() {
    if (this.state.isPrimary) {
      this.props.moveMapLedgend();
      $(window).off('toggleSector', this.setChartWidth);
      $(window).off('resize', this.d_setChartWidth);
    }
  }

  setChartWidth(e, payload) {
    const { mapId, sectorsId } = payload || e.data;
    if (mapId === this.props.mapId) {
      const chartPosition = this.props.calcChartWidth(sectorsId);
      if (chartPosition.isFullBleed !== this.state.isFullBleed) {
        this.props.moveMapLedgend();
      } else {
        this.setState({
          chartWidth: chartPosition.chartWidth,
        });
      }
    }
  }

  render() {
    const { seriesData, isChartMin, isFullBleed, chartSpec, isPrimary } = this.state;
    const { chartWidth, chartHeight } = this.state;
    const chartClass = `sumChart column${isChartMin ? ' min' : ''}`;
    const containerHeight = isChartMin ? '24px' : `${chartHeight}px`;
    const containerWidth = isChartMin ? '24px' : chartWidth;
    const containerRight = isChartMin ? '32px' : isFullBleed ? '0px' : '340px';

    return this.state.isChartMin ? null : (
      <div
        className={`${isPrimary ? chartClass : 'column'}`}
        style={{
          width: containerWidth,
          height: containerHeight,
          right: containerRight,
          bottom: '0px',
        }}
      >
        {!isPrimary && chartSpec.title ? (<h6>{chartSpec.title}</h6>) : ''}
        <ColumnChart
          seriesTitle={chartSpec.title}
          categories={seriesData.categories}
          seriesData={seriesData.data}
          targetMark={1}
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          yAxisLabel={chartSpec['y-axis-label']}
        />
        {!isPrimary ? '' : this.props.children}
      </div>
    );
  }
}

SumColumnChart.propTypes = {
  mapId: PropTypes.string.isRequired,
  layerId: PropTypes.string.isRequired,
  layerData: PropTypes.objectOf(PropTypes.any).isRequired,
  chartSpec: PropTypes.objectOf(PropTypes.any).isRequired,
  layer: PropTypes.objectOf(PropTypes.any).isRequired,
  children: PropTypes.objectOf(PropTypes.any).isRequired,
  locations: PropTypes.objectOf(PropTypes.any).isRequired,
  chartHeight: PropTypes.number.isRequired,
  chartWidth: PropTypes.number.isRequired,
  isChartMin: PropTypes.bool.isRequired,
  isFullBleed: PropTypes.bool.isRequired,
  isPrimary: PropTypes.bool.isRequired,
  calcChartWidth: PropTypes.func.isRequired,
  moveMapLedgend: PropTypes.func.isRequired,
};

export default SumColumnChart;
