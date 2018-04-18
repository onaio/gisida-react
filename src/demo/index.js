import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from '../lib/components/App/App';

import Menu from '../lib/components/Menu/Menu';
import Map from '../lib/components/Map/Map';
import StyleSelector from '../lib/components/StyleSelector/StyleSelector';
import Legend from '../lib/components/Legend/Legend';
import Filter from '../lib/components/Filter/Filter'
import registerServiceWorker from './registerServiceWorker';
import { initStore } from 'gisida';

const store = initStore();

ReactDOM.render(
  (
    <Provider store={store}>
      <App>
        <Map>
          <Menu />
          <StyleSelector />
          <Legend />
          <Filter />
        </Map>
      </App>
    </Provider>
  ),
  document.getElementById('root')
);
registerServiceWorker();