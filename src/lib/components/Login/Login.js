import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Cookie from 'js-cookie';
import { SupAuth, isTokenExpired } from 'gisida';
import './Login.scss';
import BasicAuthLogin from './BasicAuthLogin/BasicAuthLogin';
import OnaOauthLogin from './OnaOauthLogin/OnaOauthLogin';

const { defaultUnSupAuthZ: deAuthZ } = SupAuth;

const mapStateToProps = (state, ownProps) => {
  const { APP } = state;
  return {
    appIcon: APP.appIcon,
    loginIcon: APP.appLoginIcon,
    appPassword: APP.password,
    appNameDesc: APP.appNameDesc,
    oauthProvider: ownProps.oauthProvider || 'onadata',
  };
};

export const killSession = () => {
  Cookie.remove('dsauth');
  localStorage.removeItem('expiry_time');
  deAuthZ();
};

export const isLoggedIn = function() {
  const hasCookie = Cookie.get('dsauth') === 'true';
  const tokenIsExpired = isTokenExpired();
  if (!hasCookie || tokenIsExpired) {
    killSession();
    return false;
  }
  return true;
};

class Login extends Component {
  render() {
    if (!this.props.appPassword && !this.props.oauthclientID) {
      return null;
    }

    const {
      appPassword,
      appNameDesc,
      loginIcon,
      appIcon,
      oauthclientID,
      oauthProvider,
      publicPassword,
      publicUsername,
    } = this.props;

    return (
      <div className="login">
        <img
          className="brand-login"
          src={loginIcon || appIcon}
          title={appNameDesc}
          alt={appNameDesc}
        ></img>
        {appPassword ? (
          <BasicAuthLogin appPassword={appPassword} />
        ) : (
          <OnaOauthLogin
            clientID={oauthclientID}
            provider={oauthProvider}
            publicPassword={publicPassword}
            publicUsername={publicUsername}
          />
        )}
      </div>
    );
  }
}

Login.propTypes = {
  clientID: PropTypes.string,
  appIcon: PropTypes.string,
  loginIcon: PropTypes.string,
  appPassword: PropTypes.arrayOf(PropTypes.string),
  appNameDesc: PropTypes.string,
};

export default connect(mapStateToProps)(Login);
