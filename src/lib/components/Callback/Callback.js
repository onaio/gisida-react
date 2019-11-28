import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, SupAuth, history } from 'gisida';

const { defaultUnSupAuthZ:deAuthZ } = SupAuth;

class Callback extends Component {
  constructor(props) {
    super(props);
    this.state = { loaded: false };
    this.history = history;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.loaded
      && nextProps.global.APP
      && nextProps.global.APP.loaded) {
      this.setState({
        loaded: true,
        APP: { ...nextProps.global.APP },
       }, () => {
        this.authorizeUser(this.state.APP);
      });
    }
  }

  async authorizeUser(APP) {
    const { dispatch } = this.props;
    const { AUTH } = this.props.global;
    const accessToken = this.getAccessToken();
    const expiryTime = this.getExpiryTime();
    localStorage.setItem('expiry_time', expiryTime)
    dispatch(Actions.receiveToken(accessToken));
    const { isAuth,  authConfig, user } = await SupAuth.authorizeUser(APP, AUTH, accessToken);
    if (isAuth && authConfig) {
      dispatch(Actions.getAuthConfigs(authConfig));
    }
    if (!accessToken) {
      deAuthZ();
      return this.history.push('/login');
    }
    // const user = await SupAuth.getUser(accessToken, dispatch);
    dispatch(Actions.receiveLogin(user));
    return this.history.push('/');
  }

  getParameterByName(name) {
    var match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
 
  getAccessToken() {
    return this.getParameterByName('access_token');
  }

  getExpiryTime() {
    const expiresIn = Number(this.getParameterByName('expires_in'))/3600;
    const now = new Date();
    return now.setHours(now.getHours() + expiresIn);
  }

  render() {
    return (
      <div>
        <img alt="loading..." src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    global: state,
  }
};

export default connect(mapStateToProps)(Callback);