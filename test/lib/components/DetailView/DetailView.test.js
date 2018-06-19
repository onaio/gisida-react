import React from 'react';
import { DetailView }  from '../../../../src/lib/components/DetailView/DetailView';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<DetailView 
	  MAP={{timeseries: {visibility:true}}}
	/>

	);

describe('DetailView', () => {
	it('DetailView component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});