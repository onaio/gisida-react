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
        appPassword: APP.password,
        appNameDesc: APP.appNameDesc
    };
};

class Login extends Component {
    render() {
        if (!this.props.appPassword || !(this.props.clientID && this.props.redirectUri)) {
            return null;
        }

        const { appPassword, publicPassword, publicUsername, appNameDesc } = this.props;

        return (
            <div className="login">
                <img className="brand-login" src={loginIcon || appIcon} title={appNameDesc} alt={appNameDesc}></img>
                {appPassword ?
                    <BasicAuthLogin appPassword={appPassword} />
                    :
                    <OnaOauthLogin
                        publicUsername={publicUsername}
                        publicPassword={publicPassword}
                        clientID={clientID}
                        redirectUri={redirectUri}
                    />
                }
            </div>
        )


    }
}

export default connect(mapStateToProps)(Login);
