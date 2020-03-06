import React from 'react';
import ThemeSwitcher from '../../../../src/lib/components/ThemeSwitcher/ThemeSwitcher';
import { shallow, mount } from 'enzyme';
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

  it('renders without crashing', () => {
    shallow(
      <ThemeSwitcher
        store={store}
      />
    );
  });

  it('Switches themes as expected', () => {
    const wrapper = mount(
      <ThemeSwitcher
        store={store}
      />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    // check if current active theme is 'light'
    expect(wrapper.find('button.light').length).toEqual(1);
    expect(wrapper.find('button.dark').length).toEqual(0);
    // toggle theme
    wrapper.find('div.theme-toggle').simulate('click')
    // check if active theme is 'dark'
    expect(wrapper.find('button.light').length).toEqual(0);
    expect(wrapper.find('button.dark').length).toEqual(1);
  });
});
