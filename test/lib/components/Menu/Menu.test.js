import React from 'react';
import Menu from '../../../../src/lib/components/Menu/Menu.js'
import { shallow, mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { layer1 } from '../../../fixtures/defaultLayers.js';
import { Actions } from 'gisida';

const initialState = {
    LAYERS: {groups: {} },
    APP: {loaded: true },
    categories: [],
    "map-1": {
        layers: { education: {...layer1} },
        openCategories: ["Severity of needs"],
        primaryLayer: layer1.id,
        visibleLayerId: layer1.id
    },
    REGIONS: [ ]
}

const mockStore = configureStore()
const props = { mapId: 'map-1', menuId: 'menu-1'}
const groups = {
    "Severity of needs": [
        { Education: ["education"] }
    ]
}

describe('Menu Component', () => {

    it('renders without crashing', () => {
        const store = mockStore(initialState);
        shallow( <Menu {...props} store={store} /> );
    });

    it('Menu component renders correctly with all props', () => {
        initialState.LAYERS.groups = {...groups}
        initialState.REGIONS = [
            {name: 'reg1', current: false},
            {name: 'reg2', current: true}
        ]
        const store = mockStore(initialState);
        const wrapper = mount(
            <Menu 
                {...props}
                store={store}
            />
        );
        // test snapshots
        expect(wrapper.find('Menu').props()).toMatchSnapshot('Menu props');
        expect(wrapper.find('Layers').length).toEqual(1)

        // test onToggleMenu
        const toggleMenuAction = jest.spyOn(Actions, 'toggleMenu');
        wrapper.find('a.open-btn').simulate('click');
        expect(toggleMenuAction).toHaveBeenCalledWith(props.mapId);
        wrapper.find('a.close-btn').simulate('click');
        expect(toggleMenuAction).toHaveBeenCalledTimes(2); 
        
        // test onCategoryClick
        const toggleCategoriesAction = jest.spyOn(Actions, 'toggleCategories');
        wrapper.find('li.sector').at(0).find('a').simulate('click');
        expect(toggleCategoriesAction).toHaveBeenCalledWith(props.mapId, 'Regions', -1);
        wrapper.find('li.sector').at(1).find('a').simulate('click');
        expect(toggleCategoriesAction).toHaveBeenCalledWith(props.mapId, 'Severity of needs', 0);
        expect(toggleCategoriesAction).toHaveBeenCalledTimes(2); 

        // test onRegionClick
        const changeRegionAction = jest.spyOn(Actions, 'changeRegion');
        wrapper.find('#reg1').simulate('change');
        expect(changeRegionAction).toHaveBeenCalledWith('reg1');
        expect(changeRegionAction).toHaveBeenCalledTimes(1); 
    })

});