import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={props => (
      rest.auth && !rest.auth()
        ? <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        : <Component {...props} {...rest} />
    )} />
  );
}

export default PrivateRoute;
