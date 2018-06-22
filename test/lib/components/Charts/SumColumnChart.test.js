import React from 'react';
import { SumColumnChart }  from '../../../../src/lib/components/Charts/SumColumnChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const calcChartWidth = jest.fn();
const moveMapLedgend = jest.fn();

const componentWrapper = shallow(
	<SumColumnChart 
		mapId='map-1'
		layerId=''
		layerData={{}}
		chartSpec={{}}
		layer={{}}
		children={{}}
		locations={{}}
		chartHeight={30}
		chartWidth={30}
		isChartMin={false}
		isFullBleed={false}
		isPrimary={false}
		calcChartWidth={calcChartWidth}
		moveMapLedgend={moveMapLedgend}
	/>
);

describe('SumColumnChart', () => {
	it('SumColumnChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});