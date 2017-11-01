import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App/App';
import registerServiceWorker from './registerServiceWorker';
import MapContainer from './containers/MapContainer';
import MenuContainer from './containers/MenuContainer'
import StyleSelectorContainer from './containers/StyleSelectorContainer';
import { MAP } from './reducers/Reducers';


import Menu from './components/Menu/Menu';

import { initStore } from 'gisida';

const store = initStore({ MAP });

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
