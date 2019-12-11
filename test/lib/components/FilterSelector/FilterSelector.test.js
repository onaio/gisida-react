import React from 'react';
import FilterSelector from '../../../../src/lib/components/FilterSelector/FilterSelector.js'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import layer from '../../../fixtures/layers.json';
var gisida = require('gisida')

const defaultLayer = {...layer["Education-adolescents-15-to-18"]};
const layerDuplicate = {...defaultLayer};
defaultLayer.visible = true;
const filterOptions = ["Ukhia", "Teknaf"]
const initialState = {
	MAP: {
		layers: {
			...layer,
			"Education-adolescents-15-to-18-hc": {...defaultLayer, filterOptions, region:"Ukhia"}
		}
	},
	REGIONS: [
		{current: true, name: "Ukhia"}
	]
 };

const mockStore = configureStore();
const store = mockStore(initialState);

const layerObj = {'testlayer': 'layer1'};

const componentWrapper = mount(
	<FilterSelector 
		store={store}
		layerObj={layerObj}
	/>, { attachTo: document.body }
);

describe('FilterSelector', () => {

	it('FilterSelector component renders correctly', () => {
		const json = toJson(componentWrapper);
		expect(json).toMatchSnapshot();
	})

	it('should update props', () => {
		const propsUpdateMock = jest.spyOn(componentWrapper.instance(), 'componentWillReceiveProps');
		componentWrapper.setProps({...initialState});
		expect(propsUpdateMock).toHaveBeenCalledTimes(1);
	})

	it('should update options on input change', () => {
		gisida.prepareLayer = jest.fn();
		window["GisidaMap"] = {};
		window["GisidaMap"].removeLayer = jest.fn();
		window["GisidaMap"].removeSource = jest.fn();
		const mockPrepareLayer = jest.spyOn(gisida, 'prepareLayer');
		const mockRemoveLayer = jest.spyOn(window["GisidaMap"], 'removeLayer');
		const mockResource = jest.spyOn(window["GisidaMap"], 'removeSource');
		componentWrapper.find('div.selectBox').simulate('click')
		componentWrapper.find('input').at(0).simulate('change');
		expect(mockPrepareLayer).toHaveBeenCalledTimes(1);
		expect(mockRemoveLayer).toHaveBeenCalledTimes(1);
		expect(mockResource).toHaveBeenCalledTimes(1);
		delete window["GisidaMap"];

	})

});