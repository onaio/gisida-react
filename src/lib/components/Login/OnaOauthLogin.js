import React, { Component } from 'react';
import { useOAuthLogin } from '@onaio/gatekeeper/dist/components/login';
import { AuthorizationGrantType } from '@onaio/gatekeeper';

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
    const { loginImageStyle, publicPassword, publicUsername } = this.props;
    const providerKey = this.getProviderKey();

    return (
      <form className="login-form">
        <div className="form-group">
          <div className="brand-login" style={loginImageStyle}></div>
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
    );
  }
}

export default OnaOauthLogin
