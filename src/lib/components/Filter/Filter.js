import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Actions,
  generateFilterOptions,
  generateFilterOptionsPrev,
  buildFilterState,
  clearFilterState,
  lngLat,
} from 'gisida';
import { buildLayersObj } from '../../utils';
import FilterSelector from './FilterSelector';
import FilterSelectorPrev from './FilterSelectorPrev';
import './Filter.scss';
import 'rc-slider/assets/index.css';

const mapStateToProps = (state, ownProps) => {
  const { mapId, hasNavBar } = ownProps;
  const MAP = state[mapId] || { layers: {}, filter: {}, timeseries: {} };
  let timeLayer;
  buildLayersObj(MAP.layers).forEach(layer => {
    if (layer && layer.visible && layer.aggregate && layer.aggregate.timeseries) {
      timeLayer = layer.id;
    }
  });
  timeLayer = MAP.timeseries[MAP.primaryLayer] ? MAP.primaryLayer : timeLayer;
  return {
    APP: state.APP,
    MAP,
    mapId,
    oldLayerObj: MAP.oldLayerObjs ? MAP.oldLayerObjs[MAP.primaryLayer] : {},
    isSplitScreen: state.VIEW && state.VIEW.splitScreen,
    FILTER: state.FILTER,
    layerObj: MAP.layers[MAP.filter.layerId],
    timeseriesObj: MAP.timeseries[timeLayer],
    doShowProfile: MAP.showProfile,
    showFilterPanel: MAP.showFilterPanel && MAP.primaryLayer === MAP.filter.layerId,
    layersObj: buildLayersObj(MAP.layers),
    showFilterBtn: MAP.filter.layerId && MAP.primaryLayer === MAP.filter.layerId,
    layerData: MAP.layers,
    detailView: MAP.detailView,
    hasNavBar,
  };
};

export class Filter extends Component {
  constructor(props) {
    super(props);
    const filters = null;
    const filterOptions = {};

    this.state = {
      isFiltered: false,
      prevFilters: null,
      layerId: (this.props.layerObj && this.props.layerObj.id) || null,
      filters,
      filterOptions,
      doShowProfile: this.props.doShowProfile,
      isOpen: false,
      isMac: window.navigator.platform.indexOf('Mac') !== -1,
      isLinux: window.navigator.platform.indexOf('Linux') !== -1,
      globalSearchField: false,
      layersObj: this.props.layersObj,
      isOr: false,
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    e.preventDefault();
    this.onClearClick(null, true);
    this.setState({ isOr: !this.state.isOr });
  }
  buildFiltersMap(filters, layerFilters, prevFilters) {
    const filterMap = {};
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

    // loop over all filters and build filter state from prevFilters or clean
    for (f = 0; f < filterKeys.length; f += 1) {
      filterKey = filterKeys[f];
      filter = {
        label: filters[filterKey].label,
        toggleAllOn: prevFilters ? prevFilters[filterKey].toggleAllOn : true, // controls toggle all functionality and text
        isFiltered: prevFilters ? prevFilters[filterKey].isFiltered : false, // whether any options have been modified
        isOriginal: true, // whether the filter has been filtered
        dataType: prevFilters
          ? prevFilters[filterKey].dataType
          : !filters[filterKey].quantitativeValues
          ? 'ordinal'
          : 'quantitative',
        filterType: prevFilters ? prevFilters[filterKey].filterType : filters[filterKey].filterType,
        options: {}, // actual filter options map
        isOpen: prevFilters ? prevFilters[filterKey].isOpen : false,
        doAdvFiltering: prevFilters ? prevFilters[filterKey].doAdvFiltering : false,
        queries: prevFilters ? prevFilters[filterKey].queries : [],
      };

      if (filter.dataType === 'quantitative') {
        filter.options = [...filters[filterKey].quantitativeValues];
      } else {
        options = filters[filterKey].filterValues;
        optionKeys = Object.keys(options).filter(o => o.length > 0 && o !== 'undefined');
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

    // this might be deprecated?? :-/
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
                // To DO: handle quant filter expressions
              }
            }
          }
        }
      }
    }

    return filterMap;
  }

  isFiltered(options, isOriginal) {
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

  mergeFilters(originalFilters, filteredFilters, clickedFilterKey) {
    if (!filteredFilters || !Object.keys(filteredFilters).length) {
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
        nextFilter = Object.assign({}, filteredFilters[filterKey], {
          label: originalFilters[filterKey].label,
          isOriginal: false,
          isFiltered: originalFilters[filterKey].isFiltered,
          dataType: originalFilters[filterKey].dataType,
          filterType: originalFilters[filterKey].filterType,
          toggleAllOn: originalFilters[filterKey].toggleAllOn,
          isOpen: filterIsOpen,
          doAdvFiltering: originalFilters[filterKey].doAdvFiltering,
          queries: originalFilters[filterKey].queries,
          queriedOptionKeys: originalFilters[filterKey].queriedOptionKeys,
        });
        if (nextFilter.dataType === 'ordinal') {
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

  getLayerFilter(layerId) {
    let layerObj;
    const { layersObj } = this.props;
    for (let i = 0; i < layersObj.length; i += 1) {
      layerObj = layersObj[i];
      if (layerObj.id === layerId) {
        return layerObj.filters && layerObj.filters.layerFilters;
      }
    }
    return null;
  }

  handleFilterClick() {
    const { dispatch, mapId, layerId, APP, LOC, layerObj } = this.props;
    // const availableMaps = ['map-1', 'map-2'];
    const { center, zoom } = lngLat(LOC, APP);
    window.maps.forEach(e => {
      if (layerObj && !layerObj.location) {
        e.easeTo({
          center,
          zoom,
        });
      }
    });
    dispatch(Actions.toggleFilter(mapId, layerId));
  }

  componentWillReceiveProps(nextProps) {
    if (
      !nextProps.layerObj ||
      (nextProps.layerObj &&
        nextProps.layerObj.aggregate &&
        nextProps.layerObj.aggregate.timeseries &&
        !nextProps.timeseriesObj)
    ) {
      return false;
    }

    const { layerObj, timeseriesObj, oldLayerObj } = nextProps;

    const layerId = layerObj.id;

    // Build new component state or retrieve it from FILTER store
    const filterState = nextProps.FILTER[layerId];
    const layerFilters = this.getLayerFilter(layerId); // this may be deprecated

    let filterOptions;
    if (nextProps.timeseriesObj && layerObj.aggregate && layerObj.aggregate.timeseries) {
      filterOptions = generateFilterOptions(timeseriesObj);
    } else if (!timeseriesObj && filterState && filterState.filterOptions) {
      filterOptions = filterState.filterOptions;
    } else {
      filterOptions = layerObj.filterOptions || {};
    }

    let filters;

    if (
      timeseriesObj &&
      timeseriesObj.temporalIndex !==
        (this.props.timeseriesObj && this.props.timeseriesObj.temporalIndex) &&
      !layerFilters &&
      !(filterState && filterState.doUpdate)
    ) {
      filters = this.buildFiltersMap(filterOptions, layerFilters, this.state.prevFilters);
    } else {
      filters =
        (filterState && filterState.filters) ||
        (this.state.isFiltered && this.state.prevFilters) ||
        this.buildFiltersMap(filterOptions, layerFilters, this.state.prevFilters);
    }

    // determine whether to update the compnent state
    const doUpdate =
      (layerId !== this.state.layerId && filterOptions && Object.keys(filterOptions).length > 0) ||
      (filterState && filterState.doUpdate) ||
      (timeseriesObj &&
        timeseriesObj.temporalIndex !==
          (this.props.timeseriesObj && this.props.timeseriesObj.temporalIndex));
    if (doUpdate) {
      this.setState(
        {
          filters,
          filterOptions,
          timeseriesObj: nextProps.timeseriesObj,
          oldLayerObj,
          layerId: doUpdate ? layerId : null,
          doShowProfile: false,
        },
        () => {
          this.props.dispatch(Actions.filtersUpdated(nextProps.mapId, layerId));
        }
      );
    }
  }
  onCloseClick = e => {
    e.preventDefault();
    //TODO dispach close action
    // this.setState({
    //   showFilterModal: false,
    // });
  };

  onFilterItemClick = (e, filterKey) => {
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
  };

  onFilterOptionClick = (e, filterKey) => {
    const { filters } = this.state;
    const option = filters[filterKey].options[e.target.value];
    const updateFilters = Object.assign({}, filters);
    const nextOptions = Object.assign({}, filters[filterKey].options, {
      [e.target.value]: {
        enabled: !option.enabled,
        count: option.count,
      },
    });

    updateFilters[filterKey].toggleAllOn = Object.keys(nextOptions).some(
      obj => nextOptions[obj].enabled === false
    );

    const { isFiltered, nextFilters } = this.buildNextFilters(
      nextOptions,
      updateFilters,
      filterKey,
      true
    );
    this.setState({
      isFiltered,
      filters: nextFilters,
    });
  };

  onToggleAllOptions = (e, toggleAllOn, filterKey) => {
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
    const { isFiltered, nextFilters } = this.buildNextFilters(nextOptions, filters, filterKey);

    this.setState({
      filters: nextFilters,
      isFiltered,
    });
  };

  onClearClick = (e, isFilterable) => {
    if (e) {
      e.preventDefault();
    }
    if (!isFilterable) {
      return false;
    }
    const { layerId, filterOptions, oldLayerObj } = this.state;
    const { mapId, dispatch } = this.props;
    // Clear layerFilter from mapbox layer
    dispatch(Actions.setLayerFilter(mapId, layerId, null));

    // Update FILTER state

    const filterState = {
      filterOptions,
      filters: this.buildFiltersMap(filterOptions),
      aggregate: {
        ...(oldLayerObj && oldLayerObj.aggregate),
      },
      doUpdate: false,
      isFiltered: false,
    };

    const hasStops = Object.keys(filterOptions)
      .map(f => filterOptions[f].type)
      .includes('stops');

    clearFilterState(mapId, filterState, layerId, dispatch, true);

    // Reload layer if necessary to re-aggregate / restore layer stops
    if (
      this.props.FILTER[layerId] &&
      this.props.FILTER[layerId].originalLayerObj &&
      filterOptions &&
      hasStops
    ) {
      // Reload layer to re-aggregate and re-add layer
      this.props.dispatch(Actions.addLayer(mapId, oldLayerObj));
    }
    return true;
  };

  onApplyClick = (e, isFilterable) => {
    e.preventDefault();
    if (!isFilterable) {
      return false;
    }
    const { filters, layerId, filterOptions, isOr } = this.state;

    const { layerObj, mapId, dispatch } = this.props;

    if (!layerObj) {
      return false;
    }

    const { data, join } = layerObj.source;
    const filterKeys = Object.keys(filters);
    const nextFilters = [isOr ? 'any' : 'all'];

    let newFilters;
    let options;
    let optionKeys;
    let regenStops = false;
    // loop through all filters
    for (let f = 0; f < filterKeys.length; f += 1) {
      // check if filter should be a vector boolean
      if (filterOptions[filterKeys[f]].type === 'vBool') {
        const _data = [...(data.features || data)];
        let _datum;
        let passes = [];
        options = filters[filterKeys[f]].options;
        optionKeys = Object.keys(options);

        for (let b = 0; b < _data.length; b += 1) {
          // loop through the data data
          _datum = { ...(_data[b].properties || _data[b]) };
          for (let o = 0; o < optionKeys.length; o += 1) {
            // loop through option keys
            // check if option is enabled && if optionKey is in select_multiple value
            if (
              options[optionKeys[o]].enabled &&
              _datum[filterKeys[f]].indexOf(optionKeys[o]) !== -1
            ) {
              passes.push(_datum[join[1]]); // push district code
              break;
            }
          }
        }

        passes = [...new Set(passes)];
        newFilters = ['any'];
        for (let p = 0; p < passes.length; p += 1) {
          newFilters.push(['==', join[0], passes[p]]);
        }

        // push this filter to the combind filter
        if (newFilters.length > 1) {
          nextFilters.push(newFilters);
        }
      } // check if the filter is actually filtered
      else if (filters[filterKeys[f]].isFiltered && filterOptions[filterKeys[f]].type !== 'stops') {
        newFilters = ['any'];
        if (filters[filterKeys[f]].dataType === 'ordinal') {
          // define the options and option keys for this filter
          options = filters[filterKeys[f]].options;
          optionKeys = Object.keys(options);
          // loop through all options and add to this filter
          for (let o = 0; o < optionKeys.length; o += 1) {
            if (options[optionKeys[o]].enabled) {
              // push filter expression into array of expressions
              const joinKey = layerObj.aggregate && layerObj.aggregate.joinKey;
              const activeFilterKey = joinKey ? joinKey[f] : filterKeys[f];
              newFilters.push(['==', activeFilterKey, optionKeys[o]]);
            }
          }
        } else {
          // generate filter expressions from adv filter queries
          options = filters[filterKeys[f]].queriedOptionKeys;
          for (let o = 0; o < options.length; o += 1) {
            newFilters.push(['==', filterKeys[f], options[o]]);
          }
        }
        // push this filter to the combind filter
        if (newFilters.length > 1) {
          nextFilters.push(newFilters);
        }
      } else if (filters[filterKeys[f]].isFiltered) {
        regenStops = true;
      }
    }

    // Update FILTER store state
    const { FILTER } = this.props;
    if (FILTER[layerId] && !FILTER[layerId].originalLayerObj) {
      this.buildOriginalObj(this.props, this.state, regenStops);
    }

    const newFilterState = buildFilterState(
      mapId,
      filterOptions,
      filters,
      layerObj,
      dispatch,
      regenStops,
      isOr
    );
    dispatch(Actions.saveFilterState(mapId, layerId, newFilterState));

    if (regenStops) {
      const { fauxLayerObj } = newFilterState;
      // Reload layer to re-aggregate and re-add layer
      this.props.dispatch(Actions.addLayer(mapId, fauxLayerObj));
    } else if (nextFilters.length > 1) {
      // Apply layerFilter to mapbox layer
      this.props.dispatch(Actions.setLayerFilter(mapId, layerId, nextFilters));
    }

    return true;
  };

  buildOriginalObj(props, state, regenStops) {
    const { layerObj, mapId, dispatch } = props;
    const { filters, isOr, filterOptions } = state;
    const filterState = buildFilterState(
      mapId,
      filterOptions,
      filters,
      layerObj,
      dispatch,
      regenStops,
      isOr
    );
    const { originalLayerObj } = filterState;
    dispatch(Actions.resetFilteredLayer(mapId, originalLayerObj));
  }

  buildFauxOptions(
    stateFilters,
    prevStatefilters,
    filterKey,
    doEnable,
    nextQueries,
    queriedOptionKeys
  ) {
    const nextQuery =
      queriedOptionKeys &&
      queriedOptionKeys.length &&
      nextQueries.find(d => d.matches.length === queriedOptionKeys.length);
    const optionKeys = Object.keys(prevStatefilters[filterKey].options);
    let option;
    for (let o = 0; o < optionKeys.length; o += 1) {
      const enableOrDisable =
        nextQuery && nextQueries.indexOf(nextQuery) !== 0 && nextQuery.isOR
          ? false
          : queriedOptionKeys && queriedOptionKeys.includes(optionKeys[o]);
      option = stateFilters[filterKey].options[optionKeys[o]];
      prevStatefilters[filterKey].options[optionKeys[o]] = {
        ...option,
        enabled: enableOrDisable || doEnable,
      };
    }
    return prevStatefilters;
  }

  setFilterQueries = (filterKey, nextQueries, queriedOptionKeys) => {
    const { layerObj, mapId, dispatch, FILTER } = this.props;
    const { isOr, filterOptions } = this.state;
    if (FILTER[this.state.layerId] && !FILTER[this.state.layerId].originalLayerObj) {
      this.buildOriginalObj(this.props, this.state);
    }
    let prevFilters = Object.assign({}, this.state.filters);
    const nextQuery =
      queriedOptionKeys &&
      queriedOptionKeys.length &&
      nextQueries.find(d => d.matches.length === queriedOptionKeys.length);
    const compareQueries =
      this.state.filters[filterKey].queries.length &&
      nextQueries.length > this.state.filters[filterKey].queries.length;
    if (compareQueries) {
      prevFilters[filterKey].toggleAllOn = true;
      prevFilters = {
        ...this.buildFauxOptions(this.state.filters, prevFilters, filterKey, false),
      };
    } else {
      prevFilters[filterKey].toggleAllOn =
        (nextQuery && nextQueries.indexOf(nextQuery) !== 0 && nextQuery.isOR) ||
        (!!!queriedOptionKeys && prevFilters[filterKey].doAdvFiltering);
      prevFilters = {
        ...this.buildFauxOptions(
          this.state.filters,
          prevFilters,
          filterKey,
          null,
          nextQueries,
          queriedOptionKeys
        ),
      };
    }
    prevFilters[filterKey].queries = nextQueries;
    prevFilters[filterKey].queriedOptionKeys = [...new Set(queriedOptionKeys)];
    const { nextFilters } = this.buildNextFilters(
      prevFilters[filterKey].options,
      prevFilters,
      filterKey,
      true
    );

    const hasStops = Object.keys(filterOptions)
      .map(f => filterOptions[f].type)
      .includes('stops');
    const filterState = buildFilterState(
      mapId,
      filterOptions,
      nextFilters,
      layerObj,
      dispatch,
      hasStops,
      isOr
    );
    dispatch(Actions.saveFilterState(mapId, layerObj.id, filterState));
  };

  searchFilterOptions = (e, filterKey) => {
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
        isMatched = isClear || optionKey.toLowerCase().indexOf(val) !== -1;
        options[optionKey].hidden = !isMatched;
        if (!options[optionKey].hidden && !options[optionKey].enabled) {
          toggleAllOn = true;
        }
      }
    }
    const nextFilters = Object.assign({}, this.state.filters, {
      [filterKey]: Object.assign({}, this.state.filters[filterKey], {
        isFiltered: this.isFiltered(options),
        toggleAllOn,
        options,
        isOpen: true,
        doAdvFiltering: e.target.getAttribute('data-type') === 'advanced-filter',
      }),
      // queries: null,
    });

    this.setState({
      filters: {
        ...this.state.filters,
        ...nextFilters,
      },
    });
  };

  clearAllFiltersSearch = e => {
    this.searchEl.value = '';
    this.allFiltersSearch(e);
    // this.onClearClick(e, isFilterable);
  };

  allFiltersSearch = e => {
    const { filters } = this.state;
    let val = (e.target.value || '').toLowerCase();
    const filterKeys = Object.keys(filters);
    let filter;
    let filterKey;
    let options;
    let optionKeys;
    let isMatched;
    let isClear = false;
    const nextFilters = {};

    if (val === '') isClear = true;

    for (let f = 0; f < filterKeys.length; f += 1) {
      filterKey = filterKeys[f];
      filter = filters[filterKeys[f]];
      if (filter.dataType === 'ordinal') {
        filter.isOpen = true;
        options = Object.assign({}, filter.options);
        optionKeys = Object.keys(options);

        for (let o = 0; o < optionKeys.length; o += 1) {
          if (options[optionKeys[o]].count) {
            isMatched = isClear || optionKeys[o].toLowerCase().indexOf(val) !== -1;
            options[optionKeys[o]].hidden = !isMatched;
          }
        }
        nextFilters[filterKey] = Object.assign({}, filters[filterKey], {
          isFiltered: this.isFiltered(options),
          options,
          isOpen: true,
        });
      }
    }

    this.setState({
      filters: nextFilters,
    });
  };

  buildFilteredFilters = (clickedFilterKey, nextFilters) => {
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
      aggregate['accepted-filter-values'][f] =
        filter.queriedOptionKeys && filter.queriedOptionKeys.length
          ? [...new Set(filter.queriedOptionKeys)]
          : [];
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

          if (
            ((filter.isOriginal || filter.isFiltered) && option.enabled) ||
            (!filter.isOriginal && !filter.isFiltered && option.count)
          ) {
            aggregate['accepted-filter-values'][f].push(optionKeys[o]);
          }
        }
        if (optionKeys.length === aggregate['accepted-filter-values'][f].length) {
          aggregate['accepted-filter-values'][f] = filter.filterType === 'multi' ? 'multi' : 'all';
        }
        // } else if (dataType === 'quantitative') {
        //   aggregate['accepted-filter-values'][f] = filter.isFiltered ?
      } else if (!filter.isFiltered) {
        // if (filters[filterKey].isOriginal) {
        aggregate['accepted-filter-values'][f] =
          filter.dataType === 'ordinal'
            ? filter.filterType === 'multi'
              ? 'multi'
              : 'all'
            : 'quant';
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

    const { layerObj } = this.props;

    const newLayerObj = {
      aggregate,
      source:
        layerObj.aggregate && layerObj.aggregate.timeseries
          ? this.props.timeseriesObj
          : layerObj.source,
      type: 'filteredFilter',
      'data-parse': layerObj['data-parse'],
    };
    const newLayerOptions = generateFilterOptions(newLayerObj);
    const filteredFilters = this.buildFiltersMap(newLayerOptions);
    return this.mergeFilters(filters, filteredFilters, clickedFilterKey);
  };

  isMapFiltered = () => {
    const layerFilters = this.getLayerFilter(this.state.layerId);
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
  };

  buildNextFilters = (nextOptions, filters, filterKey, isResetable) => {
    const { toggleAllOn } = filters[filterKey];
    const { filterOptions } = this.state;
    let nextFilters = Object.assign({}, filters, {
      [filterKey]: {
        label: filters[filterKey].label,
        isFiltered: filters[filterKey].isFiltered,
        isOriginal: filters[filterKey].isOriginal,
        toggleAllOn: isResetable ? toggleAllOn : !toggleAllOn,
        options: nextOptions,
        isOpen: true,
        dataType: filters[filterKey].dataType,
        filterType: filters[filterKey].filterType,
        doAdvFiltering: filters[filterKey].doAdvFiltering,
        queries: filters[filterKey].queries,
        queriedOptionKeys: filters[filterKey].queriedOptionKeys,
      },
    });

    let nextFilter;
    let isFiltered = false;
    const filterKeys = Object.keys(nextFilters);

    for (let i = 0; i < filterKeys.length; i += 1) {
      nextFilter = nextFilters[filterKeys[i]];
      nextFilter.isFiltered = this.isFiltered(nextFilter.options, nextFilter.isOriginal);

      // todo - put all this logic in FilterModal.isFiltered()
      const queriedKeys = nextFilter.queriedOptionKeys;
      if (
        nextFilter.isFiltered ||
        (nextFilter.queries &&
          nextFilter.queries.length &&
          (nextFilter.queries.length > 1 || nextFilter.queries[0].val !== '')) ||
        (Array.isArray(nextFilter.options) &&
          queriedKeys &&
          [...new Set(nextFilter.options)].length !== queriedKeys.length)
      ) {
        isFiltered = true;
        nextFilter.isFiltered = true;
      }
      // if (nextFilter.isFiltered) {
      //   isFiltered = true;
      // }
    }

    if (
      Object.keys(nextFilters[filterKey].options).every(
        obj => nextFilters[filterKey].options[obj].enabled === true
      )
    ) {
      isResetable = false;
    }

    if (isFiltered) {
      nextFilters = this.state.isOr
        ? nextFilters
        : this.buildFilteredFilters(filterKey, nextFilters);
    } else if (isResetable) {
      const layerFilters = this.getLayerFilter(this.props.layerObj.id);
      nextFilters = this.buildFiltersMap(filterOptions, layerFilters, nextFilters);
    }

    return { isFiltered, nextFilters };
  };

  toggleSecondAdvancedOptions = (e, filterKey) => {
    e.preventDefault();
    const { filters } = this.state;
    const nextFilters = filters;
    const isAdvanced = filters[filterKey].expandSecondAdvancedOptions;
    nextFilters[filterKey].expandSecondAdvancedOptions = !isAdvanced;
    this.setState({
      filters: nextFilters,
    });
  };

  showGlobalSearchField = e => {
    e.preventDefault();
    this.setState({
      globalSearchField: !this.state.globalSearchField,
    });
  };

  toggleAdvFilter = (e, filterKey) => {
    e.preventDefault();
    const { filters } = this.state;
    const nextFilters = filters;
    nextFilters[filterKey].doAdvFiltering = !filters[filterKey].doAdvFiltering;
    nextFilters[filterKey].expandSecondAdvancedOptions = false;
    this.setState({
      filters: nextFilters,
    });
  };
  render() {
    const { isSplitScreen, mapId, layerObj } = this.props;
    const { filters, isMac, globalSearchField } = this.state;
    const filterIsPrev = layerObj && layerObj.aggregate && layerObj.aggregate.filterIsPrev;
    const filterKeys = filters ? Object.keys(filters) : {};
    const filterItems = [];
    let filter;
    let isFilterable = false;

    for (let f = 0; f < filterKeys.length; f += 1) {
      filter = filters[filterKeys[f]];
      const { isFiltered, toggleAllOn, queries, queriedOptionKeys } = filter;
      if (isFiltered) {
        isFilterable = true;
      }
      filterItems.push(
        <li className="filter-item" key={filterKeys[f]}>
          <a
            className={`indicator-label indicator-item filter-option
              ${filter.isOpen ? ' active' : ''}
              ${isFiltered ? ' filtered filterOptionSelected' : ''}`}
            onClick={e => {
              this.onFilterItemClick(e, filterKeys[f]);
            }}
            data-type="basic-filter"
            role="button"
            tabIndex="-1"
          >
            {filter.label}
            {filter.isOpen && filter.dataType !== 'quantitative' ? (
              <span
                role="button"
                tabIndex="0"
                title="Advanced Filters"
                className={`glyphicon glyphicon-option-vertical${
                  filter.doAdvFiltering ? ' active' : ' inactive'
                }`}
                onClick={e => {
                  this.toggleAdvFilter(e, filterKeys[f]);
                }}
                data-key={filterKeys[f]}
              />
            ) : (
              ''
            )}
            <span
              className={`caret caret-${filter.isOpen ? 'down' : 'right'}`}
              data-type="basic-filter"
            />
          </a>
          {filter.isOpen ? (
            <FilterSelector
              mapId={mapId}
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
          ) : (
            ''
          )}
        </li>
      );
    }

    let isClearable;
    if (this.props && this.props.FILTER && this.props.layerObj) {
      const { FILTER } = this.props;
      const { id } = this.props && this.props.layerObj;
      if (
        FILTER &&
        FILTER[id] &&
        FILTER[id].aggregate &&
        FILTER[id].aggregate['accepted-filter-values'] &&
        !FILTER[id].aggregate['accepted-filter-values'].every(obj => obj === 'all') &&
        FILTER &&
        FILTER[id] &&
        !FILTER[id].isClear
      ) {
        isClearable = true;
      }
    }

    const doClear = isFilterable || this.isMapFiltered() || isClearable;
    let sidebarOffset =
      this.props.showFilterPanel && !(layerObj.aggregate && layerObj.aggregate.filterIsPrev)
        ? '260px'
        : !!this.props.detailView
        ? '355px'
        : '10px';

    if (isSplitScreen && mapId === 'map-1') {
      sidebarOffset = `calc(48% + ${sidebarOffset})`;
    }

    const filterClasses = `${isMac ? ' mac' : ''}${
      isSplitScreen && mapId === 'map-1' ? ' isSplitScreen' : ''
    }`;

    return (
      <div>
        {this.props.showFilterBtn ? (
          <button
            className={`filterButton glyphicon glyphicon-filter${
              this.props.showFilterPanel ? ' open' : ''
            }`}
            onClick={() => {
              this.handleFilterClick();
            }}
            style={{ right: sidebarOffset, top: this.props.hasNavBar ? '230px' : '195px' }}
          />
        ) : (
          ''
        )}

        {this.props.showFilterPanel && !filterIsPrev ? (
          <div>
            <div className={`profile-view-container filter-container${filterClasses}`}>
              <button
                className="filter-search"
                onClick={e => {
                  this.showGlobalSearchField(e);
                }}
              >
                <span className="glyphicon glyphicon-search" />
              </button>
              <button
                className="close-btn filter-close"
                title="Close Filters"
                onClick={e => {
                  this.handleFilterClick(e);
                }}
              >
                <span className="glyphicon glyphicon-remove" />
              </button>
              <div className="profile-basic-details filter-header-section">
                <div className="profile-header-section filter-header">
                  <h5>LAYER FILTERS</h5>
                  <div className="advanced-controls">
                    <div>
                      <button
                        id="or-and"
                        onClick={e => {
                          this.handleChange(e);
                        }}
                        className={`${!this.state.isOr ? 'And' : 'Or'}`}
                        title={`Cross Filtering: ${!this.state.isOr ? 'And' : 'Or'}`}
                      ></button>
                    </div>
                  </div>
                </div>
                {globalSearchField ? (
                  <div className="search-column">
                    <span className="searchBtn" role="button">
                      <span className="glyphicon glyphicon-search" />
                    </span>
                    <input
                      ref={el => {
                        this.searchEl = el;
                      }}
                      type="text"
                      className="filterSearch"
                      placeholder="Search All Filters"
                      onChange={e => {
                        this.allFiltersSearch(e);
                      }}
                    />
                    {this.searchEl && this.searchEl.value !== '' ? (
                      <span
                        className="clearSearch"
                        role="button"
                        tabIndex="0"
                        onClick={e => {
                          this.clearAllFiltersSearch(e);
                        }}
                      >
                        <span className="glyphicon glyphicon-remove" />
                      </span>
                    ) : (
                      ''
                    )}
                  </div>
                ) : (
                  ''
                )}
              </div>
              <div className="profile-indicators filter-section-options">
                <ul>
                  <li>
                    <ul className="indicators-list">{filterItems}</ul>
                  </li>
                </ul>
              </div>
              <div className="filter-footer">
                <div className="filter-footer-section">
                  <div className="filter-footer-content">
                    <table className="filter-footer-controls">
                      <tbody>
                        <tr>
                          <td>
                            <button
                              className={`${doClear ? 'enabled' : 'disabled'}`}
                              onClick={e => {
                                this.onClearClick(e, doClear);
                              }}
                            >
                              Clear Filters
                            </button>
                          </td>
                          <td>
                            <button
                              className={`${isFilterable ? 'enabled' : 'disabled'}`}
                              onClick={e => {
                                this.onApplyClick(e, isFilterable);
                              }}
                            >
                              Apply Filters
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : this.props.showFilterPanel && filterIsPrev ? (
          <FilterSelectorPrev
            layerObj={layerObj}
            dispatch={this.props.dispatch}
            mapId={this.props.mapId}
          />
        ) : null}
      </div>
    );
  }
}

Filter.propTypes = {
  layerObj: PropTypes.objectOf(PropTypes.any),
  doShowProfile: PropTypes.bool.isRequired,
  showFilterPanel: PropTypes.bool.isRequired,
  layersObj: PropTypes.arrayOf(PropTypes.any).isRequired,
  layerData: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default connect(mapStateToProps)(Filter);
