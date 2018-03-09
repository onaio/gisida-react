import React from 'react';
import { Filter } from '../../../../src/lib/components/Filter/Filter';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Filter', () => {
    const layerObj = {
        "testlayerLabel": "layer1",
        "type": "symbol"
    };

    const layerObj2 = {
        "testlayerLabel2": "layer2",
        "type": "circle"
    };

    const layersData = [layerObj, layerObj2];
    const layers = {
        "testLayer": layerObj,
        "testLayer2": layerObj2
    };

  const componentWrapper = shallow(
    <Filter
      layerObj={layerObj}
      doShowProfile={false}
      showFilterPanel={true}
      layersObj={layersData}
      showFilterBtn={layerObj.testlayerLabel}
      layerData={layers}
    />
  );

  it('Filter component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
