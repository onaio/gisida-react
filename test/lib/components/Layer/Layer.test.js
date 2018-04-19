import React from 'react';
import { Layer }  from '../../../../src/lib/components/Layer/Layer'
import layerObj from '../../../fixtures/sample-layer.json';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';


layerObj.id = 'sample-layer';
const mapId = 'map-1';
const componentWrapper = shallow(
  <Layer
    layer={layerObj}
    mapId={mapId}
  />
);

describe('Layer', () => {
  it('component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });

  it('onLayerToggle is called when layer is checked', () => {
    const event = {
      target:
        { checked: true }
    }
    componentWrapper.instance().onLayerToggle = jest.fn();
    componentWrapper.update();
    componentWrapper.find(`#${layerObj.id}-${mapId}`).simulate('change', event);
    expect(componentWrapper.instance().onLayerToggle).toBeCalledWith(layerObj);
  })
});
