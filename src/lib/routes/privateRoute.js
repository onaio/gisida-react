import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { getURLSearchParams } from '../utils';

export const PrivateRoute = ({ component: Component, ...rest }) => {
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
