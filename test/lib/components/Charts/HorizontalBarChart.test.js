import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { HorizontalBarChart } from '../../../../src/lib';
import {wrapper} from '../../../fixtures/chartComponentWrapper'

const props = {
	series: [],
    categories: []
}

const mountWrapper = wrapper(HorizontalBarChart, mount, props);

describe('HorizontalBarChart', () => {
	it('HorizontalBarChart component renders correctly', () => {
		const json = toJson(mountWrapper)
		expect(json).toMatchSnapshot();
	})

	it('should set state', () => {
		mountWrapper.setState({ show: true });
		expect(mountWrapper.state('show')).toEqual(true)
	})

	it('should set props', () => {
		const propsUpdateMock = jest.spyOn(mountWrapper.instance(), 'componentWillReceiveProps');
		mountWrapper.setProps({ name: 'John Doe' });
		expect(mountWrapper.props().name).toEqual('John Doe');
		expect('series' in mountWrapper.props()).toEqual(true);
		expect(propsUpdateMock).toHaveBeenCalledTimes(1);
	})

	it('should unmount', () => {
		const componentUnmountMock = jest.spyOn(mountWrapper.instance(), 'componentWillUnmount');
		mountWrapper.unmount()
		expect(componentUnmountMock).toHaveBeenCalledTimes(1);
	})

});