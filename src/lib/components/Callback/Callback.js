import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, SupAuthZ, history } from 'gisida';
// import { stat } from 'fs';
// import { resolve } from 'dns';
// import { reject } from 'rsvp';

class Callback extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.history = history;
  }

  componentWillMount() {
    const { dispatch } = this.props;
    const accessToken = this.getAccessToken();
    dispatch(Actions.receiveToken(accessToken));
    const state = dispatch(Actions.getCurrentState());
    console.log("state", this.props.global);
    if (SupAuthZ) {
      this.authZ = new SupAuthZ({
        ...state.APP,
        ...state.AUTH,
      });
    }
    this.authZ.getUser(accessToken)
      .then(this.getAuthConfig)
      .then(({ user, res }) => {
        if (!res.ok) {
          this.history.push('/login');
        } else {
          dispatch(Actions.receiveLogin(user));
          localStorage.setItem('access_token', accessToken);
          this.history.push('/');
        }
      });
  }

  getParameterByName(name) {
    var match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
 
  getAccessToken() {
    return this.getParameterByName('access_token');
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