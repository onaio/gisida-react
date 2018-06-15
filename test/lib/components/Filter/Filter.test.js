/*

Still Not entirely defined

import React from 'react';
import { Filter }  from '../../../../src/lib/components/Filter/Filter.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<Filter 
		layerObj={{}}
		doShowProfile=bool
		showFilterPanel=bool
		layersObj={[]}
		layerData={{}}
	/>
);

describe('Filter', () => {
	it('Filter component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});

*/