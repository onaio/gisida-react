import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, prepareLayer, lngLat } from 'gisida';
import './SearchBar.scss'

/**
 * To activate the search functionality add "searchBar":true and 
 * To Change search bar color add "searchBarColor": <desired color> 
 * on client site-config.json APP object
*/


const mapStateToProps = (state, ownProps) => {
    const { LAYERS, APP, LOC } = state;
    return {
      APP,
      LOC,
      LAYERS,
      appColor: APP.appColor,
      searchBarColor: APP.searchBarColor,
      ...ownProps
    };
  };

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
      selectedLayerId: null,
    }
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSearchInput = this.handleSearchInput.bind(this);
  }

  componentDidUpdate() {
    const { selectedLayerId } = this.state;
    const { preparedLayers, openCategoryForSharedLayers } = this.props;

    // open menu when layer is loaded visibility is turned on
    if (selectedLayerId && preparedLayers[selectedLayerId].visible) {
      const toOpenLayer = {
        id: selectedLayerId,
        isCatOpen: false,
      };
      openCategoryForSharedLayers([toOpenLayer]);
      this.setState({selectedLayerId: null});
    }
  }

  // load layer to map
  toggleLayer = (layer) => {
    const { mapId, APP, LOC } = this.props;
    if (!mapId) {
      return null;
    }
    this.props.dispatch(Actions.toggleLayer(mapId, layer.id));
    const {center, zoom } = lngLat(LOC, APP);
    if (layer.zoomOnToggle && layer.visible) {
        window.maps.forEach((e) => {
          e.easeTo({
            center,
            zoom,
          })
        });  
      } 
    // Prepare layer if layer had not been loaded
    if (!layer.loaded && !layer.isLoading) {
      prepareLayer(mapId, layer, this.props.dispatch);
    }
  }
  
  // make the matching part bold
  boldQuery(indicator, query, id){
    const indicatorToUpper = indicator.toUpperCase();
    const queryToUpper = query.toUpperCase();
    if (!indicatorToUpper.includes(queryToUpper)) {
      return null;
    }
    const matchIndex = indicatorToUpper.indexOf(queryToUpper);
    const querryLen = queryToUpper.length;

    return (
      <a onClick={e => this.OnsearchResultClick(e, id)}>
        {indicator.substr(0,matchIndex)}<b>{indicator.substr(matchIndex, querryLen)}</b>{indicator.substr(matchIndex+querryLen)}
      </a>
    )
  }

  // find part of layer labels matching querry
  handleSearchInput(e) {
    this.setState({inputText: e.target.value})
    const { handleSearchInput, preparedLayers } = this.props;
    let input = e.target.value;
    input = input.replace(/\s+/g, ' ')
    input = input.trimStart()
    const searchResults = [];
    Object.keys(preparedLayers).forEach(key => {
        const { label } = preparedLayers[key];
        const result = this.boldQuery(label, input, key)
        if (result) {
          searchResults.push(
            <li key={key} className="search-sector">{result}</li>
          )
        }
    })
    handleSearchInput(searchResults, input);
  }

  // called when search result is selected
  OnsearchResultClick(e, id) {
    e.preventDefault();
    const {searchResultClick, preparedLayers } = this.props;
    this.toggleLayer(preparedLayers[id]);
    searchResultClick();
    this.setState({selectedLayerId: id})
  }

  // called cancel button on search bar is selected
  handleCancel(e) {
    e.preventDefault();
    this.setState({inputText: "", });
    this.props.handleSearchClick(e, true);
  }

  render() {
    const { inputText } = this.state;
    const { appColor, searchBarColor, searching, handleSearchClick } = this.props;

    const searchBtn = {
      border: `1px solid ${ searchBarColor || appColor || '#00B4CC'}`,
      background: `${ searchBarColor || appColor || '#00B4CC'}`,
    }
    const serchtearm = {
      border: `2px solid ${ searchBarColor || appColor || '#00B4CC'}`,
    }
    return (
      <div className="search-wrapper">
      <div className="search">
          <input type="text" className="searchTerm" value={inputText} style={serchtearm} placeholder="Search..." 
            onChange={ this.handleSearchInput }
          />
          { searching ?
            <button type="button" className="searchButton" style={searchBtn}
            onClick={e => this.handleCancel(e)} >
            <i className="fa fa-times"></i>
            </button> :
            <button type="button" className="searchButton" style={searchBtn}
            onClick={e => handleSearchClick(e, false, inputText.trim().length)} >
            <i className="fa fa-search"></i>
            </button>
          }
      </div>
    </div>
    )
  }
}

export default connect(mapStateToProps)(SearchBar);