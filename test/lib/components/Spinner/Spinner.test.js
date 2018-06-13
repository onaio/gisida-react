import React from 'react';
import { Spinner }  from '../../../../src/lib/components/Spinner/Spinner.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
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