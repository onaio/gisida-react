import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { generateFilterOptions } from '../../../includes/filterUtils';
import FilterSelector from './FilterSelector';
import './FilterModal.scss';
// import '../../ProfileView/ProfileView.scss';

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

class Filter extends Component {
  static buildFilters(filters, layerFilters, prevFilters) {
    const filterMap = {};

    if (!filters) {
      return false;
    }

    const filterKeys = Object.keys(filters);
    let filterKey;
    let options;
    let optionKeys;
    let optionKey;
    let filter;
    let f;
    let o;

    // todo - use this again to sort options
    // const optionSort = (a, b) => {
    //   if (typeof a === 'string' && typeof b === 'string') {
    //     if (a.toUpperCase() < b.toUpperCase()) {
    //       return -1;
    //     }
    //     if (a.toUpperCase() > b.toUpperCase()) {
    //       return 1;
    //     }
    //   } else {
    //     if (a < b) {
    //       return -1;
    //     }
    //     if (a > b) {
    //       return -1;
    //     }
    //   }
    //   return 0;
    // };

    // loop over all filters
    for (f = 0; f < filterKeys.length; f += 1) {
      filterKey = filterKeys[f];
      filter = {
        label: filters[filterKey].label,
        toggleAllOn: prevFilters
          ? prevFilters[filterKey].toggleAllOn
          : true, // controls toggle all functionality and text
        isFiltered: prevFilters
          ? prevFilters[filterKey].isFiltered
          : false, // whether any options have been modified
        isOriginal: true, // whether the filter has been filtered
        dataType: prevFilters ? prevFilters[filterKey].dataType
          : !filters[filterKey].quantitativeValues ? 'ordinal' : 'quantitative',
        options: {}, // actual filter options map
        isOpen: prevFilters ? prevFilters[filterKey].isOpen : false,
        doAdvFiltering: prevFilters ? prevFilters[filterKey].doAdvFiltering : false,
        queries: prevFilters ? prevFilters[filterKey].queries : [],
      };

      if (filter.dataType === 'quantitative') {
        filter.options = [...filters[filterKey].quantitativeValues];
      } else {
        options = filters[filterKey].filterValues;
        optionKeys = Object.keys(options);
        // loop over all options
        for (o = 0; o < optionKeys.length; o += 1) {
          optionKey = optionKeys[o];
          // set filter option to true
          filter.options[optionKey] = {
            enabled: false,
            count: options[optionKey],
          };
        }
      }

      // add filter to the filterMap
      filterMap[filterKey] = filter;
    }

    // Todo - Use Map.LayersObj[lo] state instead of looping through filter expression
    if (layerFilters) {
      for (f = 0; f < layerFilters.length; f += 1) {
        if (layerFilters[f] instanceof Array) {
          for (o = 0; o < layerFilters[f].length; o += 1) {
            if (layerFilters[f][o] instanceof Array) {
              if (layerFilters[f][o][0] === '==') {
                filterKey = layerFilters[f][o][1];
                optionKey = layerFilters[f][o][2];
                filterMap[filterKey].options[optionKey].enabled = true;
                filterMap[filterKey].options[optionKey].hidden = false;
                if (!filterMap[filterKey]) filterMap[filterKey].isFiltered = true;
              } else {
                // somehow handle quant filter expression
              }
            }
          }
        }
      }
    }

    return filterMap;
  }

  static isFiltered(options, isOriginal) {
    const optionKeys = Object.keys(options);
    let hasEnabled = false;
    let hasDisabled = false;
    let i;

    // if original check for BOTH enabled and disabled options
    if (isOriginal || typeof isOriginal === 'undefined') {
      for (i = 0; i < optionKeys.length; i += 1) {
        if (options[optionKeys[i]].count && options[optionKeys[i]].enabled) {
          hasEnabled = true;
        } else if (options[optionKeys[i]].count) {
          hasDisabled = true;
        }
      }
      return hasEnabled && hasDisabled;
    }

    // if filtered check for a single enabled option
    for (i = 0; i < optionKeys.length; i += 1) {
      if (options[optionKeys[i]].enabled) return true;
    }
    return false;
  }

  static mergeFilters(originalFilters, filteredFilters, clickedFilterKey) {
    if (!filteredFilters || !(Object.keys(filteredFilters).length)) {
      return originalFilters;
    }
    // Define keys of all the filters and an obj to map merged filters into
    const filterKeys = Object.keys(originalFilters);
    const nextFilters = {};

    let filterIsOpen;
    let nextFilter;
    let filterKey;
    let oOptions;
    let fOptions;
    let ooKeys;
    let ooKey;

    // Loop through all the filters
    for (let f = 0; f < filterKeys.length; f += 1) {
      filterKey = filterKeys[f];
      filterIsOpen = originalFilters[filterKey].isOpen;

      if (filterKey === clickedFilterKey && originalFilters[filterKey].isFiltered) {
        nextFilters[filterKey] = originalFilters[filterKey];
      } else {
        nextFilter = Object.assign(
          {},
          filteredFilters[filterKey],
          {
            label: originalFilters[filterKey].label,
            isOriginal: false,
            isFiltered: originalFilters[filterKey].isFiltered,
            toggleAllOn: originalFilters[filterKey].toggleAllOn,
            isOpen: filterIsOpen,
            doAdvFiltering: originalFilters[filterKey].doAdvFiltering,
            queries: originalFilters[filterKey].queries,
            queriedOptionKeys: originalFilters[filterKey].queriedOptionKeys,
          },
        );
        if (nextFilter.type === 'ordinal') {
          fOptions = filteredFilters[filterKey].options;
          oOptions = originalFilters[filterKey].options;
          ooKeys = Object.keys(oOptions);

          // Loop through all of the original filter options
          for (let o = 0; o < ooKeys.length; o += 1) {
            ooKey = ooKeys[o];
            // If the filtered filter doesn't have the option, add it
            if (!fOptions[ooKey]) {
              nextFilter.options[ooKey] = {
                count: 0,
                enabled: false,
                hidden: false,
              };
            } else {
              nextFilter.options[ooKey].enabled = oOptions[ooKey].enabled;
            }
          }
        }
        nextFilters[filterKey] = nextFilter;
      }
    }

    return nextFilters;
  }

  constructor(props) {
    super(props);
    const { layerObj } = this.props;
    const { filterOptions, id } = layerObj;
    const layerFilters = this.props.getLayerFilter(id);
    const filters = FilterModal.buildFilters(filterOptions, layerFilters);

    this.onFilterItemClick = this.onFilterItemClick.bind(this);
    this.onFilterOptionClick = this.onFilterOptionClick.bind(this);
    this.onToggleAllOptions = this.onToggleAllOptions.bind(this);
    this.buildFilteredFilters = this.buildFilteredFilters.bind(this);
    this.buildNextFilters = this.buildNextFilters.bind(this);
    this.isMapFiltered = this.isMapFiltered.bind(this);
    this.searchFilterOptions = this.searchFilterOptions.bind(this);
    this.onApplyClick = this.onApplyClick.bind(this);
    this.onClearClick = this.onClearClick.bind(this);
    this.toggleAdvFilter = this.toggleAdvFilter.bind(this);
    this.toggleSecondAdvancedOptions = this.toggleSecondAdvancedOptions.bind(this);
    this.showGlobalSearchField = this.showGlobalSearchField.bind(this);
    this.allFiltersSearch = this.allFiltersSearch.bind(this);
    this.clearAllFiltersSearch = this.clearAllFiltersSearch.bind(this);
    this.setFilterQueries = this.setFilterQueries.bind(this);

    this.state = {
      isFiltered: false,
      prevFilters: null,
      layerId: id,
      filters,
      filterOptions,
      doShowProfile: this.props.doShowProfile,
      isOpen: false,
      isMac: (window.navigator.platform.indexOf('Mac') !== -1),
      isLinux: (window.navigator.platform.indexOf('Linux') !== -1),
      globalSearchField: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { layerObj } = nextProps;
    const { filterOptions, id } = layerObj;
    const layerFilters = this.props.getLayerFilter(id);
    const filters = this.state.isFiltered && this.state.prevFilters ? this.state.prevFilters
      : FilterModal.buildFilters(filterOptions, layerFilters, this.state.filters);

    this.setState({
      filters,
      filterOptions,
      layerId: id,
      doShowProfile: false,
    });
  }

  onCloseClick(e) {
    e.preventDefault();
    this.props.handleCloseClick();
  }

  onFilterItemClick(e, filterKey) {
    e.preventDefault();
    if (e.target.getAttribute('data-type') === 'basic-filter') {
      const { filters } = this.state;
      const nextFilters = filters;
      nextFilters[filterKey].isOpen = !filters[filterKey].isOpen;
      // nextFilters[filterKey].doAdvFiltering = false;
      this.setState({
        filters: nextFilters,
      });
    } else {
      e.stopPropagation();
    }
  }

  onFilterOptionClick(e, filterKey) {
    e.stopPropagation();
    const { filters } = this.state;
    const option = filters[filterKey].options[e.target.value];
    const nextOptions = Object.assign(
      {},
      filters[filterKey].options,
      {
        [e.target.value]: {
          enabled: !option.enabled,
          count: option.count,
        },
      },
    );

    const {
      isFiltered,
      nextFilters,
    } = (this.buildNextFilters(nextOptions, filters, filterKey, true));

    this.setState({
      isFiltered,
      filters: nextFilters,
    });
  }

  onToggleAllOptions(e, toggleAllOn, filterKey) {
    e.stopPropagation();
    const { filters } = this.state;
    const options = filters[filterKey].options;
    let option;
    const optionKeys = Object.keys(options);
    const nextOptions = Object.assign({}, options);
    for (let o = 0; o < optionKeys.length; o += 1) {
      option = options[optionKeys[o]];
      nextOptions[optionKeys[o]].enabled = option.count && !option.hidden ? toggleAllOn : false;
    }

    const { isFiltered, nextFilters } = (this.buildNextFilters(nextOptions, filters, filterKey));

    this.setState({
      filters: nextFilters,
      isFiltered,
    });
  }

  onClearClick(e, isFilterable) {
    e.preventDefault();
    if (!isFilterable) {
      return false;
    }
    const { layerId, filterOptions } = this.state;
    this.setState({
      isFiltered: false,
      filters: FilterModal.buildFilters(filterOptions),
      prevFilters: null,
    }, () => {
      this.props.setLayerFilter(layerId, null);
    });
    return true;
  }

  onApplyClick(e, isFilterable) {
    e.preventDefault();
    if (!isFilterable) {
      return false;
    }
    const { filters, layerId } = this.state;
    const filterKeys = Object.keys(filters);
    const nextFilters = ['all'];

    let newFilters;
    let options;
    let optionKeys;
    // loop through all filters
    for (let f = 0; f < filterKeys.length; f += 1) {
      // chec if the filter is actually filtered
      if (filters[filterKeys[f]].isFiltered) {
        newFilters = ['any'];
        if (filters[filterKeys[f]].dataType === 'ordinal') {
          // define the options and option keys for this filter
          options = filters[filterKeys[f]].options;
          optionKeys = Object.keys(options);
          // loop through all options and add to this filter
          for (let o = 0; o < optionKeys.length; o += 1) {
            if (options[optionKeys[o]].enabled) {
              newFilters.push(['==', filterKeys[f], optionKeys[o]]);
            }
          }
        } else {
          // generate filter expressions from adv filter queries
        }
        // push this filter to the combind filter
        if (newFilters.length > 1) {
          nextFilters.push(newFilters);
        }
      }
    }

    // if (outsideFilters) {
    //   nextFilters = [].concat(outsideFilters, [...nextFilters])
    // }

    this.setState({
      isFiltered: true,
      prevFilters: filters,
    }, () => {
      this.props.setLayerFilter(layerId, nextFilters);
    });
    return true;
  }

  setFilterQueries(filterKey, nextQueries, queriedOptionKeys) {
    const prevFilters = Object.assign({}, this.state.filters);
    prevFilters[filterKey].queries = nextQueries;
    prevFilters[filterKey].queriedOptionKeys = queriedOptionKeys;

    const {
      nextFilters,
    } = (this.buildNextFilters(prevFilters[filterKey].options, prevFilters, filterKey, true));

    this.setState({ filters: nextFilters });
  }

  searchFilterOptions(e, filterKey) {
    const val = (e.target.value || '').toLowerCase();
    const options = Object.assign({}, this.state.filters[filterKey].options);
    const optionKeys = Object.keys(options);
    let optionKey;
    let isClear = false;
    let toggleAllOn = false;
    let isMatched;
    if (val === '') isClear = true;

    for (let o = 0; o < optionKeys.length; o += 1) {
      optionKey = optionKeys[o];
      if (options[optionKey].count) {
        isMatched = isClear || (optionKey.toLowerCase()).indexOf(val) !== -1;
        options[optionKey].hidden = !isMatched;
        if (!options[optionKey].hidden && !options[optionKey].enabled) {
          toggleAllOn = true;
        }
      }
    }
    const nextFilters = Object.assign(
      {},
      this.state.filters,
      {
        [filterKey]: {
          isFiltered: FilterModal.isFiltered(options),
          toggleAllOn,
          options,
          isOpen: true,
          doAdvFiltering: e.target.getAttribute('data-type') === 'advanced-filter',
          // queries: null,
        },
      },
    );

    this.setState({
      filters: nextFilters,
    });
  }

  clearAllFiltersSearch(e) {
    const { filters } = this.state;
    this.searchEl.value = '';
    this.allFiltersSearch(e);
    // this.onClearClick(e, isFilterable);
    const filterKeys = Object.keys(filters);
    let filter;
    let filterKey;
    let options;

    for (let f = 0; f < filterKeys.length; f += 1) {
      filterKey = filterKeys[f];
      filter = filters[filterKeys[f]];
      filter.isOpen = false;
      options = filter.options;
    }

    const nextFilters = Object.assign(
      {},
      filters,
      {
        [filterKey]: {
          isFiltered: FilterModal.isFiltered(options),
          options,
          isOpen: false,
        },
      });

    this.setState({
      filters: nextFilters,
    });
  }

  allFiltersSearch(e) {
    const { filters } = this.state;
    const val = (e.target.value || '').toLowerCase();
    const filterKeys = Object.keys(filters);
    let filter;
    let filterKey;
    let options;
    let optionKeys;
    let isMatched;
    let isClear = false;
    let toggleAllOn = false;

    if (val === '') isClear = true;

    for (let f = 0; f < filterKeys.length; f += 1) {
      filterKey = filterKeys[f];
      filter = filters[filterKeys[f]];
      if (filter.dataType === 'ordinal') {
        filter.isOpen = true;
        options = filter.options;
        optionKeys = Object.keys(options);

        for (let o = 0; o < optionKeys.length; o += 1) {
          if (options[optionKeys[o]].count) {
            isMatched = isClear || (optionKeys[o].toLowerCase()).indexOf(val) !== -1;
            options[optionKeys[o]].hidden = !isMatched;

            if (!options[optionKeys[o]].hidden && !options[optionKeys[o]].enabled) {
              toggleAllOn = true;
            }
          }
        }
      }
    }

    const nextFilters = Object.assign(
      {},
      filters,
      {
        [filterKey]: {
          isFiltered: FilterModal.isFiltered(options),
          options,
          toggleAllOn,
          isOpen: true,
        },
      },
    );

    this.setState({
      filters: nextFilters,
    });
  }

  buildFilteredFilters(clickedFilterKey, nextFilters) {
    const aggregate = {
      filter: [],
      'sub-filter': [],
      'accepted-filter-values': [],
      'accepted-sub-filter-values': [],
      'filter-label': [],
    };
    const filters = nextFilters;
    // const { layerObj } = this.props;
    const filterKeys = Object.keys(filters);
    let filterKey;
    let filter;

    let options;
    let option;
    let optionKeys;

    for (let f = 0; f < filterKeys.length; f += 1) {
      filterKey = filterKeys[f];
      // if (filterKey === clickedFilterKey) continue;
      filter = filters[filterKey];
      aggregate.filter[f] = filterKey;
      aggregate['accepted-filter-values'][f] = filter.queriedOptionKeys
        && filter.queriedOptionKeys.length
        ? filter.queriedOptionKeys : [];
      // aggregate['sub-filter'][f] = '';
      // aggregate['accepted-sub-filter-values'][f] = '';
      aggregate['filter-label'][f] = filter.label || '';

      // keys = Object.keys(filters[filterKey]);
      // for (let k = 0; k < keys.length; k += 1) {
      //   if (keys[k] !== 'label' && keys[k] !== 'filterValues') {
      //     aggregate['sub-filter'][f] = keys[k];
      //     aggregate['accepted-sub-filter-values'][f] = [];
      //   }
      // }
      // if (filter.dataType === 'quantitative') {
        // aggregate['accepted-filter-values'][f] =
        // filter.queriedOptionKeys.length ?
        // filter.queriedOptionKeys : 'quant';
      // } else
      if (filter.isFiltered && filter.dataType === 'ordinal') {
        options = filter.options;
        optionKeys = Object.keys(options);
        for (let o = 0; o < optionKeys.length; o += 1) {
          option = options[optionKeys[o]];

          if (((filter.isOriginal || filter.isFiltered) && option.enabled)
            || ((!filter.isOriginal && !filter.isFiltered) && option.count)) {
            aggregate['accepted-filter-values'][f].push(optionKeys[o]);
          }
        }
        if (optionKeys.length === aggregate['accepted-filter-values'][f].length) {
          aggregate['accepted-filter-values'][f] = 'all';
        }
      // } else if (dataType === 'quantitative') {
      //   aggregate['accepted-filter-values'][f] = filter.isFiltered ?
      } else if (!filter.isFiltered) {
        // if (filters[filterKey].isOriginal) {
        aggregate['accepted-filter-values'][f] = filter.dataType === 'ordinal' ? 'all' : 'quant';
      }

      // if (typeof aggregate['accepted-sub-filter-values'][f] === 'string') {
      //   continue;
      // }

      // options = filters[filterKey][aggregate['sub-filter'][f]];
      // optionKeys = Object.keys(options);
      // for (let o = 0; o < optionKeys.length; o += 1) {
      //   optionKey = optionKeys[o];
      //  if (options[optionKey].enabled) {
      //  aggregate['accepted-sub-filter-values'][f].push(optionKey);
      //  }
      // }
      // if (optionKeys.length === aggregate['accepted-sub-filter-values'][f].length) {
      //   aggregate['accepted-sub-filter-values'][f] = 'all';
      // } else if (!optionKeys.length) {
      //   aggregate['accepted-sub-filter-values'][f] = 'all';
      // }
    }

    const newLayerObj = {
      aggregate,
      source: this.props.layerObj.source,
      type: 'filteredFilter',
    };
    const newLayerOptions = generateFilterOptions(newLayerObj);
    const filteredFilters = FilterModal.buildFilters(newLayerOptions);
    return FilterModal.mergeFilters(filters, filteredFilters, clickedFilterKey);
  }

  isMapFiltered() {
    const layerFilters = this.props.getLayerFilter(this.state.layerId);
    if (!layerFilters) {
      return false;
    }
    const { outsideFilters } = this.state;

    function isArrayEqual(a, b) {
      if (!a || !b) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i += 1) {
        if (typeof a !== typeof b) {
          return false;
        }
        if (a[i] instanceof Array && b[i] instanceof Array) {
          if (!isArrayEqual(a[i], b[i])) {
            return false;
          }
        } else if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    }

    return !isArrayEqual(outsideFilters, layerFilters);
  }

  buildNextFilters(nextOptions, filters, filterKey, isResetable) {
    const { toggleAllOn } = filters[filterKey];
    const { filterOptions } = this.state;
    let nextFilters = Object.assign(
      {},
      filters,
      {
        [filterKey]: {
          label: filters[filterKey].label,
          isFiltered: filters[filterKey].isFiltered,
          isOriginal: filters[filterKey].isOriginal,
          toggleAllOn: (isResetable ? toggleAllOn : !toggleAllOn),
          options: nextOptions,
          isOpen: true,
          dataType: filters[filterKey].dataType,
          doAdvFiltering: filters[filterKey].doAdvFiltering,
          queries: filters[filterKey].queries,
          queriedOptionKeys: filters[filterKey].queriedOptionKeys,
        },
      },
    );

    let nextFilter;
    let isFiltered = false;
    const filterKeys = Object.keys(nextFilters);

    for (let i = 0; i < filterKeys.length; i += 1) {
      nextFilter = nextFilters[filterKeys[i]];
      nextFilter.isFiltered = FilterModal.isFiltered(nextFilter.options, nextFilter.isOriginal);

      // todo - put all this logic in FilterModal.isFiltered()
      const queriedKeys = nextFilter.queriedOptionKeys;
      if (nextFilter.isFiltered
        || (nextFilter.queries && nextFilter.queries.length
        && (nextFilter.queries.length > 1 || nextFilter.queries[0].val !== ''))
        || (Array.isArray(nextFilter.options)
        && (
          [...new Set(nextFilter.options)].length !== queriedKeys.length))) {
        isFiltered = true;
        nextFilter.isFiltered = true;
      }
    }

    if (isFiltered) {
      nextFilters = this.buildFilteredFilters(filterKey, nextFilters);
    } else if (isResetable) {
      const layerFilters = this.props.getLayerFilter(this.props.layerObj.id);
      nextFilters = FilterModal.buildFilters(filterOptions, layerFilters, nextFilters);
    }

    return { isFiltered, nextFilters };
  }

  toggleSecondAdvancedOptions(e, filterKey) {
    e.preventDefault();
    const { filters } = this.state;
    const nextFilters = filters;
    const isAdvanced = filters[filterKey].expandSecondAdvancedOptions;
    nextFilters[filterKey].expandSecondAdvancedOptions = !isAdvanced;
    this.setState({
      filters: nextFilters,
    });
  }

  showGlobalSearchField(e) {
    e.preventDefault();
    this.setState({
      globalSearchField: !this.state.globalSearchField,
    });
  }


  toggleAdvFilter(e, filterKey) {
    e.preventDefault();
    const { filters } = this.state;
    const nextFilters = filters;
    nextFilters[filterKey].doAdvFiltering = !filters[filterKey].doAdvFiltering;
    nextFilters[filterKey].expandSecondAdvancedOptions = false;
    this.setState({
      filters: nextFilters,
    });
  }


  render() {
    const { filters, isMac, globalSearchField } = this.state;
    const filterKeys = Object.keys(filters);
    const filterItems = [];
    let filter;
    let isFilterable = false;

    for (let f = 0; f < filterKeys.length; f += 1) {
      filter = filters[filterKeys[f]];
      const { isFiltered, toggleAllOn, queries, queriedOptionKeys } = filter;
      if (isFiltered) {
        isFilterable = true;
      }
      filterItems.push((
        <li className="filter-item">
          <a
            className={`indicator-label indicator-item filter-option
              ${filter.isOpen ? ' active' : ''}
              ${isFiltered ? ' filtered filterOptionSelected' : ''}`}
            onClick={(e) => { this.onFilterItemClick(e, filterKeys[f]); }}
            data-type="basic-filter"
            role="button"
            tabIndex="-1"
          >
            {filter.label}
            {filter.isOpen ?
              <span
                role="button"
                tabIndex="0"
                title="Advanced Filters"
                className={`glyphicon glyphicon-option-vertical${filter.doAdvFiltering ? ' active' : ' inactive'}`}
                onClick={(e) => { this.toggleAdvFilter(e, filterKeys[f]); }}
                data-key={filterKeys[f]}
              />
            : ''}
            <span
              className={`caret caret-${filter.isOpen ? 'down' : 'right'}`}
              data-type="basic-filter"
            />
          </a>
          {filter.isOpen ?
            <FilterSelector
              filter={filter}
              filterKey={filterKeys[f]}
              onFilterOptionClick={this.onFilterOptionClick}
              onToggleAllOptions={this.onToggleAllOptions}
              searchFilterOptions={this.searchFilterOptions}
              doAdvFiltering={filter.doAdvFiltering}
              expandSecondAdvancedOptions={filter.expandSecondAdvancedOptions}
              toggleSecondAdvancedOptions={this.toggleSecondAdvancedOptions}
              toggleAllOn={toggleAllOn}
              globalSearchField={globalSearchField}
              setFilterQueries={this.setFilterQueries}
              queries={queries}
              queriedOptionKeys={queriedOptionKeys}
            />
          : ''}
        </li>
      ));
    }

    const doClear = isFilterable || this.state.isFiltered || this.isMapFiltered();

    return (
      <div>
        <div className={`profile-view-container filter-container${isMac ? ' mac' : ''}`}>
          <a
            className="filter-search"
            href="#"
            onClick={(e) => { this.showGlobalSearchField(e); }}
          >
            <span className="glyphicon glyphicon-search" />
          </a>
          <a
            className="close-btn filter-close"
            title="Close profile view"
            onClick={(e) => { this.onCloseClick(e); }}
            href="#"
            role="button"
          >
            <span className="glyphicon glyphicon-remove" />
          </a>
          <div className="profile-basic-details filter-header-section">
            <div className="profile-header-section filter-header">
              <h5>LAYER FILTERS</h5>
            </div>
            {globalSearchField ?
              <div className="search-column">
                <span className="searchBtn" role="button">
                  <span className="glyphicon glyphicon-search" />
                </span>
                <input
                  ref={(el) => { this.searchEl = el; }}
                  type="text"
                  className="filterSearch"
                  placeholder="Search All Filters"
                  onChange={(e) => { this.allFiltersSearch(e); }}
                />
                {this.searchEl && this.searchEl.value !== '' ?
                  (
                    <span
                      className="clearSearch"
                      role="button"
                      tabIndex="0"
                      onClick={(e) => { this.clearAllFiltersSearch(e); }}
                    >
                      <span className="glyphicon glyphicon-remove" />
                    </span>
                ) : ''}
              </div>
            : ''}
          </div>
          <div className="profile-indicators filter-section-options">
            <ul>
              <li>
                <ul className="indicators-list">
                  {filterItems}
                </ul>
              </li>
            </ul>
          </div>
          <div className="filter-footer">
            <div className="filter-footer-section">
              <div className="filter-footer-content">
                <table className="filter-footer-controls">
                  <tr>
                    <td>
                      <button
                        className={`${doClear ? '' : 'disabled'}`}
                        onClick={(e) => { this.onClearClick(e, doClear); }}
                      >
                        Clear Filters
                      </button>
                    </td>
                    <td>
                      <button
                        className={`${isFilterable ? '' : 'disabled'}`}
                        onClick={(e) => { this.onApplyClick(e, isFilterable); }}
                      >
                        Apply Filters
                      </button>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

FilterModal.propTypes = {
  layerObj: PropTypes.objectOf(PropTypes.any).isRequired,
  getLayerFilter: PropTypes.func.isRequired,
  setLayerFilter: PropTypes.func.isRequired,
  handleCloseClick: PropTypes.func.isRequired,
  doShowProfile: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(Filter);
