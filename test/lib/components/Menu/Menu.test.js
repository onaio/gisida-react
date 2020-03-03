import React from 'react';
import Menu from '../../../../src/lib/components/Menu/Menu.js'
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import { layer1 } from '../../../fixtures/defaultLayers.js';

const initialState = {
    LAYERS: {groups: {} },
    APP: {loaded: true },
    "map-1": {
        layers: {...layer1},
        openCategories: ["Severity of needs"],
        primaryLayer: layer1.id,
        visibleLayerId: layer1.id
    },
    REGIONS: [ ]
}

const mockStore = configureStore()
const props = { mapId: 'map-1', menuId: 'menu-1'}


describe('Menu Component', () => {

    it('renders without crashing', () => {
        const store = mockStore(initialState);
        shallow( <Menu {...props} store={store} /> );
    });

});