import React from 'react';
import {
  Switch as RSwitch,
  Router as RRouter,
  Redirect as RRedirect,
  Link as RLink,
  withRouter,
} from 'react-router-dom';
import { history } from 'gisida';
import PrivateRoute from './privateRoute';
import PublicRoute from './publicRoute';

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
    this.Switch = RSwitch;
    this.withRouter = withRouter;

    // Define this as Singleton Instance
    this.instance = this;
  }
}

export default new Router();
