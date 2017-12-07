import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App/App';
import Menu from './components/Menu/Menu';
import MapContainer from './containers/MapContainer';
import MenuContainer from './containers/MenuContainer'
import StyleSelectorContainer from './containers/StyleSelectorContainer';
import registerServiceWorker from './registerServiceWorker';

import { initStore } from 'gisida';

const store = initStore();

ReactDOM.render(
  (
    <Provider store={store}>
      <App>
        <MapContainer />
        <MenuContainer />
        <StyleSelectorContainer />
      </App>
    </Provider>
  ),
  document.getElementById('root')
);
registerServiceWorker();
