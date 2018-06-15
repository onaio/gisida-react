/*

Still Not entirely defined, also not sure about JSX vs JS 

import React from 'react';
import { ColumnChart }  from '../../../../src/lib/components/Charts/ColumnChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<ColumnChart 
		seriesData={{}}
		seriesTitle=''
		chartWidth={number}
		chartHeight={number}
		categories={[]}
		yAxisLabel=''
	/>
);

describe('ColumnChart', () => {
	it('ColumnChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});

*/