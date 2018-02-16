import React, { Component }from 'react';
import { connect } from 'react-redux';
import { catchZeroCountClicks } from '../../utils';
import PropTypes from 'prop-types';

const mapStateToProps = (state, ownProps) => {
  return {
  }
}


class FilterSelector extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, this.props.filter, {
      isLinux: (window.navigator.platform.indexOf('Linux') !== -1),
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.filter);
  }

  onSearchClear = (e, filterKey) => {
    this.searchEl.value = '';
    this.props.searchFilterOptions(e, filterKey);
  }

  render() {
    const { options, isLinux } = this.state;
    const { filterKey, toggleAllOn } = this.props;
    if (!options || !(Object.keys(options)).length) {
      return null;
    }

    const selectedOptions = [];
    const filterOptions = [];
    const inactiveOptions = [];
    const optionKeys = Object.keys(options);
    let option;
    let optionEl;
    const totals = [];

    for (let i = 0; i < optionKeys.length; i += 1) {
      option = options[optionKeys[i]];
      optionEl = (
        <li key={i} className={`optionItem${option.count ? '' : ' inactive'}`}>
          <input
            type="checkbox"
            id={optionKeys[i]}
            value={optionKeys[i]}
            checked={option.enabled}
            onChange={(e) => { this.props.onFilterOptionClick(e, filterKey); }}
          />
          <label
            htmlFor={optionKeys[i]}
            key={optionKeys[i]}
            data-count={option.count}
            className={`optionLabel${option.enabled ? ' enabled' : ''}`}
            onClick={(e) => { this.catchZeroCountClicks(e); }}
            role="presentation"
            tabIndex="-1"
          >
            <span
              className={`filter-option-label${isLinux ? ' linux' : ''}`}
              title={optionKeys[i]}
            >
              {optionKeys[i]}
            </span>
            <span>{option.count}</span>
          </label>
        </li>
      );
      if (option.count && !option.hidden) {
        totals.push(option.count);
        filterOptions.push(optionEl);
      }
    }

    const totalOptions = totals.reduce((a, b) => a + b, 0);

    return (
      <div>
        <div className="search-column">
          <span className="searchBtn" role="button">
            <span className="glyphicon glyphicon-search" />
          </span>
          <input
            ref={(el) => { this.searchEl = el; }}
            type="text"
            className="filterSearch"
            placeholder="Search Options"
            onChange={(e) => { this.props.searchFilterOptions(e, filterKey); }}
          />
          {this.searchEl && this.searchEl.value !== '' ? (
            <span
              className="clearSearch"
              role="button"
              onClick={(e) => { this.onSearchClear(e, filterKey); }}
              tabIndex="0"
            >
              <span className="glyphicon glyphicon-remove" />
            </span>
          ) : ''}
        </div>
        <ul id="filter-group" className="filterGroup" key={filterKey}>
          <li>
            {totalOptions ? (
              <div>
                <input
                  type="checkbox"
                  id={`all-${filterKey}`}
                  checked={!toggleAllOn}
                  onChange={(e) => { this.props.onToggleAllOptions(e, toggleAllOn, filterKey); }}
                />
                <label
                  className="optionLabel"
                  htmlFor={`all-${filterKey}`}
                >
                  <span className={`filter-option-label${isLinux ? ' linux' : ''}`}>(All)</span>
                  <span>({totalOptions})</span>
                </label>
              </div>
            ) : (
              <span className="noOptions">(No options available)</span>
            )}
          </li>
          {selectedOptions.concat(filterOptions, inactiveOptions)}
        </ul>
      </div>
    );
  }
}

FilterSelector.propTypes = {
  filter: PropTypes.objectOf(PropTypes.any).isRequired,
  onFilterOptionClick: PropTypes.func.isRequired,
  searchFilterOptions: PropTypes.func.isRequired,
  onToggleAllOptions: PropTypes.func.isRequired,
  toggleAllOn: PropTypes.bool.isRequired,
  filterKey: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(FilterSelector);
