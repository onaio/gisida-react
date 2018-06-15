/*

Still Not entirely defined, also not sure about JSX vs JS 

import React from 'react';
import { SumChartMinimize }  from '../../../../src/lib/components/Charts/SumChartMinimize.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<SumChartMinimize 
		toggleChart={function}
		label=''
		bottom={number}
	/>
);

describe('SumChartMinimize', () => {
	it('SumChartMinimize component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});

*/