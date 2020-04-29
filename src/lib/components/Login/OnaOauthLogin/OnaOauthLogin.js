import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { useOAuthLogin, AuthorizationGrantType } from '@onaio/gatekeeper';

class OnaOauthLogin extends Component {
  constructor(props) {
    super(props);
    const { clientID } = this.props
    let authorizationUris = {}

    if (clientID) {
      const redirectUri = location.protocol + '//' + location.host + '/callback';
      const providers = {
        onadata: {
          accessTokenUri: '',
          authorizationUri: 'https://api.ona.io/o/authorize/',
          clientId: clientID,
          redirectUri: redirectUri,
          scopes: ['read', 'write'],
          state: 'abc',
          userUri: 'https://api.ona.io/user',
        },
      };
      const options = {
        providers,
        authorizationGrantType: AuthorizationGrantType.IMPLICIT,
      };
      authorizationUris = useOAuthLogin(options);
    }

    this.state = {
      authorizationUris
    };
  }


  render() {
    const { provider, publicPassword, publicUsername } = this.props

    if (!this.props.clientID || !this.state.authorizationUris[provider]) {
      return null;
    }

    return (
      <form className="login-form">

        <div className="form-group">
        {publicPassword && publicUsername ? (
                <div>
                  <small>Username: {publicUsername}</small>
                  <br />
                  <small>Password: {publicPassword}</small>
                </div>
              ) : null}
          <a
            className="btn btn-default center-block btn-block"
            href={this.state.authorizationUris[provider]}
          >
            Login
            </a>
        </div>
      </form>
    
    );
  }
}

OnaOauthLogin.defaultProps = {
  provider: 'onadata'
}

OnaOauthLogin.PropTypes = {
  clientID: PropTypes.string.isRequired,
  provider: PropTypes.string,
}

export default OnaOauthLogin
