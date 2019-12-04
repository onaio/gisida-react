import React from 'react';
import SumChartMinimize  from '../../../../src/lib/components/Charts/SumChartMinimize.jsx'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import { Provider } from "react-redux";

const toggleChart = jest.fn();

const initialState = {
	"map-1": {
		showFilterPanel: true
	}
}

const mockStore = configureStore()
const store = mockStore(initialState);

const componentWrapper = mount(
	<SumChartMinimize 
		store={store}
		toggleChart={toggleChart}
		label='teststate'
		bottom={52}
		mapId='map-1'
	/>
);

describe('SumChartMinimize', () => {

	it('SumChartMinimize component renders correctly', () => {
		const json = toJson(componentWrapper);
		expect(json).toMatchSnapshot();
	})


	it('should set state', () => {
		componentWrapper.setState({ show: true });
		expect(componentWrapper.state('show')).toEqual(true);
	})

	it('should set props', () => {
		const propsUpdateMock = jest.spyOn(componentWrapper.instance(), 'componentWillReceiveProps');
		componentWrapper.setProps({bottom: 62});
		expect(componentWrapper.props().bottom).toEqual(62);
		expect(propsUpdateMock).toHaveBeenCalledTimes(1);
	})

	it('click should call toggleChart function', () => {
		componentWrapper.find('a').simulate('click');
		expect(toggleChart).toHaveBeenCalledTimes(1)
	})
});
