import { mount } from 'enzyme';
import React from 'react';
import toJson from 'enzyme-to-json';
import BasicAuthLogin from './../BasicAuthLogin';

describe('/src/lib/components/Login/BasicAuthLogin', () => {
    const props = {
        appPassword: ['password123']
    }

    it('renders correctly', () => {
        const wrapper = mount(<BasicAuthLogin {...props} />)
        expect(wrapper.props()).toEqual(props)
        expect(toJson(wrapper)).toMatchSnapshot()
        wrapper.unmount()
    });

    it('renders null if basic auth password is missing', () => {
        const wrapper = mount(<BasicAuthLogin />)
        expect(wrapper.isEmptyRender()).toBe(true)
        wrapper.unmount()
    });

    it('handles incorrect password correctly', () => {
        const wrapper = mount(<BasicAuthLogin {...props} />)
        const passwordInput = wrapper.find('input');
        passwordInput.instance().value = 'password';
        passwordInput.simulate('change');
        wrapper.find('form.login-form').simulate('submit');
        expect(wrapper.find('div.alert-danger').text()).toEqual('Incorrect password.')
        wrapper.unmount()
    })

    it('handles correct password correctly', () => {
        const wrapper = mount(<BasicAuthLogin {...props} />)
        const passwordInput = wrapper.find('input');
        passwordInput.instance().value = 'password123';
        passwordInput.simulate('change');
        wrapper.find('form.login-form').simulate('submit');
        expect(wrapper.find('div.alert-danger').exists()).toBeFalsy()
        wrapper.unmount()
    })
})