/**
 * Handle display of submenu and layer items by utilizing redux state.
 * Keeps track of open submenus in redux state
 *
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer/Layer';
import { connect } from 'react-redux';
import { Actions } from 'gisida';
import { menuGroupHasVisibleLayers } from '../../utils';
const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId];
  const { mapId, layers, currentRegion, preparedLayers } = ownProps;
  return {
    openGroups: MAP.openGroups,
    mapId,
    layers,
    currentRegion,
    preparedLayers,
  };
};
export class ConnectedLayers extends Component {
  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.layers) !== JSON.stringify(prevProps.layers)) {
      /** Check if updated children down the hierarchy have
       * layers which are a visible. If so open the group
       */
      this.props.layers.forEach(layer => {
        if (!layer.id) {
          Object.keys(layer).forEach(groupName => {
            const children = layer[groupName].layers;
            const parent = layer[groupName].parent;
            if (
              !this.isGroupOpen(groupName, parent) &&
              menuGroupHasVisibleLayers(groupName, children)
            ) {
              this.toggleGroup(groupName, parent);
            }
          });
        }
      });
    }
  }
  /**
   * Toggle open and close a menu group
   * @param {Object} e Event
   * @param {string} layer layer to be toggled
   * @param {string} parent parent of layer to be toggled
   */
  toggleSubMenu(e, layer, parent) {
    e.preventDefault();
    this.toggleGroup(layer, parent);
  }
  /**
   * @param {string} layer layer to be toggled
   * @param {string} parent parent of layer to be toggled
   */
  toggleGroup(layer, parent) {
    const { openGroups } = this.props;
    let index = -1;
    let i = 0;
    let found = false;
    while (!found && i < openGroups.length) {
      if (openGroups[i].parent === parent && openGroups[i].group === layer) {
        index = i;
        found = true;
      }
      i += 1;
    }
    this.props.dispatch(Actions.toggleGroups(this.props.mapId, layer, index, false, parent));
  }

  /**
   * Get the group open state
   * @param {string} groupName name of the group
   * @param {string} parent parent of the group
   * @returns {boolean} Whether the group is open or not
   */
  isGroupOpen(groupName, parent) {
    return (
      this.props.openGroups &&
      this.props.openGroups.filter(group => group.parent === parent && group.group === groupName)
        .length
    );
  }
  render() {
    const { mapId, layers, currentRegion, preparedLayers, auth, hyperLink } = this.props;
    let layerKeys;
    let layerObj;
    let layerItem = [];
    const subLayerIds = [];
    if (!preparedLayers) {
      return false;
    }
    layerKeys = Object.keys(preparedLayers);
    for (let lo = 0; lo < layerKeys.length; lo += 1) {
      layerObj = this.props.preparedLayers[layerKeys[lo]];
      if (layerObj.layers) {
        for (let s = 0; s < layerObj.layers.length; s += 1) {
          subLayerIds.push(layerObj.layers[s]);
        }
      }
    }
    layers.forEach(layer => {
      if (
        (!currentRegion ||
          (preparedLayers[layer.id].region && preparedLayers[layer.id].region === currentRegion)) &&
        !subLayerIds.includes(layer.id)
      ) {
        if (layer.id && (!auth || !auth.authConfigs)) {
          if (this.props.layerItem) {
            const CustomLayerItem = this.props.layerItem;
            layerItem.push(<CustomLayerItem key={layer.id} mapId={mapId} layer={layer} />);
          } else {
            layerItem.push(<Layer key={layer.id} mapId={mapId} layer={layer} />);
          }
        } else if (layer.id && auth) {
          const { authConfigs, userInfo } = auth;
          let activeId = layer.id;
          let users;
          if (activeId.indexOf('.json') !== -1) {
            // layer ids from github shared repo have .json suffix
            // split to remove .json part
            activeId = activeId.split('.')[0];
          }
          const LocalAuthConfig = JSON.parse(localStorage.getItem('authConfig'));
          users = authConfigs.LAYERS && authConfigs.LAYERS[activeId]; // list of users with access to the layer
          authConfigs.LAYERS = authConfigs.LAYERS || LocalAuthConfig.LAYERS;
          users = authConfigs.LAYERS[activeId];
          // list of users with access to the layer
          // check if logged in user exists in the list of users
          // who have access to the layer
          if (
            (users && userInfo && users.includes(userInfo.username)) ||
            (authConfigs.LAYERS &&
              authConfigs.LAYERS.ALL &&
              authConfigs.LAYERS.ALL.includes(userInfo.username))
          ) {
            if (this.props.layerItem) {
              const CustomLayerItem = this.props.layerItem;
              layerItem.push(<CustomLayerItem key={layer.id} mapId={mapId} layer={layer} />);
            } else {
              layerItem.push(<Layer key={layer.id} mapId={mapId} layer={layer} />);
            }
          }
        } else {
          Object.keys(layer).forEach((d, i) => {
            const parent = Object.values(layers.find(l => l[d]))[0].parent;
            const descStyle =  !(hyperLink && hyperLink[`${parent} ${d}`] &&
             hyperLink[`${parent} ${d}`] && hyperLink[`${parent} ${d}`].link) ?
             {
              marginLeft: "45px"
             } : null;
            layerItem = layerItem.concat([
              <li>
                <a
                  key={`${d}-${i}-link`}
                  className={
                    hyperLink && hyperLink[`${parent} ${d}`]
                      ? `sub-category hyperlink`
                      : 'sub-category'
                  }
                  onClick={e => this.toggleSubMenu(e, d, layer[d].parent)}
                >
                  {d}
                  <span
                    className={`category glyphicon glyphicon-chevron-${
                      this.isGroupOpen(d, layer[d].parent) ? 'down' : 'right'
                    }`}
                  />
                </a>
                {hyperLink && hyperLink[`${parent} ${d}`] ? (
                  <span className="sub-category-links">
                    { hyperLink && hyperLink[`${parent} ${d}`] &&
                     hyperLink[`${parent} ${d}`].link ? (<a
                      href={hyperLink[`${parent} ${d}`] && hyperLink[`${parent} ${d}`].link}
                      target="_blank"
                      className="glyphicon glyphicon-list-alt hyperlink"
                    ></a>) : null}
                    {hyperLink[`${parent} ${d}`] && hyperLink[`${parent} ${d}`].description ? (
                      <div className="description" style={descStyle}>
                        <span className="glyphicon glyphicon-info-sign" />
                        <p>
                          {hyperLink[`${parent} ${d}`] && hyperLink[`${parent} ${d}`].description}
                        </p>
                      </div>
                    ) : (
                      ''
                    )}
                  </span>
                ) : null}
              </li>,
              this.isGroupOpen(d, layer[d].parent) ? (
                <ConnectedLayers
                  openGroups={this.props.openGroups}
                  dispatch={this.props.dispatch}
                  layerItem={this.props.layerItem}
                  key={`${d}-${i}`}
                  mapId={mapId}
                  layers={layer[d].layers}
                  currentRegion={currentRegion}
                  preparedLayers={preparedLayers}
                  auth={this.props.auth}
                  hyperLink={hyperLink}
                />
              ) : null,
            ]);
          });
        }
      }
      return null;
    });
    return <ul className="layers">{layerItem}</ul>;
  }
}
ConnectedLayers.propTypes = {
  mapId: PropTypes.string.isRequired,
  layers: PropTypes.arrayOf(PropTypes.any).isRequired,
  preparedLayers: PropTypes.arrayOf(PropTypes.any),
  currentRegion: PropTypes.string,
  auth: PropTypes.object,
};
export default connect(mapStateToProps)(ConnectedLayers);
