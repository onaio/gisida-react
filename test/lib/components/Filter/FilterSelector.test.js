import React from 'react';
import FilterSelector  from '../../../../src/lib/components/Filter/FilterSelector.js'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import filterData from '../../../fixtures/filterData.json';

const initialState = { };

const mockStore = configureStore()
const store = mockStore(initialState);

const onFilterOptionClick = jest.fn();
const searchFilterOptions = jest.fn();
const onToggleAllOptions = jest.fn();

const componentWrapper = mount(
	<FilterSelector 
		store={store}
		filter={{}}
		onFilterOptionClick={onFilterOptionClick}
		searchFilterOptions={searchFilterOptions}
		onToggleAllOptions={onToggleAllOptions}
		toggleAllOn={false}
		filterKey=''
	/>
);

describe('FilterSelector', () => {

	it('FilterSelector component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})

	it('should set props', () => {
		const propsUpdateMock = jest.spyOn(componentWrapper.instance(), 'componentWillReceiveProps');
		componentWrapper.setProps({...filterData});
		expect(propsUpdateMock).toHaveBeenCalledTimes(1);
	})

	it('should call passed prop fuctions on call', () => {
		// console.log(componentWrapper.find('input').length)
		componentWrapper.find('input').at(1).simulate('change')
		expect(onToggleAllOptions).toHaveBeenCalledTimes(1)
		// expect(searchFilterOptions).toHaveBeenCalledTimes(1)

		componentWrapper.find('input').at(2).simulate('change')
		expect(onFilterOptionClick).toHaveBeenCalledTimes(1)

		componentWrapper.find('input').at(0).simulate('change')
		expect(searchFilterOptions).toHaveBeenCalledTimes(1)
	})
});