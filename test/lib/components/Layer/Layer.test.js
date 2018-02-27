import React from 'react';
import renderer from 'react-test-renderer';
import Layer from '../../../../src/lib/components/Layer/Layer'
import layerObj from '../../../fixtures/sample-layer.json';

describe('Layer', () => {
  it('Layer renders each layer indicator', () => {
    const component = renderer.create(
      <Layer
        layer={layerObj}
      />);
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});