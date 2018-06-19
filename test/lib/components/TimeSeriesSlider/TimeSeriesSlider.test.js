import React from 'react';
import { TimeSeriesSlider }  from '../../../../src/lib/components/TimeSeriesSlider/TimeSeriesSlider.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//updateTimeseriesState={function()}
//passes but still not passing this which says it's required
//need to figure out what pass in here!

const componentWrapper = shallow(
	<TimeSeriesSlider 
		mapId='map-1'
		timeseries={{visibility:false}}
		showFilterPanel={false}
	/>
);

describe('TimeSeriesSlider', () => {
	it('TimeSeriesSlider component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});