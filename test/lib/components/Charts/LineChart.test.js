/*

Still Not entirely defined, also not sure about JSX vs JS 

import React from 'react';
import { LineChart }  from '../../../../src/lib/components/Charts/LineChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<LineChart 
		series={{}}
		chartTitle=''
		chartHeight={number}
		categories={[]}
		indicator=''
		pointClickCallback={function}
	/>
);

describe('LineChart', () => {
	it('LineChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});

*/