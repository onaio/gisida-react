import React from 'react';
import { Spinner }  from '../../../../src/lib/components/Spinner/Spinner.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//declare certain variables
const componentWrapper = shallow(
	//seems like JSX goes in here 
	<Spinner />
);

describe('Spinner', () => {
	it('Spinner component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});