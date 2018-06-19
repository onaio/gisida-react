import React from 'react';
import { Filter }  from '../../../../src/lib/components/Filter/Filter.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//when showFilterPanel is set to true a lot is added 

const componentWrapper = shallow(
	<Filter 
		MAP={{isRendered: true}}
		mapId='map-1'
		doShowProfile= {false}
		showFilterPanel= {true}
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

