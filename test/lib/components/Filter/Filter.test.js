import React from 'react';
import Filter from '../../../../src/lib/components/Filter/Filter.js'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import layer from '../../../fixtures/layers.json';

const defaultLayer = layer["Education-adolescents-15-to-18"];
const layerDuplicate = {...defaultLayer};
defaultLayer.visible = true;
const initialState = {
	"map-1": {
		layers: {...layer, "Education-adolescents-15-to-18-hc": {...defaultLayer}},
		primaryLayer: "Education-adolescents-15-to-18-hc",
		filter: {layerId: "Education-adolescents-15-to-18-hc"},
		detailView: null,
		showFilterPanel: true,
		showProfile: false,
		timeseries: {"Education-adolescents-15-to-18-hc": {...defaultLayer, layerObj: defaultLayer}}
	},
	VIEW: {splitScreen: false, dashboard: null, showMap: true}
 };

const mockStore = configureStore()
const store = mockStore(initialState);

const componentWrapper = mount(
	<Filter 
		store={store}
		MAP={{isRendered: true}}
		mapId='map-1'
		doShowProfile= {false}
		showFilterPanel= {true}
		layersObj={[]}
		layerData={{}}
	/>
);

describe('Filter', () => {
	it('Filter component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})

	it('should', () => {
		console.log(componentWrapper.find('input').length)
	})
});

