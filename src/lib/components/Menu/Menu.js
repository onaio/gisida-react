import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { Actions } from 'gisida';
import Layers from '../Layers/Layers';
import { groupBy } from '../../utils'
import './Menu.scss';

const mapStateToProps = (state, ownProps) => {
  const categories = [];
  const layers = [];
  // populate layers array with layer objects in state.MAP.layers;
  for (var key in state.MAP.layers) {
    layers.push(state.MAP.layers[key]);
  } 
  // Group layers by category property
  const grouped = groupBy(layers, 'category');
  
  // Add layers to categories
  grouped.forEach(group => {
    if (group[0].hasOwnProperty('category')) {
      categories.push({
        layers: group,
        category: group[0].category
      });
    } else {
      categories.push({
        layers: group,
        category: "Default"
      });
    }
  });

  // Get current region
  const currentRegion = state.REGIONS && state.REGIONS.length?
    state.REGIONS.filter(region => region.current)[0].name: '';

  return {
    categories: categories,
    // todo: provide missing props
    menuId: 'sector-menu-1',
    mapTargetId: '',
    regions: state.REGIONS,
    currentRegion: currentRegion,
    loaded: state.APP.loaded,
    preparedLayers: state.MAP.layers,
  }
}

class Menu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openCategories: [],
      openMenu: true
    }
  }

  onToggleMenu = (e) => {
    e.preventDefault();
    this.setState({ openMenu: !this.state.openMenu });
  }

  onCategoryClick = (e, category) => {
    e.preventDefault();

    const openCategories = this.state.openCategories;
    const index = openCategories.indexOf(category);
  
    if (index > -1) {
      openCategories.splice(openCategories.indexOf(category), 1);
    } else openCategories.push(category);
    this.setState({ openCategories });
  }

  onRegionClick = (e) => {
    const region = e.target.value;
    this.props.dispatch(Actions.changeRegion(region));
  }

  render() {
    const menuId = this.props.menuId;
    const mapTargetId = this.props.mapTargetId;
    const categories = this.props.categories;
    const regions = this.props.regions;
    const currentRegion = this.props.currentRegion;
    const preparedLayers = this.props.preparedLayers;
    return (
      <div>
      {this.props.loaded ?
        <div id={`${menuId}-wrapper`} className="sectors-menu-wrapper">
          <a onClick={e => this.onToggleMenu(e)} className="open-btn">
            <span className="glyphicon glyphicon-menu-hamburger"></span>
          </a>
          {this.state.openMenu ?
              <div id={menuId} className="sectors-menu">
                <a className="close-btn" onClick={e => this.onToggleMenu(e)}>
                  <span className="glyphicon glyphicon-remove"></span>
                </a>
                <ul className="sectors">
                  {regions && regions.length ?
                    <li className="sector">
                      <a onClick={e => this.onCategoryClick(e, 'Regions')}>Regions
                  <span className="caret" />
                      </a>
                      <ul className="layers">
                        {regions && regions.length ?
                          regions.map((region, i) =>
                            (<li className={`region ${mapTargetId}`} key={region.name}>
                              <input
                                id={region.name}
                                key={region.name}
                                name="region"
                                type="radio"
                                value={region.name}
                                checked={!!region.current}
                                onChange={e => this.onRegionClick(e)}
                              />
                              <label htmlFor={region.name}>{region.name}</label>
                            </li>)) :
                          <li></li>
                        }
                      </ul>
                    </li> : <li />}
                  {(categories && categories.length) > 0 ?
                    categories.map((category, i) =>
                      (<li className="sector" key={i}>
                        <a onClick={e => this.onCategoryClick(e, category.category)}>{category.category}
                          <span
                            className={"category glyphicon " +
                              (this.state.openCategories.includes(category.category) ?
                                "glyphicon-chevron-down" : "glyphicon-chevron-right")}
                          />
                        </a>
                        {
                          this.state.openCategories.includes(category.category) ?
                            <Layers
                              mapTargetId={mapTargetId}
                              layers={category.layers}
                              currentRegion={currentRegion}
                              preparedLayers={preparedLayers}
                            />
                            : <ul />}
                      </li>)) :
                    <li></li>
                  }
                </ul>
              </div> : ''}
        </div> : ''}
      </div>
    );
  }
}

Menu.propTypes = {
  menuId: PropTypes.string.isRequired,
  // mapTargetId: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default connect(mapStateToProps)(Menu);
