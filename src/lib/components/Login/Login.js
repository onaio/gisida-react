import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Login.scss';
import BasicAuthLogin from './BasicAuthLogin/BasicAuthLogin'
import OnaOauthLogin from './OnaOauthLogin/OnaOauthLogin'

const mapStateToProps = (state, ownProps) => {
    const { APP } = state;
    return {
        appIcon: APP.appIcon,
        loginIcon: APP.appLoginIcon,
        appPassword: APP.password,
        appNameDesc: APP.appNameDesc,
        clientID: ownProps.clientID
    };
};

class Login extends Component {
    render() {
        if (!this.props.appPassword && !this.props.clientID) {
            return null;
        }

        const { appPassword, appNameDesc, loginIcon, appIcon, clientID } = this.props;

        return (
            <div className="login">
                <img className="brand-login" src={loginIcon || appIcon} title={appNameDesc} alt={appNameDesc}></img>
                {appPassword ?
                    <BasicAuthLogin appPassword={appPassword} />
                    :
                    <OnaOauthLogin clientID={clientID} />
                }
            </div>
        )


    }
}

export default connect(mapStateToProps)(Login);
