import React from 'react';
import Legend from '../../../../src/lib/components/Legend/Legend'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';


const componentWrapper = shallow(
  <Legend />
);

describe('Legend', () => {
  it('Legend comonent renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
