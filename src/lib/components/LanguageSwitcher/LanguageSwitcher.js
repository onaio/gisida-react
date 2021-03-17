import React from 'react';
import { connect } from 'react-redux';
import { Actions } from 'gisida';
import './LanguageSwitcher.scss';
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

  onLocationClick(e) {
    const { dispatch } = this.props;
    e.preventDefault();
    if (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id) {
      dispatch(Actions.setLocation(this.props.mapId, e.currentTarget.dataset.id));
    }
  }

  render() {
    const { APP } = this.props;
    return APP["translation"].length ? 
    (<a href="#" class="dropdown">
        <span class="glyphicon glyphicon-globe"></span>
        <div class="dropdown-content">
            { APP["translation"].map(lingua =>
                <a href={`${window.location.href.split('/')[2]}/${lingua.param}`}>{lingua.label}</a>
            )}
        </div>
      </a>) : null;
  }
}

export default connect(mapStateToProps)(LanguageSwitcher);
