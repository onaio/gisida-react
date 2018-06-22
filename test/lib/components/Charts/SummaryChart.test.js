import React from 'react';
import { SummaryChart }  from '../../../../src/lib/components/Charts/SummaryChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//Error receiving:
	//ReferenceError: $ is not defined

const saveChartState = jest.fn();

const componentWrapper = shallow(
	<SummaryChart 
		mapId='map-1'
		layerId=''
		chartSpec={{}}
		layer={{}}
		locations={{}}
		showMinimize={true}
		isChartMin={true}
		saveChartState={saveChartState}
		legendBottom={52}
	/>
);

describe('SummaryChart', () => {
	it('SummaryChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});