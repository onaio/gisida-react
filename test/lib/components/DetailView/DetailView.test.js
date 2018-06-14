import React from 'react';
import { DetailView }  from '../../../../src/lib/components/DetailView/DetailView';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('DetailView', () => {
	const componentWrapper = shallow(
	<DetailView />
	);
	it('DetailView component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});