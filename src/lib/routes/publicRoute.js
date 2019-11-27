import React from 'react';
import { Route } from 'react-router-dom';

export const PublicRoute = ({ component: Component, ...rest }) => {
  console.log('<====>')
  return(
  <Route {...rest} render={props => <Component {...props} {...rest} />} />
)};

export default PublicRoute;
