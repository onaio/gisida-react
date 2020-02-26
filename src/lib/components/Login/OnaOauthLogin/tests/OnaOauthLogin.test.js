import { mount } from 'enzyme';
import React from 'react';
import toJson from 'enzyme-to-json';
import OnaOauthLogin from './../OnaOauthLogin';

describe('/src/lib/components/Login/OnaOauthLogin', () => {
    const props = {
        clientID: 'client_id',
        provider: 'onadata'
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

    it('renders default oauth provider if provider is not provided', () => {
        const propsDefaultProvider = {
            clientID: 'client_id'
        }
        const wrapper = mount(<OnaOauthLogin  {...propsDefaultProvider} />)
        expect(toJson(wrapper)).toMatchSnapshot()
        wrapper.unmount()
    })
})