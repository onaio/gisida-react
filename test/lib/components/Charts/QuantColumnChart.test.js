import React from 'react';
import { QuantColumnChart }  from '../../../../src/lib/components/Charts/QuantColumnChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<QuantColumnChart 
		data={[]}
		passing={[]}
	/>
);

describe('QuantColumnChart', () => {
	it('QuantColumnChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});