import React from 'react';
import { FilterSelector } from '../../../../src/lib/components/Filter/FilterSelector';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('FilterSelector', () => {
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

  const filter = {
    "filterLabel": "label",
    "options": options,
    "isOpen": true,
    "dataType": 'ordinal',
  };

  const componentWrapper = shallow(
    <FilterSelector
      filter={filter}
      filterKey={filter.filterLabel}
      globalSearchField={true}
      toggleAllOn={true}
    />
  );

  it('FilterSelector component renderes correctly', () => {
    const json = toJson(componentWrapper)
    expect(json).toMatchSnapshot();
  });
});
