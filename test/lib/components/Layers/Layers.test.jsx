import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Layers from '../../../../src/lib/components/Layers/Layers'
import layerObj from '../../../fixtures/sample-layer.json';

describe('Layers', () => {
  layerObj.id = 'sample-layer';
  const layers = [layerObj];
  
  const componentWrapper = shallow(
    <Layers
      mapTargetId={'map-1'}
      layers={layers}
      currentRegion={undefined}

    />
  );

  it('Layers component renders correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
