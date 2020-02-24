import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Login.scss';
import BasicAuthLogin from './BasicAuthLogin/BasicAuthLogin'
import OnaOauthLogin from './OnaOauthLogin/OnaOauthLogin'

const mapStateToProps = state => {
    const { APP } = state;
    return {
        appIcon: APP.appIcon,
        loginIcon: APP.appLoginIcon,
        appPassword: APP.password,
        appNameDesc: APP.appNameDesc
    };
};

class Login extends Component {
    render() {
        if (!this.props.appPassword && !process.env.REACT_APP_GISIDA_CANOPY_CLIENT_ID) {
            return null;
        }

        const { appPassword, appNameDesc, loginIcon, appIcon } = this.props;

        return (
            <div className="login">
                <img className="brand-login" src={loginIcon || appIcon} title={appNameDesc} alt={appNameDesc}></img>
                {appPassword ?
                    <BasicAuthLogin appPassword={appPassword} />
                    :
                    <OnaOauthLogin />
                }
            </div>
        )


    }
}

export default connect(mapStateToProps)(Login);
