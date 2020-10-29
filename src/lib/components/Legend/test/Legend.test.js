import React from 'react';
import { Legend } from '../Legend';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Legend', () => {
  const layerObj = {"testlayer": "layer1"}
  const timeSeriesObj = {"testTimelayer": "timeLayer1"};
  const layers = {
    'test-layer-1': {
      'visible': true,
      'credit': "legend"
    }
  };
  const layersData = [layerObj];

  const componentWrapper = shallow(
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
});
