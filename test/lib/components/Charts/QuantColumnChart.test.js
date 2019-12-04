import React from 'react';
import { QuantColumnChart }  from '../../../../src/lib/components/Charts/QuantColumnChart.jsx'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = mount(
	<QuantColumnChart 
		data={[]}
		passing={[]}
	/>
);

const data = [10,20,30]
const passing = ['Jan','Feb','Mar']

describe('QuantColumnChart', () => {

	it('QuantColumnChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})

	it('should set state', () => {
		componentWrapper.setState({ show: true });
		expect(componentWrapper.state('show')).toEqual(true);
	})

	it('should set props', () => {
		const propsUpdateMock = jest.spyOn(componentWrapper.instance(), 'componentWillReceiveProps');
		componentWrapper.setProps({data, passing});
		expect(componentWrapper.props().data).toEqual(data);
		expect(propsUpdateMock).toHaveBeenCalledTimes(1);
	})
});