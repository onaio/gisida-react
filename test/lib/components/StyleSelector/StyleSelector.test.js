import React from 'react';
import { StyleSelector } from '../../../../src/lib/components/StyleSelector/StyleSelector'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const styles = [
  {
    label: 'Satelitte',
    url: 'mapbox://styles/mapbox/satellite-v9',
  },
  {
    label: 'Satelitte Streets',
    url: 'mapbox://styles/mapbox/satellite-streets-v9',
  },
]
const componentWrapper = shallow(
  <StyleSelector styles={styles}/>
);

describe('StyleSelector', () => {
  it('StyleSelector component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
