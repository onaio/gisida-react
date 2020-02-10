import React, { Component } from 'react';
import { connect } from 'react-redux';
import './SearchBar.scss'

const mapStateToProps = (state, ownProps) => {
    const { LAYERS, APP } = state;
    return {
      LAYERS,
      appColor: APP.appColor,
    };
  };

class SearchBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(e) {
    e.preventDefault();
    const input = e.target.value;
    this.setState({ input});
  }

  handleClick() {
    
  }

  render() {
    const { appColor } = this.props;
    const searchBtn = {
      border: `1px solid ${ appColor || '#00B4CC'}`,
      background: `${ appColor || '#00B4CC'}`,
    }
    const serchtearm = {
      border: `2px solid ${ appColor || '#00B4CC'}`,
    }
    return (
      <div className="search-wrapper">
      <div className="search">
          <input type="text" className="searchTerm" style={serchtearm} placeholder="Search..." 
            onChange={ this.handleChange }
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