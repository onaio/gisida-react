import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
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
        oauthclientID: ownProps.oauthclientID,
        oauthProvider: ownProps.oauthProvider || 'onadata'
    };
};

class Login extends Component {
    render() {
        if (!this.props.appPassword && !this.props.oauthclientID) {
            return null;
        }

        const { appPassword, appNameDesc, loginIcon, appIcon,
            oauthclientID, oauthProvider } = this.props;

        return (
            <div className="login">
                <img className="brand-login" src={loginIcon || appIcon} title={appNameDesc} alt={appNameDesc}></img>
                {appPassword ?
                    <BasicAuthLogin appPassword={appPassword} />
                    :
                    <OnaOauthLogin clientID={oauthclientID} provider={oauthProvider} />
                }
            </div>
        )
    }
}

Login.PropTypes = {
    clientID: PropTypes.string,
    appIcon: PropTypes.string,
    loginIcon: PropTypes.string,
    appPassword: PropTypes.string.length,
    appNameDesc: PropTypes.string
}

export default connect(mapStateToProps)(Login);
