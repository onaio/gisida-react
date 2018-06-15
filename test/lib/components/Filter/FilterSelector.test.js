/*

Still Not entirely defined

import React from 'react';
import { FilterSelector }  from '../../../../src/lib/components/Filter/FilterSelector.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<FilterSelector 
		filter={{}}
		onFilterOptionClick={function}
		searchFilterOptions={function}
		onToggleAllOptions={function}
		toggleAllOn=bool
		filterKey=''
	/>
);

describe('FilterSelector', () => {
	it('FilterSelector component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});

*/