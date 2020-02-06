import React, { Component } from 'react';
import { connect } from 'react-redux';
import './OnaOauthLogin.scss';
import { useOAuthLogin } from '@onaio/gatekeeper/dist/components/login';
import { AuthorizationGrantType } from '@onaio/gatekeeper';

const mapStateToProps = state => {
  const { APP } = state;
  return {
    appIcon: APP.appIcon,
    loginIcon: APP.appLoginIcon,
    publicUsername: APP.authPublicUsername,
    publicPassword: APP.authPublicPassword,
    clientID: APP.authClientID,
    redirectUri: APP.authRedirectUri,
  };
};

class OnaOauthLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authorizationUris: {},
    };
  }
  componentDidUpdate(prevProps) {
    if (
      prevProps.clientID !== this.props.clientID ||
      prevProps.redirectUri !== this.props.redirectUri
    ) {
      const providers = {
        onadata: {
          accessTokenUri: '',
          authorizationUri: 'https://api.ona.io/o/authorize/',
          clientId: this.props.clientID,
          redirectUri: this.props.redirectUri,
          scopes: ['read', 'write'],
          state: 'abc',
          userUri: 'https://api.ona.io/user',
        },
      };
      const options = {
        providers,
        authorizationGrantType: AuthorizationGrantType.IMPLICIT,
      };
      const authorizationUris = useOAuthLogin(options);
      this.setState({
        authorizationUris,
      });
    }
  }

  getProviderKey() {
    return Object.keys(this.state.authorizationUris).filter(key => key === 'onadata')[0];
  }

  render() {
    const { loginIcon, appIcon, publicPassword, publicUsername } = this.props;
    const loginImage = {
      background: `url(${loginIcon || appIcon}) no-repeat center center`,
    };
    const providerKey = this.getProviderKey();

    return (
      <div className="login">
        <div>
          <form className="login-form">
            <div className="form-group">
              <div className="brand-login" style={loginImage}></div>
              {publicPassword && publicUsername ? (
                <div>
                  <small>Username: {publicUsername}</small>
                  <br />
                  <small>Password: {publicPassword}</small>
                </div>
              ) : null}
            </div>
            <a
              className="btn btn-default center-block btn-block"
              href={this.state.authorizationUris[providerKey]}
            >
              Login
            </a>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(OnaOauthLogin);
