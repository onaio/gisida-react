import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Share from '../Share';

describe('Share', () => {
  beforeAll(() => {
    Object.defineProperty(document, 'execCommand', {
      copy: jest.fn().mockImplementation(() => {
        return '';
      }),
    });
  });
  it('renders correctly', () => {
    const wrapper = shallow(<Share />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
