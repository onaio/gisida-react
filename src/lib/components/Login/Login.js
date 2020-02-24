import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Login.scss';
import BasicAuthLogin from './BasicAuthLogin'
import OnaOauthLogin from './OnaOauthLogin'

const mapStateToProps = state => {
    const { APP } = state;
    return {
        appIcon: APP.appIcon,
        loginIcon: APP.appLoginIcon,
        publicUsername: APP.authPublicUsername,
        publicPassword: APP.authPublicPassword,
        clientID: APP.authClientID,
        redirectUri: APP.authRedirectUri,
        appPassword: APP.password,
    };
};

class Login extends Component {
    getLoginImageStyle() {
        const { loginIcon, appIcon } = this.props;

        if (!loginIcon && !appIcon) {
            return {}
        }

        return {
            background: `url(${loginIcon || appIcon}) no-repeat center center`,
        };
    }

    render() {
        const { appPassword, clientID, redirectUri, publicPassword, publicUsername } = this.props;
        const loginImageStyle = this.getLoginImageStyle

        if (!appPassword || !(clientID && redirectUri)) {
            return null;
        }

        return (
            <div className="login">
                appPassword ?
            <BasicAuthLogin loginImageStyle={loginImageStyle} appPassword={appPassword} />
                :
            <OnaOauthLogin
                    loginImageStyle={loginImageStyle}
                    publicUsername={publicUsername}
                    publicPassword={publicPassword}
                    clientID={clientID}
                    redirectUri={redirectUri}
                />
            </div>
        )


    }
}

export default connect(mapStateToProps)(Login);
