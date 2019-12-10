
import React from 'react';
import LocationController from "../../../../src/lib/components/LocationController/LocationController";
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';

const initialState = {
    LOC: {
        active: true,
        location: {},
        locations: {
            locA: {label: "test 1"},
            locB: {label: "test 2"}
        }
    }
 };

const mockStore = configureStore()
const store = mockStore(initialState);
const dispatch = jest.spyOn(store, 'dispatch');

const componentWrapper = mount(
	<LocationController 
        store={store}
        mapId="map-1"
        dispatch={dispatch}
	/>
);

describe('LocationController', () => {

    it('FilterSelector component renders correctly', () => {
		const json = toJson(componentWrapper);
		expect(json).toMatchSnapshot();
    })
    
    it('should call onLocationClick on click and dispatch', () => {
        componentWrapper.find('a').at(0).simulate('click');
        expect(dispatch).toHaveBeenCalledTimes(1);
    })

})