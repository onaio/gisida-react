import { mount } from 'enzyme';
import React from 'react';
import toJson from 'enzyme-to-json';
import OnaOauthLogin from './../OnaOauthLogin';

describe('/src/lib/components/Login/OnaOauthLogin', () => {
    const props = {
        clientID: 'client_id'
    }
    it('renders correctly', () => {
        const wrapper = mount(<OnaOauthLogin {...props} />)
        expect(toJson(wrapper)).toMatchSnapshot()
        wrapper.unmount()
    });

    it('renders null if client id is missing', () => {
        const wrapper = mount(<OnaOauthLogin />)
        expect(wrapper.isEmptyRender()).toBe(true)
        wrapper.unmount()
    });
})