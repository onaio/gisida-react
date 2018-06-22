import React from 'react';
import { SumChartMinimize }  from '../../../../src/lib/components/Charts/SumChartMinimize.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const toggleChart = jest.fn();

const componentWrapper = shallow(
	<SumChartMinimize 
		toggleChart={toggleChart}
		label=''
		bottom={52}
	/>
);

describe('SumChartMinimize', () => {
	it('SumChartMinimize component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});
