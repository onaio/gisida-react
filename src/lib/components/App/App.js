import React, { Component } from 'react';
import { connect } from 'react-redux';
import superset from '@onaio/superset-connector';
import './App.scss';

const { authZ, deAuthZ } = superset;

const mapStateToProps = (state, ownProps) => {
  return {
    appConfig: state.APP
  }
}

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
    }
    window.history.replaceState('asdf', 'Superset', '/');
    this.state = {
      accessToken,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { accessToken } = this.state;
    const { appConfig } = nextProps;
    if (appConfig && appConfig.supersetBase) {
      authZ({
        token: accessToken,
        base: appConfig.supersetBase
      }, (res) => {
        if (!res.ok) {
          localStorage.removeItem('access_token');
          window.location.reload();
        }
      })
    }
  }

  render() {
    return (
      <div className="app">
        {this.props.children}
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
