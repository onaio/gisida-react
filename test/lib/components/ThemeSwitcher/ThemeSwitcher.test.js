import React from 'react';
import { ThemeSwitcher } from '../../../../src/lib/components/ThemeSwitcher/ThemeSwitcher';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const showFilterPanel = true;
const componentWrapper = shallow(
  <ThemeSwitcher
    showFilterPanel={showFilterPanel}
  />
);

describe('ThemeSwitcher', () => {
  it('ThemeSwitcher component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
