import { mount } from 'enzyme';
import React from 'react';
import toJson from 'enzyme-to-json';
import OnaOauthLogin from './../OnaOauthLogin';

beforeAll(() => {
    process.env.REACT_APP_GISIDA_CANOPY_CLIENT_ID = 'clientId'
})


afterEach(() => {
    delete process.env.REACT_APP_GISIDA_CANOPY_CLIENT_ID;
});

describe('/src/lib/components/Login/OnaOauthLogin', () => {
    it('renders correctly', () => {
        const wrapper = mount(<OnaOauthLogin />)
        expect(toJson(wrapper)).toMatchSnapshot()
        wrapper.unmount()
    });

    it('renders null if basic auth password is missing', () => {
        process.env.REACT_APP_GISIDA_CANOPY_CLIENT_ID = ''
        const wrapper = mount(<OnaOauthLogin />)
        expect(wrapper.isEmptyRender()).toBe(true)
        wrapper.unmount()
    });
})