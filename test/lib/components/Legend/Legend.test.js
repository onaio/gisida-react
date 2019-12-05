import React from 'react';
import {Legend} from '../../../../src/lib/components/Legend/Legend'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';

const layerObj = {"testlayer": "layer1"}
const timeSeriesObj = {"testTimelayer": "timeLayer1"};
const layers = {
  'test-layer-1': {
    'visible': true,
    'credit': "legend"
  }
};

const layersData = [layerObj];

const initialState = {
  ...layerObj,
  ...timeSeriesObj,
  mapId: 'map-1',
  primaryLayer: '',
  layers,
  activeLayerIds: ['test-layer-1'],
  MAP: {}
}

const mockStore = configureStore(initialState)
const store = mockStore(initialState)

describe('Legend', () => {

  const componentWrapper = mount(
    <Legend
      layerObj={layerObj}
      timeSeriesObj={timeSeriesObj}
      layersData={layersData}
      mapId='map-1'
      primaryLayer=''
      layers={layers}
      activeLayerIds={['test-layer-1']}
      MAP={{}}
    />
  );

  it('component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });

  it('should set props', () => {
		const propsUpdateMock = jest.spyOn(componentWrapper.instance(), 'componentWillReceiveProps');
		componentWrapper.setProps({bottom: 62});
		expect(componentWrapper.props().bottom).toEqual(62);
		expect(propsUpdateMock).toHaveBeenCalledTimes(1);
  })
  
});
