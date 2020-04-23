# Login Component

The component returns a `BasicAuthLogin` component for Basic Authentication or a `OnaOauthLogin` component for
Ona OAuth2 Implicit Grant Type Authentication based on configuration.


## Basic Authentication (Not recommended)

Caution: basic authentication is not a secure method of protecting sensitive data, it should only be used to grant basic access to view sites which do not include sensitive information

Update your client project with the following changes:

In `site-config.json` file, add the `password` property with a value for
the correct password to be checked against.

```js
{
    ...
    APP: {
        ...
        "password": ["password123"],
        ...
    }
    ...
}
```

In `index.js` file

```js

import { Login, isBasicAuthLoggedIn } from 'gisida-react'
....

if (isBasicAuthLoggedIn()) {
  ReactDOM.render(
    <Provider store={store}>
        <App>
            <TitleBar />
            ...
        </App>
    </Provider>,
    rootElement
  );
} else {
  ReactDOM.render(
    <Provider store={store}>
      <Login />
    </Provider>,
    rootElement
  );
}
```

## Ona OAuth2 Implicit Grant Type Authentication (Recommended)

### Prerequisites

You must have an Ona application client ID. If, you do not have the client ID, [Register your client application with Ona](https://api.ona.io/static/docs/authentication.html#using-oauth2-with-the-ona-api) to obtain yout client ID


### Set Up

Update your client project with the following changes:

[Install `dotenv-webpack`](https://www.npmjs.com/package/dotenv-webpack) and [update the client `webpack.config.js`](https://www.npmjs.com/package/dotenv-webpack#add-it-to-your-webpack-config-file) to use `dotenv-webpack`

Add `.env` to `.gitignore`

Add a `.env` file to the root directory of your client project and assign the client ID to the key
`REACT_APP_GISIDA_CANOPY_CLIENT_ID`

```
REACT_APP_GISIDA_CANOPY_CLIENT_ID=<Your client Id>
```

Add a `.env.sample` a best practice that is used as an information file for all team members to know what keys and values may be needed. Add the variable

```
REACT_APP_GISIDA_CANOPY_CLIENT_ID=<Your client Id>
```

In `site-config.json` file, remove the property password if it exists.

```js
{
    ...
    APP: {
        ...
        "password": ["password123"], # Remove this
        ...
    }
    ...
}
```

In `index.js` file

```js

import { Login, Callback, Router } from 'gisida-react'
import { SupAuth } from 'gisidia'
....

const AppView = (
    <App>
        <TitleBar />
        ...
    </App>
);
const oauthclientID = process.env.REACT_APP_GISIDA_CANOPY_CLIENT_ID;
const LoginView = <Login oauthclientID={oauthclientID}/>;
const CallbackView = <Callback />;

ReactDOM.render(
  <Provider store={store}>
    <Router.Wrapper>
      <Router.PrivateRoute
        exact
        path="/"
        auth={SupAuth.defaultSupViewAuthC}
        component={() => AppView}
      />
      <Router.PublicRoute path="/login" component={() => LoginView} />
      <Router.PublicRoute path="/callback" component={() => CallbackView} />
    </Router.Wrapper>
  </Provider>,
  rootElement
);
```

### Deployment

Export your client ID as an environmental variable in your production server and restart. There are many
ways to achieving this and you are not confined to using the one below.

```sh
export REACT_APP_GISIDA_CANOPY_CLIENT_ID=<Your client id>
```

It is also recommended to use an additional layer of server side protection to secure static resources from
being accessible without authentication.