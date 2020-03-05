import React from 'react';
import Spinner  from '../../../../src/lib/components/Spinner/Spinner.js'
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';

const initialState = {
	"map-1": {blockLoad: false, showSpinner: true}
}

const mockStore = configureStore()
const store = mockStore(initialState);

describe('Spinner', () => {

    it('renders without crashing', () => {
        shallow(
            <Spinner 
                store={store}
                mapId='map-1'
                MAP={{}}
	        />
        );
    });

	it('Spinner component renders correctly', () => {
        const componentWrapper = mount(
            <Spinner 
                store={store}
                mapId='map-1'
                MAP={{}}
            />
        );
		expect(toJson(componentWrapper)).toMatchSnapshot();
	})
});