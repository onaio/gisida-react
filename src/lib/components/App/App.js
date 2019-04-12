import React, { Component } from 'react';
import superset from '@onaio/superset-connector';
import './App.scss';

const { authZ, deAuthZ } = superset;

const getParameterByName = (name) => {
  var match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

const getAccessToken = () =>  {
  return getParameterByName('access_token');
}

class App extends Component {
  constructor(props) {
    super(props);
    const accessToken = localStorage.getItem('access_token') || getAccessToken();
    if (!localStorage.getItem('access_token') && accessToken) {
      localStorage.setItem('access_token', accessToken);
      window.history.replaceState('asdf', 'Superset', '/');
    }
    this.state = {
      accessToken,
    };
  }
  componentWillMount() {
    const { accessToken } = this.state;
    authZ({
      token: accessToken,
      base: 'https://discover.ona.io/'
    }, (res) => console.log(res.status))
  }
  render() {
    return (
      <div className="app">
        {this.props.children}
      </div>
    );
  }
}

export default App;
