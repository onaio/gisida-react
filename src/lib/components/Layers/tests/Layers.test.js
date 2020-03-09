import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Layers from './../Layers'
import layerObj from './fixtures/sample-layer.json';

describe('Layers', () => {
  layerObj.id = 'sample-layer';
  const layers = [layerObj];
  const preparedLayers = {'sample-layer-id': layerObj}
  
  const componentWrapper = shallow(
    <Layers
      mapId={'map-1'}
      layers={layers}
      currentRegion={undefined}
      preparedLayers={preparedLayers}
    />
  );
  it('component renders correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
