import React from 'react';
import StyleSelector from '../../../../src/lib/components/StyleSelector/StyleSelector'
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import { Actions } from 'gisida';

const STYLES = [
  {
    label: 'Satelitte',
    url: 'mapbox://styles/mapbox/satellite-v9',
  }
]
const initialState = {
  'map-1': { showFilterPanel: true },
  STYLES,
}
const mockStore = configureStore()
const store = mockStore(initialState);

describe('StyleSelector', () => {

  it('renders without crashing', () => {
    shallow(
      <StyleSelector 
        mapId='map-1'
        store={store}
        styles={[]}
      />
    );
  });

  it('should set props', () => {
    const wrapper = mount(
      <StyleSelector 
        mapId='map-1'
        store={store}
        styles={[]}
      />
    );

    expect(toJson(wrapper)).toMatchSnapshot();

    // Add a style
    STYLES.push({
      label: 'Satelitte Streets',
      url: 'mapbox://styles/mapbox/satellite-streets-v9',
    },)
		wrapper.setProps({STYLES });
    expect(wrapper.props().STYLES).toEqual(STYLES);
    
    // change style
    const changeStyleAction = jest.spyOn(Actions, 'changeStyle');
    wrapper.find(`#${STYLES[0].label}-map-1`).simulate('change');
    expect(changeStyleAction).toHaveBeenCalledWith('map-1', STYLES[0].url);
  })
});
