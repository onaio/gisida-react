import React from 'react';
import { connect } from 'react-redux';
import { Actions } from 'gisida';
import './LanguageSwitcher.scss';
import { LANGUAGESWITCHERCONFIGS, SELECT_LANGUAGE } from './constants';
const mapStateToProps = (state, ownProps) => {
  const { APP, LOC } = state;
  return {
    APP,
    LOC,
    ...ownProps,
  };
};

class LanguageSwitcher extends React.Component {
  constructor(props) {
    super(props);
  }

  onLanguageClick(e) {
    const { dispatch, APP } = this.props;
    e.preventDefault();
    const target = APP.mapLanguageTranslation ? e.target.innerText : e.target.value;
    dispatch(
      Actions.setLanguage(this.props.mapId, APP[LANGUAGESWITCHERCONFIGS][target])
    );
  }

  render() {
    const { APP } = this.props;
    const marginRight = window.location.pathname === '/' ? 'auto' : '40px' 
    if (APP[LANGUAGESWITCHERCONFIGS] && Object.keys(APP[LANGUAGESWITCHERCONFIGS]).length) {
      if (APP.mapLanguageTranslation) {
        return ( <a href="#" className="language-dropdown">
          <span className="glyphicon glyphicon-globe"></span>
          <div className="language-dropdown-content">
            {Object.keys(APP[LANGUAGESWITCHERCONFIGS]).map(language => (
              <span
                onClick={e => {
                  this.onLanguageClick(e);
                }}
              >
                {language}
              </span>
            ))}
          </div>
        </a>)
      }
      return (
        <div className="custom-select" style={{ marginRight: marginRight}}>
          <select onChange={e => {
            this.onLanguageClick(e)
          }}>
            <option value='select language'>
                {SELECT_LANGUAGE}
            </option>
          {Object.keys(APP[LANGUAGESWITCHERCONFIGS]).map(language => (
              <option value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default connect(mapStateToProps)(LanguageSwitcher);
