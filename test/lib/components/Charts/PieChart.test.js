/*

Still Not entirely defined, also not sure about JSX vs JS 

import React from 'react';
import { PieChart }  from '../../../../src/lib/components/Charts/PieChart.jsx'
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const componentWrapper = shallow(
	<PieChart 
		seriesName=''
		seriesData={{}}
		seriesTitle=''
		chartWidth={number}
		chartHeight={number}
		donut={number}
	/>
);

describe('PieChart', () => {
	it('PieChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});

*/