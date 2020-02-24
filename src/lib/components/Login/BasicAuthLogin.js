import React, { Component } from 'react';
import Cookie from 'js-cookie';

export const isLoggedIn = function () {
    return Cookie.get('dsauth') === "true";
};


class BasicAuthLogin extends Component {
    constructor(props) {
        super(props);
        this.state = { loginError: false };
    }

    handleLogin(password) {
        const { appPassword } = this.props;
        if (appPassword.includes(password)) {
            Cookie.set('dsauth', true);
            location.reload();
        } else {
            this.setState({ loginError: true });
        }
    }

    render() {
        const { loginImageStyle } = this.props;

        return (
            <div className="login">
                <div>
                    <form className="login-form" onSubmit={(e) => { e.preventDefault(); this.handleLogin(this.password.value); }}>
                        <div className="form-group">
                            <div className="brand-login" style={loginImageStyle}></div>
                            {this.state.loginError === true ? <div className="alert alert-danger">Incorrect password.</div> : null}
                            <label htmlFor="password">Enter your Password</label>
                            <input className="form-control" type="password" ref={(input) => { this.password = input; }} autoFocus />
                        </div>
                        <button className="btn btn-default center-block" type="submit">Log In</button>
                    </form>
                </div>
            </div>);
    }
}

export default BasicAuthLogin