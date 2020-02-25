# Login Component

The component returns a `BasicAuthLogin` component for Basic Authentication or a `OnaOauthLogin` component for
Ona OAuth2 Implicit Grant Type Authentication based on configuration.


## Basic Authentication (Not recommended)

In your client project's `site-config.json`, add the `password` property with a value for
the correct password to be checked against.

```
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

```
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

In your client project's `site-config.json`, remove the property password if it exists.

```
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

```
import { Login, Callback, Router } from 'gisida-react'
....

const AppView = (
    <App>
        <TitleBar />
        ...
    </App>
);
const LoginView = <Login />;

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

### Local development

At the root of this project, create a `.env` and copy the contents of `.env.sample` into your `.env`.
Assign your client ID to the key `REACT_APP_GISIDA_CANOPY_CLIENT_ID`