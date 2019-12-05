import React from 'react';
import ThemeSwitcher from '../../../../src/lib/components/ThemeSwitcher/ThemeSwitcher';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';

const showFilterPanel = true;
const initialState = {
  "map-1": {
    showFilterPanel
  }
}

const mockStore = configureStore()
const store = mockStore(initialState);

describe('ThemeSwitcher', () => {
  const componentWrapper = mount(
  <ThemeSwitcher
    store={store}
  />
  );

  it('ThemeSwitcher component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
    // should click btn
    componentWrapper.find('button').simulate('click');
  });
  
});
