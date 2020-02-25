import React, { Component } from 'react';
import { connect } from 'react-redux';
import './SearchBar.scss'

const mapStateToProps = (state, ownProps) => {
    const { LAYERS, APP } = state;
    const { handleSearch, searching, handleSearchClick } = ownProps;
    return {
      LAYERS,
      appColor: APP.appColor,
      searchBarColor: APP.searchBarColor,
      handleSearch,
      searching,
      handleSearchClick,
    };
  };

class SearchBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
    }
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleCancel(e) {
    e.preventDefault();
    this.props.handleSearchClick(e, true)
  }

  render() {
    const { appColor, searchBarColor, handleSearch, searching, handleSearchClick } = this.props;
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
          <input type="text" className="searchTerm" style={serchtearm} placeholder="Search..." 
            onChange={ handleSearch }
          />
          { searching ?
            <button type="button" className="searchButton" style={searchBtn}
            onClick={e => this.handleCancel(e)} >
            <i className="fa fa-times"></i>
            </button> :
            <button type="button" className="searchButton" style={searchBtn}
            onClick={e => handleSearchClick(e, false)} >
            <i className="fa fa-search"></i>
            </button>
          }
      </div>
    </div>
    )
  }
}

export default connect(mapStateToProps)(SearchBar);