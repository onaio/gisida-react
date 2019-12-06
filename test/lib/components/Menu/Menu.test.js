import React from 'react';
import Menu from '../../../../src/lib/components/Menu/Menu.js'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import layer from '../../../fixtures/layers.json'

const defaultLayer = layer["Education-adolescents-15-to-18"];
const groups = [
    {
      "Children Benefiting from Psychosocial Activities": [
        "children-psychological-activities"
      ]
    }
  ]
const layers = {
    ...layer,
    "Education-adolescents-15-to-18-hc": defaultLayer
}

const initialState = {
    LAYERS: { groups: { } },
    APP: {loaded: true },
    categories: [],
    "map-1": {
        layers: {...layers},
        openCategories: ["Child Protection"]
    },
    REGIONS: [
        {name: 'reg1', current: false},
        {name: 'reg2', current: true}
    ]
}

const mockStore = configureStore()
var store = mockStore(initialState);

var componentWrapper = mount(
    <Menu 
        menuId='menu-1'
        mapId='map-1'
        categories={[{cat1: 'test'}]}
        store={store}
	/>
);

const instance = componentWrapper.instance();

describe('Menu', () => {
	it('Menu component renders correctly without layer groups', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
    })
    
    it('should click', () => {
        // to add check of confirming if the functions where called

        // onToggleMenu
        componentWrapper.find('input').at(0).simulate('change');
        // onRegionClick
        componentWrapper.find('a').at(0).simulate('click');
        componentWrapper.find('a').at(1).simulate('click');
        // onCategoryClick
        componentWrapper.find('a').at(2).simulate('click');
        componentWrapper.find('a').at(3).simulate('click');
    })

    it('Menu component renders correctly with layer groups', () => {
        initialState.LAYERS.groups = {
            "child protection": groups
        }
        store = mockStore(initialState);
        componentWrapper = mount(
            <Menu 
                menuId='menu-1'
                mapId='map-1'
                categories={[{cat1: 'test'}]}
                store={store}
            />
        );
        const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
        
    })
});