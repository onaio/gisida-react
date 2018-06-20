import React from 'react';
import { FilterSelector }  from '../../../../src/lib/components/FilterSelector/FilterSelector.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
//import layerObj from '../../../fixtures/sample-layer.json';

const layerObj = {'testlayer': 'layer1'};

const componentWrapper = shallow(
	<FilterSelector 
		layerObj={layerObj}
	/>
);

describe('FilterSelector', () => {
	it('FilterSelector component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});