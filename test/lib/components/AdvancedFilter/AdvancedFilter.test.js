import React from 'react';
import { AdvancedFilter } from '../../../../src/lib/components/Filter/AdvancedFilter';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('AdvancedFilter', () => {
  const options = {
    "option1": {
      "enabled": true,
      "count": 20,
    },
    "option2": {
      "enabled": false,
      "count": 8,
    }
  };

  const filterKey = 'filterKey';

  const dataType = 'ordinal';

  const queries = [
    {
      "isOR": true,
      "val": 'test',
      "control": "contains",
    },
    {
      "isOR": true,
      "val": 'me',
      "control": "starts with", 
    },

  ];

  const componentWrapper = shallow(
    <AdvancedFilter
      filterKey={filterKey}
      options={options}
      queries={queries}
      dataType={dataType}
    />
  );

  it('AdvancedFilter component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
