import React from 'react';
import { TitleBar }  from '../../../../src/lib/components/TitleBar/TitleBar.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//declare certain variables
const componentWrapper = shallow(
	//seems like JSX goes in here 
	<TitleBar />
);

describe('TitleBar', () => {
	it('TitleBar component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});