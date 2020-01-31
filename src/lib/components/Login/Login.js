import React, { Component } from 'react';
import { connect } from 'react-redux';
import Cookie from 'js-cookie';
import { ONA, SupAuth } from 'gisida';
import './Login.scss';
import { Router } from '../../routes/router';

const { defaultUnSupAuthZ: deAuthZ } = SupAuth;

const mapStateToProps = (state) => {
  const { APP } = state;
  return {
    appPassword: APP.password,
    global: state,
    appIcon: APP.appIcon,
    loginIcon: APP.loginIcon,
    publicUsername: APP.publicUsername,
    publicPassword: APP.publicPassword
  };
};

export const isLoggedIn = function() {
  return Cookie.get('dsauth') === 'true';
};

export const logOut = (e) => {
  e.preventDefault();
  deAuthZ();
  Cookie.set('dsauth', false);
  Router.history.push('/login');
};

class Login extends Component {
  constructor(props) {
    super(props);
    const clientID = 'CdJqBZYRVrbpnAu4JoYYFXFPQJa3xWi25oDPqnRY';
    const redirectURL = location.protocol + '//' + location.host + '/callback';
    const apiBase = props.global.AUTH && props.global.AUTH.apiBase;
    this.state = {
      loginError: null,
      clientID,
      redirectURL,
      oauthURL: ONA.Oauth2.getOauthURL(clientID, redirectURL, apiBase),
      redirect: false,
    };
    this.renderRedirect = this.renderRedirect.bind(this);
  }

  renderRedirect = () => {
    if (isLoggedIn()) {
      this.setState({
        redirect: true,
      });
      return Router.Redirect('/');
    } else {
      this.setState({
        redirect: false,
      });
    }
  };

  componentWillReceiveProps(nextProps) {
    const { clientID, redirectURL } = this.state;
    const apiBase = nextProps.global.AUTH && nextProps.global.AUTH.apiBase;
    this.setState({
      oauthURL: ONA.Oauth2.getOauthURL(clientID, redirectURL, apiBase),
    });
  }

  handleLogin(password) {
    const { appPassword } = this.props;
    if (appPassword.includes(password)) {
      Cookie.set('dsauth', true);
      Router.history.push('/');
    } else {
      this.setState({ loginError: true });
    }
  }

  oauth2URL(e) {
    e.preventDefault();
    Cookie.set('dsauth', true);
    window.location.href = this.state.oauthURL;
  }

  render() {
    const { loginIcon, appIcon, publicPassword, publicUsername } = this.props;
    const loginImage = {
      background: `url(${loginIcon || appIcon}) no-repeat center center`
    };
    return this.state.redirect ? (
      this.renderRedirect()
    ) : (
      <div className="login">
        <div>
          <form className="login-form">
            <div className="form-group">
              <div className="brand-login" style={loginImage}></div>
              {this.state.loginError === true ? (
                <div className="alert alert-danger">Incorrect password.</div>
              ) : null}
              { publicPassword && publicUsername ? (
                <div>
                  <small>Username: {publicUsername}</small>
                  <br />
                  <small>Password: {publicPassword}</small>
                </div>
              ) : null
              }
            </div>
            <button
              className="btn btn-default center-block btn-block"
              onClick={(e) => this.oauth2URL(e)}
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Login);
