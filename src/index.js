import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App/App';
import Menu from './components/Menu/Menu';
import Map from './components/Map/Map';
import StyleSelector from './components/StyleSelector/StyleSelector';
import registerServiceWorker from './registerServiceWorker';

import { initStore } from 'gisida';

const store = initStore();

ReactDOM.render(
  (
    <Provider store={store}>
      <App>
        <Map />
        <Menu />
        <StyleSelector />
      </App>
    </Provider>
  ),
  document.getElementById('root')
);
registerServiceWorker();
