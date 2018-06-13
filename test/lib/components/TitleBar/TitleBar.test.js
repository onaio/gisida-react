import React from 'react';
import { TitleBar }  from '../../../../src/lib/components/TitleBar/TitleBar.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//declare certain variables
const componentWrapper = shallow(
	//need to update these values
	<TitleBar 
		appConfig={{}}
	/>
);

describe('TitleBar', () => {
	it('TitleBar component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});