import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Layers from '../../../../src/lib/components/Layers/Layers'
import layerObj from '../../../fixtures/sample-layer.json';
import configureMockStore from "redux-mock-store";
import { Provider } from 'react-redux';
/** Mock store */

const mockStore = configureMockStore();
const initStore = {
  MAP: {
      openGroups: [
        {
          "count": 0,
          "group": "Demographics"
        },
        {
          "count": 1,
          "group": "Crop production"
        }
      ]
  }
}
const store = mockStore(initStore);
describe('Layers', () => {
  layerObj.id = 'sample-layer';
  const layers = [layerObj];
  const preparedLayers = {'sample-layer-id': layerObj}
  
  const componentWrapper = shallow(
    <Provider store={store}>
    <Layers
      mapId={'map-1'}
      layers={layers}
      currentRegion={undefined}
      preparedLayers={preparedLayers}
    />
    </Provider>
  );
  it('component renders correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
