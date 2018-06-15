/*

Still Not entirely defined, also not sure about JSX vs JS 

import React from 'react';
import { SumColumnChart }  from '../../../../src/lib/components/Charts/SumColumnChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<SumColumnChart 
		mapId=''
		layerId=''
		layerData={{}}
		chartSpec={{}}
		layer={{}}
		children={{}}
		locations={{}}
		chartHeight={number}
		chartWidth={number}
		isChartMin={bool}
		isFullBleed={bool}
		isPrimary={bool}
		calcChartWidth={function}
		moveMapLedgend={function}
	/>
);

describe('SumColumnChart', () => {
	it('SumColumnChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});

*/