import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { PieChart }  from '../../../../src/lib/components/Charts/PieChart.jsx'
import {wrapper} from '../../../fixtures/chartComponentWrapper'

const seriesData= [
	['test 1', 10 ], 
	['test 2', 98.5]
 ];

// const seriesData = {
// 	test1: 60,
// 	test2: 40
// }

const props = {
	seriesName: 'ex-name',
	seriesData: {},
	chartWidth: 30,
	chartHeight: 30,
	donut: 30,
	seriesTitle: 'test chart'
}

const mountWrapper = wrapper(PieChart, mount, props);

describe('HorizontalBarChart', () => {
	it('HorizontalBarChart component renders correctly', () => {
		const json = toJson(mountWrapper);
		expect(json).toMatchSnapshot();
	})

	it('should set state', () => {
		mountWrapper.setState({ show: true });
		expect(mountWrapper.state('show')).toEqual(true);
	})

	it('should set props', () => {
		const propsUpdateMock = jest.spyOn(mountWrapper.instance(), 'componentWillReceiveProps');
		mountWrapper.setProps({seriesData});
		expect(mountWrapper.props().seriesData).toEqual(seriesData);
		expect(propsUpdateMock).toHaveBeenCalledTimes(1);
	})

	it('should unmount', () => {
		const componentUnmountMock = jest.spyOn(mountWrapper.instance(), 'componentWillUnmount');
		mountWrapper.unmount();
		expect(componentUnmountMock).toHaveBeenCalledTimes(1);
	})

});
