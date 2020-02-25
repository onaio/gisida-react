# Login Component

The component returns a `BasicAuthLogin` component for Basic Authentication or a `OnaOauthLogin` component for
Ona OAuth2 Implicit Grant Type Authentication based on configuration.

## Basic Authentication (Not recommended)

In the `site-config.json` file for the client project, add the `password` property with a value for
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

## Ona OAuth2 Implicit Grant Type Authentication (Recommended)

### Prerequisites

Ona application client ID. If, you do not have the client ID, [Register your client application with Ona](https://api.ona.io/static/docs/authentication.html#using-oauth2-with-the-ona-api) to obtain yout client ID


In the `site-config.json` file for the client project, remove the property password if it exists.

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

At the root of this project, create a `.env` and copy the contents of `.env.sample` into your `.env`.
Assign your client ID to the key `REACT_APP_GISIDA_CANOPY_CLIENT_ID`