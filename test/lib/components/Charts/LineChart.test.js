import React from 'react';
import { LineChart }  from '../../../../src/lib/components/Charts/LineChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const pointClickCallback = jest.fn();

const componentWrapper = shallow(
	<LineChart 
		series={{}}
		chartTitle='ex-title'
		chartHeight={30}
		categories={{}}
		indicator=''
		pointClickCallback={pointClickCallback}
	/>
);

describe('LineChart', () => {
	it('LineChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});
