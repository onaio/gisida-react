// React Router Dom Wrapper
import React from 'react';
import { Router } from 'react-router-dom';
import { history } from './history';

class RouterWrapper extends React.Component {
  render() {
    return <Router history={history}><div>{this.props.children}</div></Router>
  }
}

export default RouterWrapper;
