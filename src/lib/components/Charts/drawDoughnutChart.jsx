import React from 'react'
import { ckmeans } from 'simple-statistics';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';
import DoughnutChart from './doughnutChart'

class DrawDoughnutChart extends React.Component {
    constructor(props) {
        super(props)
        const {data, layer, mapId, map} = this.props;
        this.state = {
            layer,
            data,
            mapId,
            map
        }
    }

    render() {

        // console.log(this.state.props.mapState)
        var charts = []
        const {data, layer, mapId, map} = this.props;
        const population = data.map(d => d[layer.categories.total]);
        const clusters = ckmeans(population, layer.categories.clusters);
        // create a DOM element for the marker
        data.forEach((row, index) => {
            const total = row[layer.categories.total];
            const chartArr = [];
            let chartProp = '';
            let propTotal = 0;
            let dimension;
            let i;

            if (layer.categories.title) {
            chartProp += `<div><b>${row[layer.categories.title]}</b></div>`;
            }

            if (layer.categories['total-label']) {
            chartProp += `<div>${
                layer.categories['total-label']
            }: <b>${total}</b></div>`;
            }

            for (i = 0; i < layer.categories.property.length; i += 1) {
            chartArr.push({
                color: layer.categories.color[i],
                y: parseInt((row[layer.categories.property[i]] / total) * 100, 10),
                label: layer.categories.label[i],
            });
            propTotal += parseInt(
                (row[layer.categories.property[i]] / total) * 100,
                10,
            );
            chartProp += `<div><span class="swatch" style="background: ${
                layer.categories.color[i]
            };"></span>
                ${layer.categories.label[i]}:
                <b>${((row[layer.categories.property[i]] / total) * 100).toFixed(1)}%</b></div>`;
            }

            if (layer.categories.difference) {
            chartProp += `<div><span class="swatch" style="background: ${
                layer.categories.difference[1]
            };"></span>
                ${layer.categories.difference[0]}: <b>${(100 - propTotal).toFixed(1)}%</b></div>`;
            chartArr.splice(0, 0, {
                color: layer.categories.difference[1],
                y: 100 - propTotal,
                label: layer.categories.difference[0],
            });
            }

            for (let c = 0; c < clusters.length; c += 1) {
            if (clusters[c].includes(total)) {
                dimension = layer.categories.dimension[c];
            }
            }

            const chartData = [
            {
                data: chartArr,
                size: layer.chart.size,
                innerSize: layer.chart.innerSize,
            },
            ];

            const content = `<div><b>${
            row[layer.source.join[1]]
            }</b></div>${chartProp}`;

            const el = document.createElement('div');
            el.id = `chart-${row[layer.source.join[1]]}-${layer.id}-${mapId}`;
            el.className = `marker-chart marker-chart-${layer.id}-${mapId}`;
            el.style.width = layer.chart.width;
            el.style.height = layer.chart.height;
            $(el).attr('data-map', mapId);
            $(el).attr('data-lng', row[layer.chart.coordinates[0]]);
            $(el).attr('data-lat', row[layer.chart.coordinates[1]]);
            $(el).attr('data-popup', content);

            // add marker to map
            new mapboxgl.Marker(el, {
            offset: layer.chart.offset,
            })
            .setLngLat([
                row[layer.chart.coordinates[0]],
                row[layer.chart.coordinates[1]],
            ])
            .addTo(map);

            const container = $(`#chart-${row[layer.source.join[1]]}-${layer.id}-${mapId}`)[0];
            // drawDoughnutChart(container, chartData, dimension);
            charts.push(<DoughnutChart 
                key={index}
                container={container}
                data={chartData}
                dimension={dimension}
            />)
        })
        return (
            <div> { charts }  </div>
        )
    }
}

export default DrawDoughnutChart;