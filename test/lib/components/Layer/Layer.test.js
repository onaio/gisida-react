import React from 'react';
import ConnectedLayer, { Layer }  from '../../../../src/lib/components/Layer/Layer'
import layerObj from '../../../fixtures/sample-layer.json';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import APP from '../../../fixtures/appConfig.json';
var gisida = require('gisida')

layerObj.id = 'sample-layer';
const mapId = 'map-1';

const initialState = {
  "map-1": {
    timeseries: {}
  },
  APP,
  LOC: {}
}

const mockStore = configureStore()

describe('Layer', () => {
  it('component renderes correctly', () => {
    shallow(
      <Layer
        layer={layerObj}
        mapId={mapId}
      />
    );
  });

  it('components functions are called as expected with store', () => {
    const store = mockStore(initialState);
    layerObj["zoomOnToggle"] = true;
    layerObj["visible"] = true;
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedLayer mapId={mapId} layer={layerObj} />
      </Provider>
    )

    expect(toJson(wrapper)).toMatchSnapshot();

    // test onLayerToggle function
    window["maps"] = [
      {easeTo: jest.fn()}
    ];

    //spy functions
    const toggleLayerSpy = jest.spyOn(gisida.Actions, 'toggleLayer');
    const lngLatSpy = jest.spyOn(gisida, 'lngLat');
    gisida.prepareLayer = jest.fn()
    // simulate toggle layer
    wrapper.find(`#${layerObj.id}-${mapId}`).simulate('change');

    expect(toggleLayerSpy).toHaveBeenCalledWith(mapId, layerObj.id);
    expect(window["maps"][0].easeTo).toHaveBeenCalledTimes(1);
    const { APP, LOC } = initialState;
    expect(lngLatSpy).toHaveBeenCalledWith(LOC, APP);
    expect(gisida.prepareLayer).toHaveBeenCalledWith(mapId, layerObj, store.dispatch)
    
    // remove test maps from window
    delete global.window.maps;
  })
});
