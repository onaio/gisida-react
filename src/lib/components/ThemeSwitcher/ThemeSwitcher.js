import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

require('./ThemeSwitcher.scss');

const mapStateToProps = (state, ownProps) => {
  const mapId = ownProps.mapId || 'map-1';
  const MAP = state[mapId] || { blockLoad: true };
  return {
    MAP,
    mapId,
    showFilterPanel: MAP.showFilterPanel,
  }
}


export class ThemeSwitcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };

    this.toggleThemeSwitcher = this.toggleThemeSwitcher.bind(this);
    this.store = typeof sessionStorage === 'undefined' ? null : sessionStorage;

    // todo - move this into stylesheet, have this component update a
    // className to cascade the theme styles
    this.css = `
    .filter-container {
      background: #eae3bc !important;
      color: #555 !important;
    }
    .filter-section-options {
      background: #f7f6ef !important;
    }
    .filter-section-options .filter-item {
      background: rgba(255, 255, 255, 0.4) !important;
      padding-bottom: 2px;
    }
    .filter-section-options .filter-item a.filter-option {
      color: #555 !important;
      font-weight: 600 !important;
      font-size: 12px;
    }
    .filter-container span.filter-option-label {
      color: #555 !important;
      font-size: 12px;
    }
    .filter-section-options .filterGroup {
      background: #f7f6ef !important;
      color: #555;
      font-size: 12px;

    }
    .filter-section-options .searchBtn,
    .filter-section-options .clearSearch {
      color: #000 !important;
    }
    .filter-container .filter-header-section {
      background: rgba(255, 255, 255, 0.8) !important;
      color: #000;
    }
    .filter-footer {
      background: #f7f6ef !important;
      color: #000;
    }
    .filter-footer  button:hover {
      box-shadow: 0 0 0 1px #4a4747 !important;
    }
    .filter-close,
    .filter-container .filter-search {
      color: #000 !important;
    }
    .filterSearch {
      color: #000 !important;
    }
    .filter-section-options .filter-item div.advanced-controls select {
      background-color: transparent;
      color: #555;
    }
    .filter-section-options .filter-item div.advanced-controls {
      color: #444;
    }
    .filter-section-options .filter-item div.advanced-controls input[type="text"] {
      background: #f7f6ef;
      box-shadow: 0 0 0 1px #908a8a;
      border-radius: 5px;
    }
    .filter-section-options .filter-item div.advanced-controls label.switch span.slider {
      background: #C6C6B3;
    }
    .filter-section-options .filter-item div.advanced-controls label.switch span.slider::before {
      background-color: #A0A091;
    }
    .filter-footer .filter-footer-section .filter-footer-content table.filter-footer-controls td button.enabled {
      color: inherit;
    }
    `;
  }

  componentWillMount() {
    if (this.store && this.store.ThemeSwitch) {
      const isTrue = this.store.getItem('ThemeSwitch') === 'true';
      this.setState({
        active: isTrue || false,
      });
    }
  }

  componentDidUpdate() {
    if (this.store) {
      this.store.setItem('ThemeSwitch', this.state.active.toString());
    }
  }

  toggleThemeSwitcher(e) {
    e.preventDefault();
    this.setState({
      active: !this.state.active,
    });
  }

  render() {
    const { showFilterPanel, mapId } = this.props;
    const { active } = this.state;
    if (!showFilterPanel) {
      return false;
    }
    return (
      <div>
        {showFilterPanel ?
          <div
            className="wrap"
            style={{ right: mapId === 'map-1' ? '-180px' : '75px'}}>
            <div
              role="button"
              tabIndex="0"
              className="btn-group btn-toggle theme-toggle"
              onClick={(e) => this.toggleThemeSwitcher(e)}
            >
              <button
                className={`glyphicon glyphicon-list-alt theme-toggle-btn ${!active ? 'light' : 'dark'}`}
                alt={`Theme: ${!active ? 'light' : 'dark'}`}
              />
            </div>
          </div> : ''}
        <style media={!active ? 'screen' : 'none'}>
          {active ? this.css.trim() : this.css}
        </style>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ThemeSwitcher);

ThemeSwitcher.propTypes = {
  showFilterPanel: PropTypes.bool.isRequired,
}
