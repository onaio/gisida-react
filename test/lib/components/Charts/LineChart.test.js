import React from 'react';
import { LineChart }  from '../../../../src/lib/components/Charts/LineChart.jsx'
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const pointClickCallback = jest.fn();

const componentWrapper = mount(
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
		// componentWrapper.instance().componentWillReceiveProps()
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});
