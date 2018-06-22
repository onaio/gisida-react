import React from 'react';
import { FilterSelector }  from '../../../../src/lib/components/Filter/FilterSelector.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const onFilterOptionClick = jest.fn();
const searchFilterOptions = jest.fn();
const onToggleAllOptions = jest.fn();

const componentWrapper = shallow(
	<FilterSelector 
		filter={{}}
		onFilterOptionClick={onFilterOptionClick}
		searchFilterOptions={searchFilterOptions}
		onToggleAllOptions={onToggleAllOptions}
		toggleAllOn={false}
		filterKey=''
	/>
);

describe('FilterSelector', () => {
	it('FilterSelector component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});