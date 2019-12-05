import React from 'react';
import TimeSeriesSlider from '../../../../src/lib/components/TimeSeriesSlider/TimeSeriesSlider.js'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import layers from '../../../fixtures/layers.json'
import configureStore from 'redux-mock-store';

const initialState = {
	"map-1": {
		layers: {...layers},
		timeseries: {}
	},
}

const mockStore = configureStore()
const store = mockStore(initialState);

const updateTimeseriesState = jest.fn();

const componentWrapper = mount(
	<TimeSeriesSlider 
		store={store}
		mapId='map-1'
		updateTimeseriesState={updateTimeseriesState}
	/>
);

describe('TimeSeriesSlider', () => {
	it('TimeSeriesSlider component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});