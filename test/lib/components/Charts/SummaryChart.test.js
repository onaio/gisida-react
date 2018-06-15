/*

Still Not entirely defined, also not sure about JSX vs JS 

import React from 'react';
import { SummaryChart }  from '../../../../src/lib/components/Charts/SummaryChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<SummaryChart 
		mapId=''
		layerId=''
		chartSpec={{}}
		layer={{}}
		locations={{}}
		saveChartState={function}
		isChartMin={bool}
		legendBottom={number}
	/>
);

describe('SummaryChart', () => {
	it('SummaryChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});

*/