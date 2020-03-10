import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Layers } from '../../../../src/lib/components/Layers/Layers'
import layerObj from '../../../fixtures/sample-layer.json';
import { layer1 } from '../../../fixtures/defaultLayers';

const layers = [{'sample-layer': {...layerObj}}];
const preparedLayers = {'sample-layer': {...layerObj}, 'education': {...layer1}}
const auth = {
  authConfigs: {
    LAYERS: {
      'sample-layer': ['gisidaUser1', 'gisidaUser2'],
      'education': ['gisidaUser2']
    },
  },
  userInfo: {
    username: 'gisidaUser1'
  }
}

describe('Layers', () => {
  
  it('component renders correctly', () => {
    shallow(
      <Layers
        mapId={'map-1'}
        layers={layers}
        currentRegion={undefined}
        preparedLayers={preparedLayers} 
      />
    )
  });

  it('should render correctly when user not authenticated', () => {
    const wrapper = shallow(
      <Layers
        mapId={'map-1'}
        layers={layers}
        currentRegion={undefined}
        preparedLayers={preparedLayers}
      />
    );
    expect(toJson(wrapper)).toMatchSnapshot('Layer without id');
    expect(wrapper.find('.sub-category').length).toEqual(1)

    // layer without id
    wrapper.setProps({layers: [{...layerObj, id: 'sample-layer'}]});
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot('Layer with id');
    expect(wrapper.find('Connect(Layer)').length).toEqual(1);
  })
});
