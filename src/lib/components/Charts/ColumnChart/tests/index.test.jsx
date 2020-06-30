import React from 'react';
import ColumnChart, { isNumber, pointFormatterFunc } from '..';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('ColumnChart component', () => {
  const props =  {
        "categories": [
          "Bay",
          "Nugaal"
        ],
        "isPercent": false,
        "seriesData": [
          {
            "name": "Bay",
            "y": 326,
            "color": "rgba(0, 90, 50, 0.8)"
          },
          {
            "name": "Nugaal",
            "y": 147,
            "color": "rgba(35, 139, 69, 0.8)"
          }
        ],
        "chartWidth": 1115,
        "chartHeight": 145,
        "yAxisLabel": "Children treated",
        "showLegend": false
      }
  const componentWrapper = shallow(
    <ColumnChart {...props} />
  );

  it('component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
  it('renders and passes props correctly', () => {
    const wrapper = mount(<ColumnChart {...props}/>);
    expect(wrapper.props()).toMatchSnapshot('columnchart props')
  });
  it('checks if it\'s a number', () => {
      expect(isNumber('hello')).toEqual(false);
      expect(isNumber(100)).toEqual(true);
  })
});
