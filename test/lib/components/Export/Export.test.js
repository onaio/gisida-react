import React from 'react';
import { Export } from '../../../../src/lib/components/Export/Export';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Export', () => {
  const config = {
    "container": "map-1",
      "style": "mapbox://teststyle",
      "center": [
        0,
        0
      ],
      "mapBounds": [
        {
          "lng": 40,
          "lat": -1
        },
        {
          "lng": 51,
          "lat": 12
        }
    ],
      "zoom": 10,
      "preserveDrawingBuffer": true
  };
  const componentWrapper = mount(
    <Export
      mapId='map-1'
      map={{}}
      config={config}
    />
  );

  it('component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
