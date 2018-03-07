import React, { Component }from 'react';
import { connect } from 'react-redux';
import { catchZeroCountClicks } from '../../utils';
import PropTypes from 'prop-types';
import AdvancedFilter from './AdvancedFilter';

const mapStateToProps = (state, ownProps) => {
  return {
  }
}


class FilterSelector extends Component {
  parseQueries(options, queriedOptionKeys) {
    const nextOptions = Object.assign({}, options);
    const optionKeys = Object.keys(nextOptions);
    let isPassed = false;
    let o;

    for (o = 0; o < optionKeys.length; o += 1) {
      isPassed = queriedOptionKeys.indexOf(optionKeys[o]) !== -1;
      nextOptions[optionKeys[o]].hidden = !isPassed;
      nextOptions[optionKeys[o]].enabled = (isPassed && options[optionKeys[o]].enabled) || false;
    }
    return nextOptions;
  }

  constructor(props) {
    super(props);
    const { options, queriedOptionKeys, doAdvFiltering, dataType } = this.props.filter;
    this.state = Object.assign({}, this.props.filter, {
      isLinux: (window.navigator.platform.indexOf('Linux') !== -1),
      options: dataType === 'quantitative' ? options
          : ((doAdvFiltering && queriedOptionKeys) || queriedOptionKeys)
          ? this.parseQueries(options, queriedOptionKeys) : options,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { options, queriedOptionKeys, doAdvFiltering, dataType } = nextProps.filter;
    this.setState(Object.assign(
      {},
      nextProps.filter,
      {
        options: dataType === 'quantitative' ? options
          : ((doAdvFiltering && queriedOptionKeys) || queriedOptionKeys)
          ? this.parseQueries(options, queriedOptionKeys) : options,
      },
    ));
  }


  onSearchClear = (e, filterKey) => {
    this.searchEl.value = '';
    this.props.searchFilterOptions(e, filterKey);
  }

  render() {
    const { options, isLinux, dataType } = this.state;
    const { filterKey, doAdvFiltering,  toggleAllOn, queries } = this.props;
    if (!options || !(Object.keys(options)).length) {
      return null;
    }

    const selectedOptions = [];
    const filterOptions = [];
    const inactiveOptions = [];
    const optionKeys = Object.keys(options);
    let option;
    let optionEl;
    let totalOptions;
    const totals = [];

    if (dataType === 'ordinal') {
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
              onClick={(e) => { catchZeroCountClicks(e); }}
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

      totalOptions = totals.reduce((a, b) => a + b, 0);
    }

    return (
      <div>
        {dataType === 'quantitative' || doAdvFiltering ?
          <AdvancedFilter
            filterKey={filterKey}
            options={options}
            queries={queries}
            setFilterQueries={this.props.setFilterQueries}
            dataType={dataType}
          />
          :
          <div className={`search-column${this.props.globalSearchField ? ' hidden' : ''}`}>
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
        </div>}

        {dataType === 'ordinal' ?
        (<ul id="filter-group" className="filterGroup" key={filterKey}>
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
        </ul>) : ''}
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
