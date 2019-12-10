import React from 'react';
import TimeSeriesSlider from '../../../../src/lib/components/TimeSeriesSlider/TimeSeriesSlider.js'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import layer from '../../../fixtures/layers.json'
import configureStore from 'redux-mock-store';
import periodData from '../../../fixtures/periodData.json';
var gisida = require('gisida')

const defaultLayer = layer["Education-adolescents-15-to-18"];

const initialState = {
	"map-1": {
		primaryLayer: "Education-adolescents-15-to-18",
		showFilterPanel: false,
		layers: {...layer, "Education-adolescents-15-to-18-hc": {...defaultLayer}},
		timeseries: {}
	},
}

const newState = { "Education-adolescents-15-to-18": {
	...periodData,
	...defaultLayer,
	layerObj:defaultLayer,
	layerId: "Education-adolescents-15-to-18",
	colorStops: [[1], [1,2,3,4]]
	} 
};

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

	it('should set props', () => {
		const propsUpdateMock = jest.spyOn(componentWrapper.instance(), 'componentWillReceiveProps');
		defaultLayer.visible = true;
		initialState["map-1"].timeseries = { ...newState };
		componentWrapper.setProps({...initialState});
		expect(propsUpdateMock).toHaveBeenCalledTimes(1);
	})

	it('should handle input change', () => {
		gisida.generateStops = jest.fn().mockReturnValue([1,2,3,4]);
		componentWrapper.find('input',).simulate('change', {target: {value: 1}})
		expect(gisida.generateStops).toHaveBeenCalledTimes(1)
	})
});