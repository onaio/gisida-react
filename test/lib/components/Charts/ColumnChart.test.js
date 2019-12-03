import React from 'react';
import ColumnChart  from '../../../../src/lib/components/Charts/ColumnChart.jsx'
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import {wrapper} from '../../../fixtures/chartComponentWrapper'

const props = {
	seriesData:[],
	seriesTitle:'Ex-title',
	chartWidth:30,
	chartHeight:30,
	categories:[],
	yAxisLabel:'Ex-label'
}

const mountWrapper = wrapper(ColumnChart, mount, props)

describe('ColumnChart', () => {
	it('ColumnChart component renders correctly', () => {
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
		expect('seriesData' in mountWrapper.props()).toEqual(true);
		expect(propsUpdateMock).toHaveBeenCalledTimes(1);
	})
	
});

