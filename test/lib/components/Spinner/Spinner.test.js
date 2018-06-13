import React from 'react';
import { Spinner }  from '../../../../src/lib/components/Spinner/Spinner.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//declare certain variables
const componentWrapper = shallow(
	//not sure about the right values here
	<Spinner 
		mapId='map-1'
		MAP={{}}
	/>
);

describe('Spinner', () => {
	it('Spinner component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});