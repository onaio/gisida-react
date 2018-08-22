import React from 'react';
import * as RRD from 'react-router-dom';
import { history } from 'gisida';
import PrivateRoute from './privateRoute';
import PublicRoute from './publicRoute';

// Wrapper component for React Router Router DOM <Router>, passing props to children
export class Wrapper extends React.Component {
  render() {
    return <RRD.Router history={history}>
      <div>
        {React.Children.map(this.props.children, child =>
          React.cloneElement(child, {...child.props, ...this.props }))}
      </div>
    </RRD.Router>
  }
};

// React Router DOM Builder Functions
export const Redirect = (to) => <RRD.Redirect to={to || '/'} />;
export const Link = (to) => <RRD.Link to={to || '/'} />;

// React Router DOM Methods
export const push = (to) => { history.push(to); }

// Gisida React Router Module
export const Router = {
  Wrapper,
  Redirect,
  Link,
  PrivateRoute,
  PublicRoute,
  push,
  history,
}

export default Router;
