import React from 'react';
import TitleBar from '../../../../src/lib/components/TitleBar/TitleBar.js'
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';

const initialState = {
	APP: { loaded: true } 
}

const mockStore = configureStore()
const store = mockStore(initialState);

describe('TitleBar', () => {

	it('renders without crashing', () => {
    
    shallow( 
      <TitleBar  store={store} /> 
    );

  })
  
  it('TitleBar component renders correctly', () => {
    const wrapper = mount(
      <TitleBar  store={store} /> 
    );
		expect(toJson(wrapper)).toMatchSnapshot();
  });
  
});