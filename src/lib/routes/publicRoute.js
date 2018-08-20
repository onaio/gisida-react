import React from 'react';
import { Route } from 'react-router-dom';

export const PublicRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => <Component {...props} />} />
);

export default PublicRoute;
