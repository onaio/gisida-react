import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'gisida';
import Layers from '../Layers/Layers';
import './Menu.scss';

const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId] || { layers: {} };
  const { LAYERS, AUTH, VIEW } = state;
  let categories;
  // let layers;

  if (Object.keys(LAYERS.groups).length) {
    const groupMapper = layer => {
      if (typeof layer === 'string') {
        return MAP.layers[layer];
      }

      const subGroup = {};
      Object.keys(layer).forEach(l => {
        subGroup[l] = {
          category: l,
          layers: layer[l].map(groupMapper).filter(l => typeof l !== 'undefined'),
        };
      });
      return subGroup;
    };
    // build list of LAYERS.categories populated with layers from MAP.layers
    categories = Object.keys(LAYERS.groups).map(group => {
      return {
        category: group,
        layers: LAYERS.groups[group].map(groupMapper).filter(l => typeof l !== 'undefined'),
      };
    });
  } else if (Object.keys(MAP.layers).length) {
    categories = {};
    let category;

    Object.keys(MAP.layers).forEach(l => {
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
  const currentRegion =
    state.REGIONS && state.REGIONS.length
      ? state.REGIONS.filter(region => region.current)[0].name
      : '';

  return {
    categories,
    // layers, // todo - support layers without categories
    LAYERS,
    AUTH,
    menuId: 'sector-menu-1',
    mapTargetId: '',
    regions: state.REGIONS,
    currentRegion: currentRegion,
    loaded: state.APP.loaded,
    preparedLayers: MAP.layers,
    menuIsOpen: MAP.menuIsOpen,
    openCategories: MAP.openCategories,
    layerItem: ownProps.layerItem,
    menuScroll: MAP.menuScroll,
    showMap: VIEW.showMap,
    hasNavbar: ownProps.hasNavbar,
  };
};

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openCategories: [],
    };
    this.menuWrapper = React.createRef();
  }

  componentDidMount() {
    if (this.menuWrapper && this.menuWrapper.current && this.props.menuScroll) {
      this.menuWrapper.current.scrollTop = this.props.menuScroll.scrollTop;
    }
  }

  handleScroll = e => {
    let element = e.target;
    this.props.dispatch(Actions.setMenuScroll(this.props.mapId, element.scrollTop));
  };

  componentDidUpdate(prevProps) {
    if (this.props.showMap && this.props.showMap !== prevProps.showMap && this.props.menuScroll) {
      this.menuWrapper.current.scrollTop = this.props.menuScroll.scrollTop;
    }
  }

  onToggleMenu = e => {
    e.preventDefault();
    const { dispatch } = this.props;
    dispatch(Actions.toggleMenu(this.props.mapId));
  };

  onCategoryClick = (e, category) => {
    e.preventDefault();
    const { openCategories } = this.props;
    const index = openCategories.indexOf(category);
    this.props.dispatch(Actions.toggleCategories(this.props.mapId, category, index));
  };

  onRegionClick = e => {
    const region = e.target.value;
    this.props.dispatch(Actions.changeRegion(region));
  };

  /**
   * Modify a layer by giving its group and nested groups a count
   * @param {Object} layer - A layer with groups
   * @param {number} groupCounter - A group counter that will give each group a number
   * @returns {Object} Modified layer and current group counter increment
   */
  insertGroupCount(layer, groupCounter) {
    Object.keys(layer).forEach(key => {
      layer[key].count = groupCounter;
      groupCounter += 1;

      layer[key].layers.forEach(keyLayer => {
        if (!keyLayer.id) {
          keyLayer = this.insertGroupCount(keyLayer, groupCounter);
        }
      });
    });

    return {
      layer,
      groupCounter,
    };
  }

  /**
   * Loop over the categories and modify data
   * @param {array} categories Menu categories and their layers, basically all menu items
   * @returns {array} Modified categories
   */
  parseCategories(categories) {
    let groupCounter = 0;
    categories.forEach(category => {
      category.layers.forEach(layer => {
        if (!layer.id) {
          // This is a group. Give it and its nested groups a count
          // This will make sure when we toggle a group, another group with the
          // exact same name is not toggled. The array of open groups is stored as an
          // array in the store. Another implementaion would to give each group an Id e.g a random no but
          // this means different menu instances will have groups that have different Ids which we do not
          // want (We would like menu instances under the same map ID to behave the same. If say I open a group in one
          // menu, it should appear open the other ). A contigous int counter is
          // therefore used to ensure the counter for a group in different menu
          // instances is the same, and also, groups in the same menu instances do not share a count.
          const obj = this.insertGroupCount(layer, groupCounter);
          layer = obj.layer;
          groupCounter = obj.groupCounter;
        }
      });
    });

    return categories;
  }

  /**
   * Check if a user has permission to access layer
   * @param {*} authConfigs - Authentication configurations
   * @param {*} userInfo - User details
   */
  canAccessLayer(layer, authConfigs, userInfo) {
    const users = authConfigs.LAYERS[layer.id];

    return (
      (users && userInfo && users.includes(userInfo.username)) ||
      (authConfigs.LAYERS &&
        authConfigs.LAYERS.ALL &&
        authConfigs.LAYERS.ALL.includes(userInfo.username))
    );
  }

  /**
   * Return an accesible group layer. If the layer has no accessible children
   * return false, else return the modified layer with the accessible children
   * @param {*} layer - Group layer
   * @param {*} authConfigs - Authentication configaurations
   * @param {*} userInfo - Auth user details
   */
  getAccessibleGroupLayer(layer, authConfigs, userInfo) {
    const keys = Object.keys(layer);
    const accessibleKeys = [];

    keys.forEach(key => {
      const accessibleKeySubLayers = [];

      layer[key].layers.forEach(subLayer => {
        if (!subLayer.id) {
          let groupLayer = this.getAccessibleGroupLayer(subLayer, authConfigs, userInfo);

          if (groupLayer) {
            accessibleKeySubLayers.push(groupLayer);
          }
        } else {
          if (this.canAccessLayer(subLayer, authConfigs, userInfo)) {
            accessibleKeySubLayers.push(subLayer);
          }
        }
      });

      if (accessibleKeySubLayers.length > 0) {
        // Modify sublayers, only return those which user has access to
        layer[key].layers = accessibleKeySubLayers;
        accessibleKeys.push(key);
      }
    });

    keys.forEach(key => {
      if (!accessibleKeys.includes(key)) {
        // Delete key if key is not in accessible keys
        delete layer[key];
      }
    });

    // Now get the final keys. If keys exist, return modified layer
    if (Object.keys(layer).length > 0) {
      return layer;
    }

    return false;
  }

  /**
   * Get which categories and their groups and nested groups user has
   * permission to view
   * @returns {array} Filtered categories
   */
  getAccessibleCategories() {
    if (!this.props.AUTH) {
      return this.props.categories;
    }
    const filteredCategories = [];

    if (this.props.categories) {
      const { userInfo, authConfigs } = this.props.AUTH;

      this.props.categories.forEach(category => {
        let accesibleLayers = [];

        category.layers.forEach(layer => {
          if (!authConfigs || !authConfigs.LAYERS) {
            // If auth exists but authconfigs have not loaded. Bug should be fixed from ONA data and gisida core
            accesibleLayers.push(layer);
          } else if (!layer.id) {
            let groupLayer = this.getAccessibleGroupLayer(layer, authConfigs, userInfo);

            if (groupLayer) {
              accesibleLayers.push(groupLayer);
            }
          } else {
            if (this.canAccessLayer(layer, authConfigs, userInfo)) {
              accesibleLayers.push(layer);
            }
          }
        });

        if (accesibleLayers.length > 0) {
          // Modify category layers with the new updated layers
          category.layers = accesibleLayers;
          filteredCategories.push(category);
        }
      });
    }

    return filteredCategories;
  }

  render() {
    const mapId = this.props.mapId;
    let categories = this.getAccessibleCategories();

    if (categories) {
      categories = this.parseCategories(categories);
    }

    const { disableDefault } = this.props;
    if (disableDefault) return this.props.children || null;

    const children = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, { mapId });
    });

    const { regions, currentRegion, preparedLayers, childrenPosition } = this.props;
    const childrenPositionClass = childrenPosition || 'top';
    const marginTop = this.props.hasNavbar ? '-80px' : 0;

    return (
      <div>
        <div>
          {this.props.loaded ? (
            // Menu Wrapper
            <div
              onScroll={this.handleScroll}
              ref={this.menuWrapper}
              id={`${mapId}-menu-wrapper`}
              className={`menu-wrapper ${childrenPositionClass}`}
              style={{ marginTop }}
            >
              {/* Open button menu */}
              <a
                onClick={e => this.onToggleMenu(e)}
                className="open-btn"
                style={{ display: this.props.menuIsOpen ? 'none' : 'block' }}
              >
                <span className="glyphicon glyphicon-menu-hamburger"></span>
              </a>
              {/* Menu */}
              <div
                id={`${mapId}-menu`}
                className="sectors-menu"
                style={{ display: this.props.menuIsOpen ? 'block' : 'none' }}
              >
                {/* Close menu button */}
                <a className="close-btn" onClick={e => this.onToggleMenu(e)}>
                  <span className="glyphicon glyphicon-remove"></span>
                </a>

                {/* Children Elements (top) */}
                {children && childrenPosition !== 'bottom' ? children : ''}

                {/* Menu List*/}
                <ul className="sectors">
                  {regions && regions.length ? (
                    <li className="sector">
                      <a onClick={e => this.onCategoryClick(e, 'Regions')}>
                        Regions
                        <span className="caret" />
                      </a>
                      <ul className="layers">
                        {regions && regions.length ? (
                          regions.map((region, i) => (
                            <li className={`region ${mapId}`} key={region.name}>
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
                            </li>
                          ))
                        ) : (
                          <li></li>
                        )}
                      </ul>
                    </li>
                  ) : (
                    <li />
                  )}
                  {(categories && categories.length) > 0 ? (
                    categories.map((category, i) => (
                      <li className="sector" key={i}>
                        <a onClick={e => this.onCategoryClick(e, category.category)}>
                          {category.category}
                          <span
                            className={
                              'category glyphicon ' +
                              (this.props.openCategories &&
                              this.props.openCategories.includes(category.category)
                                ? 'glyphicon-chevron-down'
                                : 'glyphicon-chevron-right')
                            }
                          />
                        </a>
                        {this.props.openCategories &&
                        this.props.openCategories.includes(category.category) ? (
                          <Layers
                            layerItem={this.props.layerItem}
                            mapId={mapId}
                            layers={category.layers}
                            currentRegion={currentRegion}
                            preparedLayers={preparedLayers}
                            auth={this.props.AUTH}
                          />
                        ) : (
                          <ul />
                        )}
                      </li>
                    ))
                  ) : (
                    <li></li>
                  )}
                </ul>

                {/* Children Elements (top) */}
                {children && childrenPosition === 'bottom' ? children : ''}
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
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
