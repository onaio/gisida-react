import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// import Cookie from 'js-cookie';
import './TitleBar.scss';

const logOut = e => {
  e.preventDefault();
  // Cookie.set('dsauth', false);
  // location.reload();
};

const mapStateToProps = state => {
  return {
    appConfig: state.APP,
  };
};

class TitleBar extends React.Component {
  render() {
    const { appConfig } = this.props;
    return (
      <div>
        {appConfig.loaded ? (
          <div className="menu" id="menu" style={{ background: appConfig.appColor }}>
            <div className="brand">
              {!!appConfig.appIcon && (
                <img src={appConfig.appIcon} alt="UKAID" className="brand-icon" />
              )}
              <div className="brand-title">
                <span className="white">{appConfig.appName}</span>&nbsp;&nbsp;{' '}
                {appConfig.appNameDesc}
              </div>
            </div>
            {appConfig.password ? (
              <a className="sign-out" onClick={logOut} role="button" tabIndex={0}>
                <i className="fa fa-sign-out" aria-hidden="true" />
              </a>
            ) : (
              ''
            )}
            <a
              className="ona-logo"
              href="http://www.ona.io/"
              alt="Powered by ONA"
              title="Powered by ONA"
              target="_blank"
              rel="noopener noreferrer"
            >
              Powered by
            </a>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

TitleBar.propTypes = {
  appConfig: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default connect(mapStateToProps)(TitleBar);
