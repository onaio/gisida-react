import React, { Component } from 'react';
import { connect } from 'react-redux';
import './SearchBar.scss'

const mapStateToProps = (state, ownProps) => {
    const { LAYERS, APP } = state;
    return {
      LAYERS,
      appColor: APP.appColor,
      searchBarColor: APP.searchBarColor,
      handleSearch: ownProps.handleSearch,
    };
  };

class SearchBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
    }
    this.handleClick = this.handleClick.bind(this);
  }

  

  handleClick() {
    
  }

  render() {
    const { appColor, searchBarColor, handleSearch } = this.props;
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
          <button type="button" className="searchButton" style={searchBtn}
            onClick={this.handleClick} >
            <i className="fa fa-search"></i>
        </button>
      </div>
    </div>
    )
  }
}

export default connect(mapStateToProps)(SearchBar);