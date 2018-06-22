import React from 'react';
import { SumPieChart }  from '../../../../src/lib/components/Charts/SumPieChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<SumPieChart 
		layerId=''
		layerData={{}}
		chartSpec={{}}
		layer={{}}
	/>
);

describe('SumPieChart', () => {
	it('SumPieChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});
