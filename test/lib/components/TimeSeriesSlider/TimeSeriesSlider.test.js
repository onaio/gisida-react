import React from 'react';
import TimeSeriesSlider from '../../../../src/lib/components/TimeSeriesSlider/TimeSeriesSlider.js'
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import periodData from '../../../fixtures/periodData.json';
import { layer1 } from '../../../fixtures/defaultLayers';
import sampleLayer from '../../../fixtures/sample-layer.json'
var gisida = require('gisida')

sampleLayer['id'] = 'sample-layer';
sampleLayer['visible'] = false;
layer1['visible'] = true;

const initialState = {
	"map-1": {
		primaryLayer: "education",
		showFilterPanel: false,
		layers: {"sample-layer": {...sampleLayer}, "education": {...layer1}},
		timeseries: {}
	},
}

const newState = { "education": {
	...periodData,
	...layer1,
  layerObj: layer1,
  layerId: 'education',
	colorStops: [[1], [1,2,3,4]]
	} 
};

const mockStore = configureStore()
const store = mockStore(initialState);

const updateTimeseriesState = jest.fn();

describe('TimeSeriesSlider', () => {

  it('renders without crashing', () => {
    shallow(
      <TimeSeriesSlider 
        store={store}
        mapId='map-1'
        updateTimeseriesState={updateTimeseriesState}
      />
    )
  })

	it('TimeSeriesSlider component renders correctly', () => {
    const wrapper = mount(
      <TimeSeriesSlider 
        store={store}
        mapId='map-1'
        updateTimeseriesState={updateTimeseriesState}
      />
    );

    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
	})

	it('should update correctly on input change', () => {
    gisida.generateStops = jest.fn().mockReturnValue([1,2,3,4]);
    const updateTimeseriesSpy = jest.spyOn(gisida.Actions, 'updateTimeseries');
    const wrapper = mount(
      <TimeSeriesSlider 
        store={store}
        mapId='map-1'
        updateTimeseriesState={updateTimeseriesState}
      />
    );
    // update props:  
		initialState["map-1"].timeseries = { ...newState };
    wrapper.setProps({...initialState});
    wrapper.find('input').simulate('change', {target: {value: 1}});
    
    const props = wrapper.props();

    expect(props['map-1'].timeseries).toEqual(newState);
    expect(updateTimeseriesSpy).toHaveBeenCalledTimes(1);
    expect(gisida.generateStops).toHaveBeenCalledWith(newState['education'], 'period', store.dispatch, 1);
	})

});