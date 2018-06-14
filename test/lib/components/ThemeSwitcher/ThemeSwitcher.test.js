import React from 'react';
import { ThemeSwitcher } from '../../../../src/lib/components/ThemeSwitcher/ThemeSwitcher';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const showFilterPanel = true;

describe('ThemeSwitcher', () => {
  const componentWrapper = shallow(
  <ThemeSwitcher
    showFilterPanel={showFilterPanel}
  />
  );
  it('ThemeSwitcher component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
