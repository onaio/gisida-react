import React from 'react';
import { AdvancedFilter }  from '../../../../src/lib/components/Filter/AdvancedFilter.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const setFilterQueries = jest.fn();

const componentWrapper = shallow(
	<AdvancedFilter 
		options={{}}
		filterKey=''
		queries={[]}
		dataType=''
		setFilterQueries={setFilterQueries}
	/>
);

describe('AdvancedFilter', () => {
	it('AdvancedFilter component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});