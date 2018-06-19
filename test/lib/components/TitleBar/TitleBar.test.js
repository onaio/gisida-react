import React from 'react';
import { TitleBar }  from '../../../../src/lib/components/TitleBar/TitleBar.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//const appConfig = 

const componentWrapper = shallow(
	<TitleBar 
		appConfig={{loaded:true}}
	/>
);

describe('TitleBar', () => {
	it('TitleBar component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});