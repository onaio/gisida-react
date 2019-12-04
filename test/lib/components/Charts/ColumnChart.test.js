import ColumnChart  from '../../../../src/lib/components/Charts/ColumnChart.jsx'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import {wrapper} from '../../../fixtures/chartComponentWrapper'

const seriesData= [
	{ name: 'Tokyo', data: [49.9, 71.5, 106.4] }, 
	{ name: 'New York', data: [83.6, 78.8, 98.5] },
 ];

const categories = ['Jan','Feb','Mar'];

const props = {
	seriesData: [],
	seriesTitle: 'Ex-title',
	chartWidth: 30,
	chartHeight: 30,
	categories: [],
	yAxisLabel: 'test-chart'
}

jest.useFakeTimers();
const mountWrapper = wrapper(ColumnChart, mount, props)

describe('ColumnChart', () => {

	it('ColumnChart component renders correctly', () => {
		jest.runAllTimers();
		const json = toJson(mountWrapper)
		expect(json).toMatchSnapshot();
	})

	it('should set state', () => {
		mountWrapper.setState({ show: true });
		expect(mountWrapper.state('show')).toEqual(true)
	})

	it('should set props', () => {
		const propsUpdateMock = jest.spyOn(mountWrapper.instance(), 'componentWillReceiveProps');
		mountWrapper.setProps({seriesData, categories });
		// check if prop was updated
		expect(mountWrapper.props().seriesData).toEqual(seriesData);
		// change chart width
		mountWrapper.setProps({chartHeight:50 });
		// called each time props are updated
		expect(propsUpdateMock).toHaveBeenCalledTimes(2);
	})

	it('should unmount', () => {
		const componentUnmountMock = jest.spyOn(mountWrapper.instance(), 'componentWillUnmount');
		mountWrapper.unmount()
		expect(componentUnmountMock).toHaveBeenCalledTimes(1);
	})
	
});

