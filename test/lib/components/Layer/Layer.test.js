import React from 'react';
import Layer from '../../../../src/lib/components/Layer/Layer'
import layerObj from '../../../fixtures/sample-layer.json';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import APP from '../../../fixtures/appConfig.json';
import layer from '../../../fixtures/layers.json'

const defaultLayer = layer["Education-adolescents-15-to-18"];
defaultLayer["zoomOnToggle"] = true;
defaultLayer["visible"] = true;

const initialState = {
  "map-1": {
    timeseries: {}
  },
  APP,
  LOC: {}
}

const mockStore = configureStore()
const store = mockStore(initialState);

const mapId = 'map-1';

const componentWrapper = mount(
  <Layer
    store={store}
    layer={defaultLayer}
    mapId={mapId}
  />
);


describe('Layer', () => {

  it('component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });

  it('onLayerToggle is called when layer is checked', () => {
    global.window["maps"] = [
      {easeTo: jest.fn()}
    ];
    const mockEaseTo = jest.spyOn(window.maps[0], 'easeTo');
    componentWrapper.find('input').simulate('change');
    expect(mockEaseTo).toHaveBeenCalledTimes(1);
    delete global.window.maps;
  })

});
