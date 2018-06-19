import React from 'react';
import { Map }  from '../../../../src/lib/components/Map/Map.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//not running because mapboxgl is not defined

const style = {width:"100%",display:"inline"};

const componentWrapper = shallow(
	<Map 
		id='map-1'
		style={style}
	/>
);

describe('Map', () => {
	it('Map component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});