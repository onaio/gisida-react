import React from 'react';
import { Legend } from '../../../../src/lib/components/Legend/Legend'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Legend', () => {
  const layerObj = {"testlayer": "layer1"}
  const timeSeriesObj = {"testTimelayer": "timeLayer1"};
  const layersData = [layerObj];

  const componentWrapper = shallow(
    <Legend
      layerObj={layerObj}
      timeSeriesObj={timeSeriesObj}
      layersData={layersData}
      mapId='map-1'
      primaryLayer=''
      MAP={{}}
    />
  );

  it('component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
