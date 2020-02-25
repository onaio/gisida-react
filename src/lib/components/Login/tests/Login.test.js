import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import Login from './../Login';
import configureMockStore from "redux-mock-store";

const mockStore = configureMockStore();
const initStore = {
    APP: {
        appIcon: '/path/to/appicon.jpg',
        appLoginIcon: '/path/to/loginicon.jpg',
        appNameDesc: 'App name description',
        password: ['$0me $s+rong p@$$w0rd']
    }
}
const store = mockStore(initStore);

afterEach(() => {
    delete process.env.REACT_APP_GISIDA_CANOPY_CLIENT_ID;
});

describe('/src/lib/components/Login', () => {
    it('renders correctly', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Login />
            </Provider>
        )
        expect(wrapper.find('div.login').length).toBe(1)
        expect(wrapper.find('img').props()).toMatchSnapshot('img')
        wrapper.unmount()
    })

    it('renders app icon as image if login icon is not provided', () => {
        const storeNoLoginIcon = mockStore({
            ...initStore,
            APP: {
                ...initStore.APP,
                appLoginIcon: undefined
            }
        });
        const wrapper = mount(
            <Provider store={storeNoLoginIcon}>
                <Login />
            </Provider>
        )
        expect(wrapper.find('img').prop('src')).toEqual('/path/to/appicon.jpg')
        wrapper.unmount()
    })

    it('renders null if basic auth password and ona oauth client ID is missing', () => {
        const storeNull = mockStore({ APP: {} });
        process.env.REACT_APP_GISIDA_CANOPY_CLIENT_ID = ''
        const wrapper = mount(
            <Provider store={storeNull}>
                <Login />
            </Provider>
        )
        expect(wrapper.isEmptyRender()).toBe(true)
        wrapper.mount()
    });

    it('renders basic auth correctly', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Login />
            </Provider>
        )
        expect(wrapper.find('BasicAuthLogin').props()).toEqual({
            appPassword: ['$0me $s+rong p@$$w0rd']
        })
        wrapper.mount()
    })

    it('renders ona oauth correctly', () => {
        process.env.REACT_APP_GISIDA_CANOPY_CLIENT_ID = 'clientId'
        const storeOnaOauth = mockStore({
            ...initStore,
            APP: {
                ...initStore.APP,
                password: undefined,

            },
        });
        const wrapper = mount(
            <Provider store={storeOnaOauth}>
                <Login />
            </Provider>
        )
        expect(wrapper.find('OnaOauthLogin')).toBeTruthy()
        wrapper.mount()
    })
})
