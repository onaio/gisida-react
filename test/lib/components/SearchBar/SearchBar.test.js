import React from 'react';
import SearchBar from "../../../../src/lib/components/Searchbar/SearchBar";
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Actions } from 'gisida';
import configureStore from 'redux-mock-store';
import { layer1 } from '../../../fixtures/defaultLayers.js';

const initialState = {
  APP: {appColor: 'blue' },
  LOC: {},
  "map-1": {
      layers: { education: {...layer1} }
  },
}
const mockStore = configureStore();
const mockFn = jest.fn();
const props = {
  handleSearchInput: mockFn,
  searching: false,
  handleSearchClick: mockFn,
  searchResultClick: mockFn,
  mapId: 'map-1',
  toggleSubMenu: mockFn,
  openCategoryForSharedLayers: mockFn,
}


describe('Menu Component', () => {

  it('renders without crashing', () => {
    const store = mockStore(initialState);
    shallow( <SearchBar {...props} store={store} /> );
  });

  it('SearchBar component renders correctly', () => {
    const store = mockStore(initialState);
    const wrapper = mount(
        <SearchBar 
            {...props}
            store={store}
        />
    );

    expect(toJson(wrapper)).toMatchSnapshot();
    // Search icon should be showing
    expect(wrapper.find('.fa-search').length).toEqual(1);

    wrapper.setProps({searching: true});
    wrapper.update;
    // expect cancel button to show when searching is true
    expect(wrapper.find('.fa-search').length).toEqual(0);
    expect(wrapper.find('.fa-times').length).toEqual(1);
    
    // search input not found
    wrapper.find('input').simulate('change', { target: { value: 'test search' }});
    expect(props.handleSearchInput).toHaveBeenLastCalledWith([], 'test search')

    // search input available
    wrapper.find('input').simulate('change', { target: { value: 'enrolled' }});
    expect(props.handleSearchInput).toHaveBeenLastCalledWith(expect.any(Array), 'enrolled');

    // click cancel button
    wrapper.find('.fa-times').simulate('click')
    expect(props.handleSearchClick).toHaveBeenLastCalledWith(expect.any(Object), true)
  })

})
