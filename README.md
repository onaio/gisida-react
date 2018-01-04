## Gisida-react
 React Dashboard library for [gisida](https://github.com/onaio/gisida). Includes a collection of standard componets used to build a Map Dashboard and provides functionality to also render custom components. 

 ## Installation

```
$ npm install gisida-react
```

or

```
$ yarn add gisida-react
```
### Depencies
 - Gisida `$ npm install gisida` or `$ yarn add gisida-react`


## Usage

 ```javascript
import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { initStore } from 'gisida';
import { App, TitleBar, Map, Menu, StyleSelector, Legend } from 'gisida-react';


const store = initStore();

ReactDOM.render((
  <Provider store={store}>
    <App>
      <Map />
      <Menu />
      <TitleBar />
      <StyleSelector />
      <Legend />
    </ App>
  </Provider>
), document.getElementById('root'));
```

- To render a custom react component just add it as a child under the `<App />` component. 

Example:

```javascript
class CustomComponent extends React.Component {
	render() {
		return (
      <div>
        <h1>A Simple React Component Example</h1>
      </div>
    );
  }
}

 <Provider store={store}>
    <App>
      <Map />
      <CustomComponent />
      </ App>
  </Provider>
```

- To have your compoent use the gisida state as props use [redux connect](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options). Gisida-react componets also provide a good example of how to achieve this.
