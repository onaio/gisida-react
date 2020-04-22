import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'gisida';
import Layers from '../Layers/Layers';
import ConnectedLayers from '../Layers/ConnectedLayers';
import './Menu.scss';
import _ from 'lodash';
import memoize from 'memoize-one';
import { getMenuGroupVisibleLayers } from '../../utils';

const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId] || { layers: {} };
  const { LAYERS, AUTH, APP, VIEW } = state;
  let categories;
  // let layers;
  const { NULL_LAYER_TEXT } = APP;
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
    menuScroll: MAP.menuScroll, // Set's scroll position to zero when loading superset Menu component
    showMap: VIEW.showMap, // A flag to determine map/superset view
    noLayerText: NULL_LAYER_TEXT, // Text to be displayed when a category has no layer pulled from config file
  };
};

class Menu extends Component {
  constructor(props) {
    super(props);
    /**
     * Currently we can load two menus one for superset view at layer level & one for map view
     * The menu menuWrapper references the menu on which to track scroll position.
     * This ensures we snap back to the exact map scroll position when moving from superset
     * layer view to map view
     */
    this.menuWrapper = React.createRef();
    /**
     * Gets scroll position after scroll ceases
     */
    this.delayedMenuScrollCallback = _.debounce(this.persistScrollPosition, 1000);
    this.state = {
      URLLayersHandled: [], // layers from URL that have their category open
      openCategoriesFromURL: [], // Categories opened when component mounts because
      // at least one layer under that category is in URL
    };
  }

  componentDidMount() {
    if (this.menuWrapper && this.menuWrapper.current && this.props.menuScroll) {
      this.menuWrapper.current.scrollTop = this.props.menuScroll.scrollTop;
    }
  }
  persistScrollPosition(event) {
    let element = event.target;
    this.props.dispatch(Actions.setMenuScroll(this.props.mapId, element.scrollTop));
  }

  handleScroll = event => {
    event.persist(); // This will ensure that the event is not pooled for more details https://reactjs.org/docs/events.html
    this.delayedMenuScrollCallback(event);
  };

  componentDidUpdate(prevProps) {
    if (this.props.showMap && this.props.showMap !== prevProps.showMap && this.props.menuScroll) {
      this.menuWrapper.current.scrollTop = this.props.menuScroll.scrollTop;
    }

    const splitURL = window.location.href.split('&')[0].split('?layers=');
    const URLLayers = splitURL[1] && splitURL[1].split(',');

    if (URLLayers) {
      const { URLLayersHandled } = this.state;

      if (
        URLLayers.length !== URLLayersHandled.length &&
        !_.isEqual(prevProps.categories, this.props.categories)
      ) {
        this.openCategoriesFromURL(URLLayers);
      }
    }
  }

  /**
   * Open a category with a visible layer which is in the URL when component mounts
   */
  openCategoriesFromURL(URLLayers) {
    if (URLLayers && this.props.categories) {
      const { URLLayersHandled, openCategoriesFromURL } = this.state;
      const unHandledURLLayers = URLLayers.filter(l => URLLayersHandled.indexOf(l) === -1);
      unHandledURLLayers.forEach(unHandledURLLayer => {
        this.props.categories.forEach(category => {
          if (openCategoriesFromURL.indexOf(category.category) < 0) {
            /**
             * Make sure we do not add a category more than once since multiple
             * layers from URL can share a category
             */
            category.layers.forEach(layer => {
              if (!layer.id) {
                /**
                 * This is a group. So continue checking down the hierarchy
                 * for visible layers
                 */
                Object.keys(layer).forEach(groupName => {
                  const children = layer[groupName].layers;
                  const visibleLayers = getMenuGroupVisibleLayers(groupName, children);

                  if (visibleLayers.indexOf(`${unHandledURLLayer}.json`) >= 0) {
                    // Mark the unhandled URL layer as handled
                    this.handleURLLayer(category.category, unHandledURLLayer);
                  }
                });
              } else {
                // This category has one level only
                const layerIdNoExt = layer.id.replace('.json', '');

                if (layerIdNoExt === unHandledURLLayer && layer.visible) {
                  // Mark the unhandled URL layer as handled
                  this.handleURLLayer(category.category, unHandledURLLayer);
                }
              }
            });
          }
        });
      });
    }
  }

  /**
   * Handle the process of marking a layer from URL as handled
   */
  handleURLLayer(categoryName, unHandledURLLayer) {
    const { openCategories } = this.props;
    const index = openCategories.indexOf(categoryName);

    this.props.dispatch(Actions.toggleCategories(this.props.mapId, categoryName, index));
    this.setState({
      openCategoriesFromURL: [...this.state.openCategoriesFromURL, categoryName],
    });
    this.setState({
      URLLayersHandled: [...this.state.URLLayersHandled, unHandledURLLayer],
    });
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
   * Modify a group by giving its group and nested groups a count (or ID)
   * This will make sure when we toggle a group, another group with the
   * exact same name is not toggled. The array of open groups is stored as an
   * array of group names in the store. Another implementaion would to give each group a random number but
   * this means different menu instances will have groups that have different Ids which we do not
   * want (We would like menu instances under the same map ID to behave the same. If say I open a group in one
   * menu, it should appear open in another other). A contigous int counter is
   * therefore used to ensure the counter for a group in different menu instances is the same,
   * and also, groups in the same menu instances do not share a count.
   * @param {Object} layer Category layer
   * @param {number} groupCounter Group counter (or ID) that will give each group a number
   * @returns {Object} Modified layer and current group counter increment
   */
  insertGroupCount(layer, groupCounter) {
    Object.keys(layer).forEach(key => {
      layer[key].count = groupCounter;
      groupCounter += 1;

      layer[key].layers.forEach(keyLayer => {
        if (!keyLayer.id) {
          // Layer has no id so this is a group
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
   * Generic function to modify categories. If you need to modify/extend categories,
   * do it here
   * @param {array} categories Menu categories and their subgroups and layers
   * @returns {array} Extended/Modified categories
   */
  parseCategories = memoize(categories => {
    let groupCounter = 0;
    categories.forEach(category => {
      category.layers.forEach(layer => {
        if (!layer.id) {
          // Layer has no id, so it's a group, give it a count (or an ID)
          const obj = this.insertGroupCount(layer, groupCounter);
          layer = obj.layer;
          groupCounter = obj.groupCounter;
        }
      });
    });

    return categories;
  });

  /**
   * Check if a user has permission to access layer
   * @param {Object} authConfigs - Authentication configurations
   * @param {Object} userInfo - User details
   */
  canAccessLayer(layer, authConfigs, userInfo) {
    const LocalAuthConfig = JSON.parse(localStorage.getItem('authConfig'));
    // list of users with access to the layer
    const users = authConfigs && authConfigs.LAYERS && authConfigs.LAYERS[layer.id];
    authConfigs.LAYERS = authConfigs.LAYERS || LocalAuthConfig.LAYERS;

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
   * @param {Object} layer - Group layer
   * @param {Object} authConfigs - Authentication configurations
   * @param {Object} userInfo - Auth user details
   */
  getAccessibleGroupLayer(layer, authConfigs, userInfo) {
    const layerKeys = Object.keys(layer);
    const accessibleKeys = [];

    layerKeys.forEach(key => {
      const accessibleKeySubLayers = [];

      layer[key].layers.forEach(subLayer => {
        if (!subLayer.id) {
          const groupSubLayer = this.getAccessibleGroupLayer(subLayer, authConfigs, userInfo);

          if (groupSubLayer) {
            accessibleKeySubLayers.push(groupSubLayer);
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

    layerKeys.forEach(key => {
      if (!accessibleKeys.includes(key) && layer[key].layers.length) {
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
  getAccessibleCategories = memoize(categories => {
    if (!this.props.AUTH) {
      // If no authenitcation, then all categories are accessible.
      return categories;
    }

    const filteredCategories = [];
    const { userInfo, authConfigs } = this.props.AUTH;
    categories.forEach(category => {
      let accesibleLayers = [];

      category.layers.forEach(layer => {
        if (!authConfigs || !authConfigs.LAYERS) {
          // If auth exists but authconfigs have not loaded. Bug should be fixed from ONA data and gisida core
          accesibleLayers.push(layer);
        } else if (!layer.id) {
          const groupLayer = this.getAccessibleGroupLayer(layer, authConfigs, userInfo);

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

    return filteredCategories;
  });

  render() {
    if (!this.props.categories) return null;
    const { disableDefault } = this.props;

    if (disableDefault) return this.props.children || null;

    const { mapId } = this.props;
    const children = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, { mapId });
    });
    const categories = this.parseCategories(this.getAccessibleCategories(this.props.categories));
    const {
      regions,
      currentRegion,
      preparedLayers,
      childrenPosition,
      layerItem,
      hasNavBar,
      useConnectedLayers,
      AUTH,
    } = this.props;
    const childrenPositionClass = childrenPosition || 'top';
    const marginTop = hasNavBar ? '-80px' : 0;

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
              {/* Open menu button */}
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
                        this.props.openCategories.includes(category.category) &&
                        !useConnectedLayers ? (
                          <Layers
                            mapId={mapId}
                            layers={category.layers}
                            currentRegion={currentRegion}
                            preparedLayers={preparedLayers}
                            auth={AUTH}
                          />
                        ) : this.props.openCategories &&
                          this.props.openCategories.includes(category.category) &&
                          useConnectedLayers ? (
                          <ConnectedLayers
                            layerItem={layerItem}
                            mapId={mapId}
                            layers={category.layers}
                            currentRegion={currentRegion}
                            preparedLayers={preparedLayers}
                            auth={AUTH}
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
  categories: PropTypes.arrayOf(PropTypes.any).isRequired,
  hasNavBar: PropTypes.bool, // Pass true if app has a navbar
  layerItem: PropTypes.element, // Custom layer list item. Use in place of components/Layer/Layer
  useConnectedLayers: PropTypes.bool, // If true, use components/Layers/ConnectedLayers
};

export default connect(mapStateToProps)(Menu);
