import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { getURLSearchParams } from '../utils';

export const PrivateRoute = ({ component: Component, ...rest }) => {
  // Preserve any query params when we redirect to login e.g shared layers and style
  const searchParamsString = getURLSearchParams().toString();

  return (
    <Route
      {...rest}
      render={props =>
        rest.auth && !rest.auth(rest.path) ? (
          <Redirect
            to={{ pathname: '/login', search: searchParamsString, state: { from: props.location } }}
          />
        ) : (
          <Component {...props} {...rest} />
        )
      }
    />
  );
};

export default PrivateRoute;
