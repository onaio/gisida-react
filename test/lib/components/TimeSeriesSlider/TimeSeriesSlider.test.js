import React from 'react';
import { TimeSeriesSlider }  from '../../../../src/lib/components/TimeSeriesSlider/TimeSeriesSlider.js'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

//probably need to pass something here for it actually include something in 
//the snapshot
//timeSeriesObj={{}}

const updateTimeseriesState = jest.fn();

const componentWrapper = shallow(
	<TimeSeriesSlider 
		mapId='map-1'
		
		updateTimeseriesState={updateTimeseriesState}
	/>
);

describe('TimeSeriesSlider', () => {
	it('TimeSeriesSlider component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});