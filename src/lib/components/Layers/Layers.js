import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer/Layer';

export class Layers extends Component {
  constructor(props) {
    super(props);
    const groups = {};
    if (this.props.layers) {
      this.props.layers.forEach((layer) => {
        if (!layer.id) {
          Object.keys(layer).forEach((l) => {
            groups[l] = { isOpen: false };
          });
        }
      })
    }
    this.state = groups;
  }

  toggleSubMenu(e, layer) {
    e.preventDefault();
    this.setState({
      ...this.state,
      [layer]: { isOpen: !this.state[layer].isOpen },
    });
  }

  render() {
    const { mapId, layers, currentRegion, preparedLayers, auth } = this.props;
    let layerKeys;
    let layerObj;
    let layerItem = [];
    const subLayerIds = [];

    const ifPermissionDenied = () => {
      return layers.length > 0 ? 
      (<p>You don't have permision to view this category</p>) :
       (<p>No layers available</p>);
    }

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

    layers.forEach((layer) => {
      if ((!currentRegion
        || (layer.region
          && layer.region === currentRegion))
        && !subLayerIds.includes(layer.id)) {
        if (layer.id && !auth) {
          layerItem.push((<Layer
            key={layer.id}
            mapId={mapId}
            layer={layer}
          />))
        } else if (layer.id && auth) {
          const { authConfigs, userInfo } = auth;
          let activeId = layer.id;
          let users;
          if (activeId.indexOf('.json') !== -1) {
            // layer ids from github shared repo have .json suffix
            // split to remove .json part
            activeId = activeId.split('.')[0];
          }

          users = authConfigs.LAYERS[activeId]; // list of users with access to the layer
          // check if logged in user exists in the list of users
          // who have access to the layer
          if ((users
            && userInfo
            && users.includes(userInfo.username))
            || (authConfigs.LAYERS
              && authConfigs.LAYERS.ALL
              && authConfigs.LAYERS.ALL.includes(userInfo.username))) {
            layerItem.push((<Layer
              key={layer.id}
              mapId={mapId}
              layer={layer}
            />))
          }
        } else {

          Object.keys(layer).forEach((d, i) => {
            layerItem = layerItem.concat([
              (<li>
                <a
                  key={`${d}-${i}-link`}
                  className="sub-category"
                  onClick={(e) => this.toggleSubMenu(e, d)}
                >
                  {d}
                  <span
                    className={`category glyphicon glyphicon-chevron-${this.state[d].isOpen ? 'down' : 'right'}`}
                  />
                </a>
              </li>),
              (this.state[d].isOpen ?
                  <Layers
                    key={`${d}-${i}`}
                    mapId={mapId}
                    layers={layer[d].layers}
                    currentRegion={currentRegion}
                    preparedLayers={preparedLayers}
                    auth={this.props.auth}
                  />
              : null)
            ]);
          });
        }
      }
      return null;
    });

    return (
      <ul className="layers">
        { layerItem.length > 0 ? layerItem :  ifPermissionDenied() }
      </ul>
    );
  }
}

Layers.propTypes = {
  mapId: PropTypes.string.isRequired,
  layers: PropTypes.arrayOf(PropTypes.any).isRequired,
  currentRegion: PropTypes.string,
};

export default Layers;
