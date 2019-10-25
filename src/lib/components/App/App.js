import React, { Component } from 'react';
import { SupAuth, Actions } from 'gisida';
import { connect } from 'react-redux';
import './App.scss';

class App extends Component {

  render() {
    return (
      <div className="app">
        {this.props.children}
      </div>
    );
  }
}

export default App;
