import React from 'react';
import DetailView from '../../../../src/lib/components/DetailView/DetailView';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';

const initialState = {
}

const mockStore = configureStore()
const store = mockStore(initialState);


const componentWrapper = mount(
	<DetailView 
	store={store}
	  MAP={{timeseries: {visibility:true}}}
	/>

	);

describe('DetailView', () => {
	it('DetailView component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})

	it('should set props', () => {
		const propsUpdateMock = jest.spyOn(componentWrapper.instance(), 'componentWillReceiveProps');
		componentWrapper.setProps({bottom: 62});
		expect(componentWrapper.props().bottom).toEqual(62);
		expect(propsUpdateMock).toHaveBeenCalledTimes(1);
	})
});