import React, { Component } from 'react';
import { SupAuth } from 'gisida';
import './App.scss';

class App extends Component {
  constructor() {
    super()
    this.checkIfAuthenticated = this.checkIfAuthenticated.bind(this)
  }

  checkIfAuthenticated() {
    const isAuthenticated = JSON.parse(localStorage.getItem('AUTH')).AUTH.isAuthenticated
    const csvId = JSON.parse(localStorage.getItem('csvId'))
    const token = localStorage.getItem('access_token')
    if (csvId && isAuthenticated) {
      SupAuth.getMediaAuthConfig(csvId, token)
    }
    
  }

  render() {
    this.checkIfAuthenticated()
    return (
      <div className="app">
        {this.props.children}
      </div>
    );
  }
}

export default App;
