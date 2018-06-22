import React from 'react';
import { ColumnChart }  from '../../../../src/lib/components/Charts/ColumnChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<ColumnChart 
		seriesData={{}}
		seriesTitle='Ex-title'
		chartWidth={30}
		chartHeight={30}
		categories={[]}
		yAxisLabel='Ex-label'
	/>
);

describe('ColumnChart', () => {
	it('ColumnChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});

