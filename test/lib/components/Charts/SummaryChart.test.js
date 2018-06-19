/*

NOT SURE WHAT'S GOING ON HERE COMPARED TO REACT DEVTOOLS
ALSO FAILING SAYING $ IS NOT DEFINED?


import React from 'react';
import { SummaryChart }  from '../../../../src/lib/components/Charts/SummaryChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//saveChartState={function}
//legendBottom={number}

const componentWrapper = shallow(
	<SummaryChart 
		mapId='map-1'
		layerId=''
		chartSpec={{}}
		layer={{}}
		locations={{}}
		showMinimize={true}
		isChartMin={true}
		
	/>
);

describe('SummaryChart', () => {
	it('SummaryChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});

*/