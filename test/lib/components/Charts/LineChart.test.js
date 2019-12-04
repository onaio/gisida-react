import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { LineChart }  from '../../../../src/lib/components/Charts/LineChart.jsx'
import {wrapper} from '../../../fixtures/chartComponentWrapper'


const pointClickCallback = jest.fn();
jest.useFakeTimers();

const series= [
	{ name: 'Tokyo', data: [49.9, 71.5, 106.4] }, 
	{ name: 'New York', data: [83.6, 78.8, 98.5] },
 ];

const categories = ['Jan','Feb','Mar'];

const props = {
	series: {},
	chartTitle: 'ex-title',
	chartHeight: 30,
	categories: {},
	indicator: '',
	pointClickCallback
}

const mountWrapper = wrapper(LineChart, mount, props);

describe('HorizontalBarChart', () => {
	it('HorizontalBarChart component renders correctly', () => {
		jest.runAllTimers();
		const json = toJson(mountWrapper);
		expect(json).toMatchSnapshot();
	})

	it('should set state', () => {
		mountWrapper.setState({ show: true });
		expect(mountWrapper.state('show')).toEqual(true);
	})

	it('should set props', () => {
		const propsUpdateMock = jest.spyOn(mountWrapper.instance(), 'componentWillReceiveProps');
		mountWrapper.setProps({series, categories });
		expect(mountWrapper.props().series).toEqual(series);
		expect(propsUpdateMock).toHaveBeenCalledTimes(1);
	})

	it('should unmount', () => {
		const componentUnmountMock = jest.spyOn(mountWrapper.instance(), 'componentWillUnmount');
		mountWrapper.unmount();
		expect(componentUnmountMock).toHaveBeenCalledTimes(1);
	})

});
