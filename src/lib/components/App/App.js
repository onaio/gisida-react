import React, { Component } from 'react';
import { isTokenExpired } from 'gisida';
import './App.scss';
import Router from '../../routes/router';

class App extends Component {
  render() {
    return (
      <div className="app">
        {isTokenExpired() ? Router.history.push('/login') : this.props.children}
      </div>
    );
  }
}

export default App;
