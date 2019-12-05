import React from 'react';
import TitleBar from '../../../../src/lib/components/TitleBar/TitleBar.js'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';

const initialState = {
	APP: { loaded: true } 
}

const mockStore = configureStore()
const store = mockStore(initialState);

const componentWrapper = mount(
	<TitleBar 
		store={store}
	/>
);

describe('TitleBar', () => {

	it('TitleBar component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});