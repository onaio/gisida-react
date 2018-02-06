import React, { Component } from 'react';
import { connect } from 'react-redux';
import Cookie from 'js-cookie';
import './Login.scss'

export const isLoggedIn = function () {
  return Cookie.get('dsauth') === "true";
};

const mapStateToProps = (state, ownProps) => {
  return {
    appConfig: state.APP,
  }
}


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginError: false
    };
  }

  handleLogin(password) {
    if (password === this.props.appConfig.loginConfig.password) {
      Cookie.set('dsauth', true);
      window.location.reload();
    } else {
      this.setState({
        loginError: true
      });
    }
  }

  render() {
    return (
      <div
        className="login"
        style={{ background: this.props.appConfig.loginConfig.loginColor }}>
        <div>
          <form className="login-form" onSubmit={ (e) => { e.preventDefault(); this.handleLogin(this.password.value); } }>
            <div className="form-group">
              <div
                className="brand-login"
                style={{ background: "url(" + this.props.appConfig.appIcon + ") no-repeat center center" }}>
              </div>
                { this.state.loginError ? <div className="alert alert-danger">Incorrect password.</div> : null }
              <label htmlFor="password">Enter Password</label>
              <input className="form-control" type="password"  ref={(input) => { this.password = input; }} autoFocus />
            </div>
            <button className="btn btn-default center-block" type="submit">Log In</button>
          </form>
        </div>
      </div>);
  }
}

export default connect(mapStateToProps)(Login);
