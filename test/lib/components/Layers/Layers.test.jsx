import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Layers } from '../../../../src/lib/components/Layers/Layers'
import layer from '../../../fixtures/layers.json'

const defaultLayer = layer["Education-adolescents-15-to-18"];
// nesting layers
const defaultLayer2 = {...defaultLayer};
defaultLayer2['layers'] = {...defaultLayer}

delete defaultLayer.id;
const layers = [{...defaultLayer}];
const preparedLayers = {
  "Education-adolescents-15-to-18": {...defaultLayer},
  "Education-adolescents-15-to-18-hc": {...defaultLayer2}
}
  
  const componentWrapper = shallow(
    <Layers
      mapId={'map-1'}
      layers={layers}
      currentRegion={undefined}
      preparedLayers={preparedLayers}
    />
  );


describe('Layers', () => {
  
  it('component renders correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });

  it('should toggle sub menu on click', () => {
    const event = Object.assign(jest.fn(), {preventDefault: () => {}})
    componentWrapper.find('a').at(0).simulate('click', event)
    expect(componentWrapper.state('label').isOpen).toBeTruthy();
    componentWrapper.find('a').at(0).simulate('click', event)
    expect(componentWrapper.state('label').isOpen).toBeFalsy();
  })
});
