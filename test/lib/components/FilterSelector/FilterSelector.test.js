import React from 'react';
import { FilterSelector }  from '../../../../src/lib/components/FilterSelector/FilterSelector.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//declare certain variables
const componentWrapper = shallow(
	//seems like JSX goes in here 
	<FilterSelector />
);

describe('FilterSelector', () => {
	it('FilterSelector component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});