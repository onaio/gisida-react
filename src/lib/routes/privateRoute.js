import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={props => (
      // localStorage.getItem('access_token') && props.store && props.store.getState().userInfo
      !!!localStorage.getItem('access_token')
        ? <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        : <Component {...props} {...rest} />
    )} />
  );
}

export default PrivateRoute;
