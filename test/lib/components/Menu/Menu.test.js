import React from 'react';
import { Menu }  from '../../../../src/lib/components/Menu/Menu.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//const categories = 
//menuId= 'menu-1'
//		categories = {[]}
const isSplitScreen = true;

const componentWrapper = shallow(

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
    categories={[]}
	/>
);

describe('Menu', () => {
	it('Menu component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});