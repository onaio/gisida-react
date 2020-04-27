import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions, prepareLayer, lngLat } from 'gisida';
import './SearchBar.scss'

const mapStateToProps = (state, ownProps) => {
    const { LAYERS, APP, LOC } = state;
    console.log(ownProps.preparedLayers)
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
  onCategoryClick
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
    }
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSearchInput = this.handleSearchInput.bind(this);
  }

  onLayerToggle = (layer) => {
    // dispatch toggle layer action
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

  OnsearchResultClick(e, id) {
    e.preventDefault();
    const { searchterms, getCategoryIndex, onCategoryClick, searchResultClick, preparedLayers } = this.props;
    const { label } = preparedLayers[id];
    const inidcatorDetails = searchterms[label];
    const isArray = Array.isArray(inidcatorDetails);
    const parentLayers = isArray ? inidcatorDetails : inidcatorDetails.parentLayers;
    this.onLayerToggle(preparedLayers[id])
    parentLayers.forEach((layer, i) => {
      if (i === 0) {
        getCategoryIndex(layer) ?  onCategoryClick(e, layer) : null;
      } else {
      }
      
    })
    searchResultClick();
  }

  handleCancel(e) {
    e.preventDefault();
    this.setState({inputText: "", })
    this.props.handleSearchClick(e, true)
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