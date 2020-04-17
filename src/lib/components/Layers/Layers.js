import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer/Layer';

export class Layers extends Component {
  constructor(props) {
    super(props);
    const groups = {};
    if (this.props.layers) {
      this.props.layers.forEach(layer => {
        if (!layer.id) {
          Object.keys(layer).forEach(l => {
            groups[l] = { isOpen: false };
          });
        }
      });
    }
    this.state = groups;
  }

  componentDidMount() {
    Object.keys(this.state).forEach(l => {
      const children = this.props.layers.filter(obj => obj[l])[0][l].layers;
      this.handleVisibleLayer(l, children);
    });
  }

  toggleSubMenu(e, layer) {
    e.preventDefault();
    this.setState({
      ...this.state,
      [layer]: { isOpen: !this.state[layer].isOpen },
    });
  }

  /**
   * Open the group if any data layer down the nest is visible
   * @param {*} groupName Name of the group which we want to target
   * @param {*} children Children of the group which we want to target
   */
  handleVisibleLayer(groupName, children) {
    const subGroups = children.filter(child => !child.id);
    let groupIsOpen = false; // Flag to help not to continue checking the siblings if an
    // open child subgroup is found

    if (subGroups.length) {
      // If there are subgroups then continue look down
      // the tree
      let i = 0;

      while (!groupIsOpen && i < subGroups.length) {
        const subGroupKey = Object.keys(subGroups[i])[0];
        groupIsOpen = this.handleVisibleLayer(groupName, subGroups[i][subGroupKey].layers);

        i += 1;
      }
    } else {
      const visible = children.filter(child => child.visible);

      if (visible.length) {
        this.setState({
          ...this.state,
          [groupName]: { isOpen: true },
        });

        return true;
      }
    }

    return false;
  }

  render() {
    const { mapId, layers, currentRegion, preparedLayers, auth, noLayerText } = this.props;
    let layerKeys;
    let layerObj;
    let layerItem = [];
    const subLayerIds = [];
    const ifPermissionDenied = () => {
      return layers.length > 0 ? (
        <p>You don't have permision to view this category</p>
      ) : (
        <p>{noLayerText ? noLayerText : 'No layers available'}</p>
      );
    };

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
        (!currentRegion || (layer.region && layer.region === currentRegion)) &&
        !subLayerIds.includes(layer.id)
      ) {
        if (layer.id && (!auth || !auth.authConfigs)) {
          layerItem.push(<Layer key={layer.id} mapId={mapId} layer={layer} />);
        } else if (layer.id && auth) {
          const { authConfigs, userInfo } = auth;
          let activeId = layer.id;
          let users;
          if (activeId.indexOf('.json') !== -1) {
            // layer ids from github shared repo have .json suffix
            // split to remove .json part
            activeId = activeId.split('.')[0];
          }
          // this is a temporary fix
          const LocalAuthConfig = JSON.parse(localStorage.getItem('authConfig'));
          users = authConfigs.LAYERS && authConfigs.LAYERS[activeId]; // list of users with access to the layer
          authConfigs.LAYERS = authConfigs.LAYERS || LocalAuthConfig.LAYERS;
          // users = authConfigs.LAYERS[activeId]; // list of users with access to the layer
          // check if logged in user exists in the list of users
          // who have access to the layer
          if (
            (users && userInfo && users.includes(userInfo.username)) ||
            (authConfigs.LAYERS &&
              authConfigs.LAYERS.ALL &&
              authConfigs.LAYERS.ALL.includes(userInfo.username))
          ) {
            layerItem.push(<Layer key={layer.id} mapId={mapId} layer={layer} />);
          }
        } else {
          Object.keys(layer).forEach((d, i) => {
            layerItem = layerItem.concat([
              <li>
                <a
                  key={`${d}-${i}-link`}
                  className="sub-category"
                  onClick={e => this.toggleSubMenu(e, d)}
                >
                  {d}
                  <span
                    className={`category glyphicon glyphicon-chevron-${
                      this.state[d].isOpen ? 'down' : 'right'
                    }`}
                  />
                </a>
              </li>,
              this.state[d].isOpen ? (
                <Layers
                  key={`${d}-${i}`}
                  mapId={mapId}
                  layers={layer[d].layers}
                  currentRegion={currentRegion}
                  preparedLayers={preparedLayers}
                  auth={this.props.auth}
                  noLayerText={noLayerText}
                />
              ) : null,
            ]);
          });
        }
      }
      return null;
    });

    return <ul className="layers">{layerItem.length > 0 ? layerItem : ifPermissionDenied()}</ul>;
  }
}

Layers.propTypes = {
  mapId: PropTypes.string.isRequired,
  layers: PropTypes.arrayOf(PropTypes.any).isRequired,
  preparedLayers: PropTypes.arrayOf(PropTypes.any),
  currentRegion: PropTypes.string,
  auth: PropTypes.object,
};

export default Layers;
