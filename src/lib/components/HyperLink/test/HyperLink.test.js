import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { HyperLink } from '../HyperLink';


describe('components/HyperLink', () => {
        const descriptionStyle =  {
            marginLeft: '45px',
            }
  it('renders without crashing', () => {
    const shallowRender = shallow(
        <HyperLink
            link='https://hello.com'
            description='hello'
            spanClassName='sub-category'
            descriptionStyle={descriptionStyle} 
        />
    );
    expect(toJson(shallowRender)).toMatchSnapshot();
  });

  it('Matches props snapshot', () => {
    const wrapper = mount(
        <HyperLink 
            link='https://hello.com'
            description='hello'
            spanClassName='sub-category' 
            descriptionStyle={descriptionStyle} 
        />
    );
    expect(toJson(wrapper.find('HyperLink'))).toMatchSnapshot();
    wrapper.unmount();
  });
});
