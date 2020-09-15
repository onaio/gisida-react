import React from 'react';
import Menu from '../Menu.js';
import { shallow, mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { layer2 } from '../../../../../test/fixtures/defaultLayers.js';
import { categories } from './fixtures.js';
import { Actions } from 'gisida';
import { Provider } from 'react-redux';
import toJson from 'enzyme-to-json';

const initialState = {
  LAYERS: { groups: {} },
  APP: { loaded: true },
  CATEGORIES: categories,
  'map-1': {
    layers: { Regionboundaries: { ...layer2 } },
    openCategories: ['Boundaries'],
    primaryLayer: layer2.id,
    visibleLayerId: layer2.id,
  },
  REGIONS: [],
  VIEW: {
    showMap: false,
  },
};

const mockStore = configureStore();
const props = { mapId: 'map-1', menuId: 'menu-1' };
const groups = {
  Boundaries: [{ Regionboundaries: ['regionboundaries'] }],
};

describe('Menu Component', () => {
  it('renders without crashing', () => {
    const store = mockStore(initialState);
    shallow(<Menu {...props} store={store} />);
  });

  it('Menu component renders correctly with all props', () => {
    initialState.LAYERS.groups = { ...groups };
    initialState.REGIONS = [
      { name: 'reg1', current: false },
      { name: 'reg2', current: true },
    ];
    const store = mockStore(initialState);
    const wrapper = mount(<Menu {...props} store={store} />);
    // test snapshots
    expect(wrapper.find('Menu').props()).toMatchSnapshot('Menu props');
    expect(toJson(wrapper)).toMatchSnapshot();

    // test onToggleMenu
    const toggleMenuAction = jest.spyOn(Actions, 'toggleMenu');
    wrapper.find('a.open-btn').simulate('click');
    expect(toggleMenuAction).toHaveBeenCalledWith(props.mapId);
    wrapper.find('a.close-btn').simulate('click');
    expect(toggleMenuAction).toHaveBeenCalledTimes(2);

    // test onCategoryClick
    const toggleCategoriesAction = jest.spyOn(Actions, 'toggleCategories');
    wrapper
      .find('li.sector')
      .at(0)
      .find('a')
      .simulate('click');
    expect(toggleCategoriesAction).toHaveBeenCalledWith(props.mapId, 'Regions', -1);
    wrapper
      .find('li.sector')
      .at(1)
      .find('a')
      .simulate('click');
    expect(toggleCategoriesAction).toHaveBeenCalledWith(props.mapId, 'Boundaries & Labels', -1);
    expect(toggleCategoriesAction).toHaveBeenCalledTimes(2);

    // test onRegionClick
    const changeRegionAction = jest.spyOn(Actions, 'changeRegion');
    wrapper.find('#reg1').simulate('change');
    expect(changeRegionAction).toHaveBeenCalledWith('reg1');
    expect(changeRegionAction).toHaveBeenCalledTimes(1);
  });

  it('Renders correctly when search bar is active', () => {
    initialState.APP = {
      ...initialState.APP,
      searchBar: true,
      appColor: 'red',
    };
    const store = mockStore(initialState);
    const wrapper = mount(
      <Provider store={store}>
        <Menu {...props} />
      </Provider>
    );
    expect(wrapper.find('SearchBar').length).toEqual(1);
    expect(wrapper.find('SearchBar').props()).toMatchSnapshot('search bar on');
  });
});
