import React from 'react';
import LanguageSwitcher from '../LanguageSwitcher';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

describe('LanguageSwitcher', () => {
  const initialState = {
    APP: {
      translation: [
        { label: 'English', param: 'en' },
        { label: 'ជនជាតិខ្មែរ', param: 'khmer' },
      ],
      languageSwitcherConfigs: {
        English: {
          param: 'en',
        },
        ជនជាតិខ្មែរ: {
          param: 'khmer',
        },
      },
      languageTranslations: {
        khmer: {
          'Indicator 2.2 RCFs ': 'ជនជាតិខ្មែរ ជនជាតិខ្មែរ',
        },
      },
      mapLanguageTranslation: false,
    },
  };
  const mockStore = configureStore();

  it('renders without crashing', () => {
    const store = mockStore(initialState);
    shallow(
      <Provider store={store}>
        <LanguageSwitcher />
      </Provider>
    );
  });

  it('component renders correctly', () => {
    const store = mockStore(initialState);
    const wrapper = mount(
      <Provider store={store}>
        <LanguageSwitcher />
      </Provider>
    );
    expect(wrapper.text()).toMatchSnapshot('Text snapshot');
    expect(wrapper.html()).toMatchSnapshot('Elements snapshot');
  });
});
