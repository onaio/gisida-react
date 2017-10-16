import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import Map from './components/Map/Map';
import Menu from './components/Menu/Menu';
import StyleSelector from './components/StyleSelector/StyleSelector';
import registerServiceWorker from './registerServiceWorker';

import MapContainer from './containers/MapContainer';
import { initStore } from 'gisida';
import { Provider, connect } from 'react-redux';

const store = initStore();

ReactDOM.render(
  <Provider store={store}>
    <App>
      <MapContainer />
      <Menu />
      <StyleSelector />
    </App>
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();
