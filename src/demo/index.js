import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from '../lib/components/App/App';
import TitleBar from '../lib/components/TitleBar/TitleBar';
import Menu from '../lib/components/Menu/Menu';
import Map from '../lib/components/Map/Map';
import StyleSelector from '../lib/components/StyleSelector/StyleSelector';
import Login, { isLoggedIn } from '../lib/components/Login/Login';
import Legend from '../lib/components/Legend/Legend';
import registerServiceWorker from './registerServiceWorker';
import { initStore } from 'gisida';

const store = initStore();
const rootElement = document.getElementById('root');

if(isLoggedIn()) {
  ReactDOM.render(
  (
    <Provider store={store}>
      <App>
        <Map />
        <TitleBar />
        <Menu />
        <StyleSelector />
        <Legend />
      </App>
    </Provider>
  ),
  rootElement);
} else {
  ReactDOM.render((
    <Provider store={store}>
      <Login />
    </Provider>
    ),
  rootElement);
}
registerServiceWorker();
