import React from 'react';
import StyleSelector from '../../../../src/lib/components/StyleSelector/StyleSelector'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';

const STYLES = [
  {
    label: 'Satelitte',
    url: 'mapbox://styles/mapbox/satellite-v9',
  },
  {
    label: 'Satelitte Streets',
    url: 'mapbox://styles/mapbox/satellite-streets-v9',
  },
]

const initialState = {
  STYLES
}

const mockStore = configureStore()
const store = mockStore(initialState);

const componentWrapper = mount(
  <StyleSelector 
    styles={STYLES}
    store={store}
  />
);

describe('StyleSelector', () => {

  it('StyleSelector component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });

  it('should set props', () => {
		const propsUpdateMock = jest.spyOn(componentWrapper.instance(), 'componentWillReceiveProps');
		componentWrapper.setProps({STYLES });
		// check if prop was updated
		expect(componentWrapper.props().STYLES).toEqual(STYLES);
		// change chart width
		componentWrapper.setProps({chartHeight:50 });
		// called each time props are updated
    expect(propsUpdateMock).toHaveBeenCalledTimes(2);
  })
  
  it('should call change style on input change', () => {
    componentWrapper.find('input').at(0).simulate('change')
  })
});
