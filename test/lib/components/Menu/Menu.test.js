import React from 'react';
import { Menu }  from '../../../../src/lib/components/Menu/Menu.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//const categories = 

const componentWrapper = shallow(

	<Menu 
		menuId= 'menu-1'
		categories = {[]}
	/>
);

describe('Menu', () => {
	it('Menu component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});