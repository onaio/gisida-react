# Login Component

The component returns a `BasicAuthLogin` component for Basic Authentication or a `OnaOauthLogin` component for
Ona oAuth2 Login based on configuration.

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

## Ona oAuth2 Authentication (Recommended)

### Prerequisites

[Register your client application with Ona](https://api.ona.io/static/docs/authentication.html#using-oauth2-with-the-ona-api) and obtain your client ID


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