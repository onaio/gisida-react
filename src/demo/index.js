import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from '../lib/components/App/App';
import TitleBar from '../lib/components/TitleBar/TitleBar';
import Menu from '../lib/components/Menu/Menu';
import Map from '../lib/components/Map/Map';
import StyleSelector from '../lib/components/StyleSelector/StyleSelector';
import Legend from '../lib/components/Legend/Legend';
import FilterSelector from '../lib/components/FilterSelector/FilterSelector';
import Filter from '../lib/components/Filter/Filter'
import registerServiceWorker from './registerServiceWorker';
import { initStore } from 'gisida';

const store = initStore();

ReactDOM.render(
  (
    <Provider store={store}>
      <App>
        <Map />
        <TitleBar />
        <Menu />
        <StyleSelector />
        <Legend />
        <Filter />
      </App>
    </Provider>
  ),
  document.getElementById('root')
);
registerServiceWorker();