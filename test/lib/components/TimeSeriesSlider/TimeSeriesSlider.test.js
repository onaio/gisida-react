import React from 'react';
import TimeSeriesSlider from '../../../../src/lib/components/TimeSeriesSlider/TimeSeriesSlider.js'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import periodData from '../../../fixtures/periodData.json';
import { layer1 } from '../../../fixtures/defaultLayers';
import samplLayer from '../../../fixtures/defaultLayers'
var gisida = require('gisida')

samplLayer['id'] = 'sample-layer';

const initialState = {
	"map-1": {
		primaryLayer: "sample-layer",
		showFilterPanel: false,
		layers: {"sample-layer": {...samplLayer}},
		timeseries: {}
	},
}

const newState = { "education": {
	...periodData,
	layer1,
	layerObj: {...layer1},
	colorStops: [[1], [1,2,3,4]]
	} 
};

const mockStore = configureStore()
const store = mockStore(initialState);

const updateTimeseriesState = jest.fn();

describe('TimeSeriesSlider', () => {

	it('TimeSeriesSlider component renders correctly', () => {
    const wrapper = mount(
      <TimeSeriesSlider 
        store={store}
        mapId='map-1'
        updateTimeseriesState={updateTimeseriesState}
      />
    );

		expect(toJson(wrapper)).toMatchSnapshot();
	})

	it('should set props', () => {
    const propsUpdateMock = jest.spyOn(wrapper.instance(), 'componentWillReceiveProps');
    const wrapper = mount(
      <TimeSeriesSlider 
        store={store}
        mapId='map-1'
        updateTimeseriesState={updateTimeseriesState}
      />
    );
		defaultLayer.visible = true;
		initialState["map-1"].timeseries = { ...newState };
		wrapper.setProps({...initialState});
		expect(propsUpdateMock).toHaveBeenCalledWith({...initialState});
	})

	it('should handle input change', () => {
		gisida.generateStops = jest.fn().mockReturnValue([1,2,3,4]);
		wrapper.find('input',).simulate('change', {target: {value: 1}})
		expect(gisida.generateStops).toHaveBeenCalledTimes(1)
	})
});