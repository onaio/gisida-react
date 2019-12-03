import React from 'react';
import { PieChart }  from '../../../../src/lib/components/Charts/PieChart.jsx'
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';

//Error receiving:
	//TypeError: Cannot read property 'nodeName' of undefined

const componentWrapper = mount(
	<PieChart 
		seriesName='ex-name'
		seriesData={{}}
		chartWidth={30}
		chartHeight={30}
		donut={30}
	/>
);

describe('PieChart', () => {
	it('PieChart component renders correctly', () => {
		const json = toJson(componentWrapper)
		expect(json).toMatchSnapshot();
	})
});
