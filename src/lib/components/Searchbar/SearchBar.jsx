import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, prepareLayer, lngLat } from 'gisida';
import { pushLayerToURL } from '../Layer/utils';
import './SearchBar.scss';

/**
 * To activate the search functionality add "searchBar":true and
 * To Change search bar color add "searchBarColor": <desired color>
 * on client site-config.json APP object
 */

const mapStateToProps = (state, ownProps) => {
  const { APP, LOC } = state;
  const MAP = state[ownProps.mapId] || { layers: {} };
  return {
    APP,
    LOC,
    appColor: APP.appColor,
    searchBarColor: APP.searchBarColor,
    preparedLayers: MAP.layers,
    ...ownProps,
  };
};

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
      selectedLayerId: null,
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSearchInput = this.handleSearchInput.bind(this);
  }

  componentDidUpdate() {
    const { selectedLayerId } = this.state;
    const { preparedLayers, openCategoryForLayers } = this.props;

    // open menu when layer is loaded visibility is turned on
    if (selectedLayerId && preparedLayers[selectedLayerId].visible) {
      openCategoryForLayers([selectedLayerId]);
      this.setState({ selectedLayerId: null });
    }
  }

  /**
   * dispatches action to open layer
   * @param(Object) layer
   */
  toggleLayer = layer => {
    const { mapId, APP, LOC } = this.props;
    if (!mapId) {
      return null;
    }
    if (APP.mapStateToUrl) {
      pushLayerToURL(layer, mapId);
    }
    this.props.dispatch(Actions.toggleLayer(mapId, layer.id));
    const { center, zoom } = lngLat(LOC, APP);
    if (layer.zoomOnToggle && layer.visible) {
      window.maps.forEach(e => {
        e.easeTo({
          center,
          zoom,
        });
      });
    }
    // Prepare layer if layer had not been loaded
    if (!layer.loaded && !layer.isLoading) {
      prepareLayer(mapId, layer, this.props.dispatch);
    }
  };

  /**
   * make part of indicator matching user querry bold
   * @param {string} indicator - indicator label
   * @param {string} query - user search input
   * @param {string} id - indicator identifier
   */
  boldQuery(indicator, query, id) {
    const indicatorToUpper = indicator.toUpperCase();
    const queryToUpper = query.toUpperCase();
    if (!indicatorToUpper.includes(queryToUpper)) {
      return null;
    }
    const matchIndex = indicatorToUpper.indexOf(queryToUpper);
    const querryLen = queryToUpper.length;

    return (
      <a onClick={e => this.onsearchResultClick(e, id)}>
        {indicator.substr(0, matchIndex)}
        <b>{indicator.substr(matchIndex, querryLen)}</b>
        {indicator.substr(matchIndex + querryLen)}
      </a>
    );
  }

  /**
   * handle user search input
   * @param {ChangeEvent} e - change event
   */
  handleSearchInput(e) {
    this.setState({ inputText: e.target.value });
    const { handleSearchInput, preparedLayers, parentState } = this.props;
    let input = e.target.value;
    input = input.replace(/\s+/g, ' ');
    input = input.trimStart();
    const searchResults = [];
    Object.keys(preparedLayers).forEach(key => {
      const { label } = preparedLayers[key];
      const result = this.boldQuery(label, input, key);
      if (result) {
        searchResults.push(
          <li key={key} className="search-sector">
            {result}
          </li>
        );
      }
    });
    handleSearchInput(searchResults, input, parentState);
  }

  /**
   * this is called when a search result is clicked
   * @param {MouseEvent} e
   * @param {string} id - indicator identifier
   */
  onsearchResultClick(e, id) {
    e.preventDefault();
    const { searchResultClick, preparedLayers } = this.props;
    this.toggleLayer(preparedLayers[id]);
    searchResultClick();
    this.setState({ selectedLayerId: id });
  }

  /**
   * clears search input and displays menu
   * @param {MouseEvent} e
   */
  handleCancel(e) {
    e.preventDefault();
    this.setState({ inputText: '' });
    this.props.handleSearchClick(e, true);
  }

  render() {
    const { inputText } = this.state;
    const { appColor, searchBarColor, searching, handleSearchClick } = this.props;

    const searchBtn = {
      border: `1px solid ${searchBarColor || appColor || '#00B4CC'}`,
      background: `${searchBarColor || appColor || '#00B4CC'}`,
    };
    const serchtearm = {
      border: `2px solid ${searchBarColor || appColor || '#00B4CC'}`,
    };
    return (
      <div className="search-wrapper">
        <div className="search">
          <input
            type="text"
            className="searchTerm"
            value={inputText}
            style={serchtearm}
            placeholder="Search..."
            onChange={this.handleSearchInput}
          />
          {searching ? (
            <button
              type="button"
              className="searchButton"
              style={searchBtn}
              onClick={e => this.handleCancel(e)}
            >
              <i className="fa fa-times"></i>
            </button>
          ) : (
            <button
              type="button"
              className="searchButton"
              style={searchBtn}
              onClick={e => handleSearchClick(e, false, inputText.trim().length)}
            >
              <i className="fa fa-search"></i>
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(SearchBar);
