import React, { Component } from 'react';
import { SupAuth, Actions } from 'gisida';
import { connect } from 'react-redux';
import './App.scss';
import Router from '../../routes/router';
import { checkTokenExpiry } from '../../utils'


class App extends Component {

  render() {
    return (
      <div className="app">
        {checkTokenExpiry() ? Router.history.push('/login') : this.props.children}
      </div>
    );
  }
}

export default App;
