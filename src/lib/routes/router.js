/* eslint-disable react/prop-types */
/**
 * Todo: add proptype for children
 */
import React from 'react';
import {
  Router as RRouter,
  Redirect as RRedirect,
  Link as RLink
} from 'react-router-dom';
import { history } from 'gisida';
import PrivateRoute from './privateRoute';
import PublicRoute from './publicRoute';
import PropTypes from 'prop-types';

// Router Builder Functions
const Redirect = (to) => <RRedirect to={to || '/'} />;
const Link = (to) => <RLink to={to || '/'} />;
const Wrapper = (history) => {
  // Wrapper component for React Router Router DOM <Router>, passing props to children
  return class Wrapper extends React.Component {
    render() {
      return <RRouter history={history}>
        <div>
          {React.Children.map(this.props.children, child =>
            React.cloneElement(child, {...child.props, ...this.props }))}
        </div>
      </RRouter>
    }
  }
}
// Gisida React Router Module
class Router {
  static instance; // define Singleton Instance - move this to const outside of class?
  constructor() {
    // check for Singleton Instance
    if (this.instance) {
      return this.instance;
    }
    // define history singleton
    this.history = history;
    
    // Builder Methods for react-router-dom components
    this.Wrapper = Wrapper(this.history);
    this.PrivateRoute = PrivateRoute;
    this.PublicRoute = PublicRoute;
    this.Redirect = Redirect;
    this.Link = Link;

    // Define this as Singleton Instance
    this.instance = this;
  }
}
Router.propTypes = {
  children: PropTypes.node.isRequired
}
export default new Router;
