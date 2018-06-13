import React from 'react';
import { TimeSeriesSlider }  from '../../../../src/lib/components/TimeSeriesSlider/TimeSeriesSlider.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//declare certain variables
const componentWrapper = shallow(
	//need to update these values
	<TimeSeriesSlider 
		mapId='map-1'
		timeSeriesObj={{}}
		updateTimeseriesState={function}
	/>
);

describe('TimeSeriesSlider', () => {
	it('TimeSeriesSlider component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});