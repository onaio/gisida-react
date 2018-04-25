## gisida-react
 <h1 align="center">
<img src="http://gisida.onalabs.org/resources/img/gisida-logo.png" width="90" />
<img src="http://icons.veryicon.com/ico/System/Icons8%20Metro%20Style/Mathematic%20Plus2.ico" width="100" />
<img src="https://raw.githubusercontent.com/rexxars/react-hexagon/HEAD/logo/react-hexagon.png" width="85" />
</h1>
 
 React Dashboard library for [gisida](https://github.com/onaio/gisida). Includes a collection of standard componets used to build a Map Dashboard and provides functionality to also render custom components. 

 ## Installation
```
$ npm install gisida-react
```
**NOTE:** You can alternetively use [`yarn`](https://yarnpkg.com/en/docs/getting-started) to manage your node packages.


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
      </App>
  </Provider>
```

- To have your compoent use the gisida state as props use [redux connect](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options). Gisida-react componets also provide a good example of how to achieve this.



## Development


### Local development
- Clone repo:
```
$ git clone git@github.com:onaio/gisida-react.git
```

#### Run development server:

```
$ npm start
```


#### Run development build without server:

```
$ npm develop
```

### Prodcution build 

- Build production distribution
```
$ npm build
```

- Publish to npm
```
$ npm publish
```

## Local development
1. Check https://github.com/onaio/gisida-react/releases to see what the next release version number should be, i.e. if  the last release is `0.0.7` the next should be `0.0.8` depending on the Semantic Versioning guide, refer to (https://semver.org/).

2. Create branch for new version being released, `git checkout -b <version-number>` 

```
$ git checkout -b 0.0.8
```

3. Run `npm version <version-number>`. This creates a commit and updates version number in package.json.
```
$ npm version 0.0.8
```

4. Push release branch to Github and tag `git push -u --follow-tags origin <version-number>` e.g
```
$ git push -u --follow-tags origin 0.0.8
```

5. Merge release to master once it passes review
