import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { Actions } from 'gisida';
import Layers from '../Layers/Layers';
import './Menu.scss';

const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId] || { layers: {} };
  const { LAYERS } = state;
  let categories;
  // let layers;

  if (Object.keys(LAYERS.groups).length) {
    // build list of LAYERS.categories populated with layers from MAP.layers 
    categories = Object.keys(LAYERS.groups).map((group) => {
      return {
        category: group,
        layers: LAYERS.groups[group].map((l) => MAP.layers[l])
          .filter((l) => typeof l !== 'undefined'),
      };
    });
  } else if (Object.keys(MAP.layers).length) {
    categories = {};
    let category;

    Object.keys(MAP.layers).forEach((l) => {
      if (MAP.layers[l].category) {
        category = MAP.layers[l].category;
        if (!categories[category]) {
          categories[category] = {
            category,
            layers: [],
          };
        }
        categories[category].layers.push(MAP.layers[l]);
      }
    });

    categories = Object.keys(categories).map(c => categories[c]);
  }

  // todo - support layers without categories
  // if (!Object.keys(categories).length) {
  //   categories = null;
  //   layers = Object.keys(MAP.layers).map(l => MAP.layers[l]);
  // }

  // Get current region
  const currentRegion = state.REGIONS && state.REGIONS.length ?
    state.REGIONS.filter(region => region.current)[0].name : '';

  return {
    categories,
    // layers, // todo - support layers without categories
    LAYERS,
    menuId: 'sector-menu-1',
    mapTargetId: '',
    regions: state.REGIONS,
    currentRegion: currentRegion,
    loaded: state.APP.loaded,
    preparedLayers: MAP.layers,
  };
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
    const mapId = this.props.mapId;
    const categories = this.props.categories;
    const regions = this.props.regions;
    const currentRegion = this.props.currentRegion;
    const preparedLayers = this.props.preparedLayers;
    return (
      <div>
        {this.props.children ? this.props.children :
          <div>
            {this.props.loaded ?
              // Menu Wrapper
              <div id={`${mapId}-menu-wrapper`} className="menu-wrapper">
                {/* Open button menu */}
                <a onClick={e => this.onToggleMenu(e)} className="open-btn"
                  style={{ display: this.state.openMenu ? 'none' : 'block' }}>
                  <span className="glyphicon glyphicon-menu-hamburger"></span>
                </a>
                {/* Menu */}
                <div id={`${mapId}-menu`} className="sectors-menu"
                  style={{ display: this.state.openMenu ? 'block' : 'none' }}>
                  {/* Close menu button */}
                  <a className="close-btn" onClick={e => this.onToggleMenu(e)}>
                    <span className="glyphicon glyphicon-remove"></span>
                  </a>
                  {/* Menu List*/}
                  <ul className="sectors">
                    {regions && regions.length ?
                      <li className="sector">
                        <a onClick={e => this.onCategoryClick(e, 'Regions')}>Regions
                          <span className="caret" />
                        </a>
                        <ul className="layers">
                          {regions && regions.length ?
                            regions.map((region, i) =>
                              (<li className={`region ${mapId}`} key={region.name}>
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
                                mapId={mapId}
                                layers={category.layers}
                                currentRegion={currentRegion}
                                preparedLayers={preparedLayers}
                              />
                              : <ul />}
                        </li>)) :
                      <li></li>
                    }
                  </ul>
                </div>
              </div> : ''}
          </div>
        }
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
