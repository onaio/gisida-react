import React from 'react';
import Menu from '../../../../src/lib/components/Menu/Menu.js'
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';

const initialState = {
    LAYERS: {
        groups: {

        }
    },
    APP: {loaded: true },
    categories: [],
}

const mockStore = configureStore()
const store = mockStore(initialState);
const isSplitScreen = true;

const componentWrapper = mount(

    <Menu 
		toggleSingleScreen={jest.fn()}
        toggleSplitScreen={jest.fn()}
        appConfig={{
            appIcon: 'test.jpg',
            appName: 'test app',
            appNameDesc: 'This is a test app',
            appColor: '#aaa',
        }}
        isSplitScreen={isSplitScreen}
        menuId='menu-1'
        mapId='map-1'
        categories={[{cat1: 'test'}]}
        store={store}
	/>
);

describe('Menu', () => {
	it('Menu component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
    })
    
    // it('sholud click', () => {
    //     console.log(componentWrapper.find('input').length)
    //     componentWrapper.find('input').simulate('click')
    // })
});