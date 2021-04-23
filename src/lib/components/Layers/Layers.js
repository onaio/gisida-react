import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer/Layer';
import { menuGroupHasVisibleLayers } from '../../utils';
import { DATA_NOT_AVAILABLE } from '../../constants';
import { HyperLink } from '../HyperLink/HyperLink';
import { translationHook } from 'gisida';
export class Layers extends Component {
  constructor(props) {
    super(props);
    const groups = {};
    if (this.props.layers) {
      this.props.layers.forEach(layer => {
        if (!layer.id) {
          Object.keys(layer).forEach(l => {
            if (layer[l].layers.length) {
              groups[l] = { isOpen: menuGroupHasVisibleLayers(l, layer[l].layers, this.props.activeLayerIds) };
            } else {
              groups[l] = { isOpen: false };
            }
          });
        }
      });
    }
    this.state = groups;
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.layers) !== JSON.stringify(prevProps.layers)) {
      /** Check if updated children down the hierarchy have
       * layers which are a visible. If so open the group
       */
      this.props.layers.forEach(layer => {
        if (!layer.id) {
          Object.keys(layer).forEach(groupName => {
            const children = layer[groupName].layers;

            if (menuGroupHasVisibleLayers(groupName, children, this.props.activeLayerIds) && !this.state[groupName].isOpen) {
              this.setState({
                [groupName]: { isOpen: true },
              });
            }
          });
        }
      });
    }
  }

  toggleSubMenu(e, layer) {
    e.preventDefault();
    this.setState({
      [layer]: { isOpen: !this.state[layer].isOpen },
    });
  }

  render() {
    const {
      mapId,
      hyperLink,
      sector,
      layers,
      currentRegion,
      preparedLayers,
      auth,
      noLayerText,
      currentLanguage,
      languageTranslations
    } = this.props;
    let layerKeys;
    let layerObj;
    let layerItem = [];
    const subLayerIds = [];
    const ifPermissionDenied = () => {
      return layers.length > 0 ? (
        <p>You don't have permision to view this category</p>
      ) : (
        <p>{noLayerText ? noLayerText : DATA_NOT_AVAILABLE}</p>
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
        (!currentRegion ||
          (preparedLayers[layer.id].region && preparedLayers[layer.id].region === currentRegion)) &&
        !subLayerIds.includes(layer.id) && !(subLayerIds.map(httpLayers => httpLayers.includes(layer.id)).includes(true))
      ) {
        if (layer.id && (!auth || !auth.authConfigs)) {
          layerItem.push(<Layer key={layer.id} mapId={mapId} layer={layer} currentLanguage={currentLanguage}
            languageTranslations={languageTranslations} />);
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
            layerItem.push(<Layer key={layer.id} mapId={mapId} layer={layer} currentLanguage={currentLanguage}
              languageTranslations={languageTranslations} />);
          }
        } else {
          Object.keys(layer).forEach((d, i) => {
            /** get the parent of the  sub category */
            const parent = Object.values(layers.find(l => l[d]))[0].parent;
            const link = hyperLink &&
            hyperLink[`${parent}-${d}`] &&
            hyperLink[`${parent}-${d}`].link;

            const description = hyperLink &&
            hyperLink[`${parent}-${d}`] &&
            hyperLink[`${parent}-${d}`].description;

            const descStyle = !link
              ? {
                  marginLeft: '45px',
                }
              : null;
            layerItem = layerItem.concat([
              <li key={i}>
                <a
                  key={`${d}-${i}-link`}
                  className={
                    hyperLink && hyperLink[`${parent}-${d}`]
                      ? `sub-category hyperlink`
                      : 'sub-category'
                  }
                  onClick={e => this.toggleSubMenu(e, d)}
                >
                  {translationHook(d,languageTranslations, currentLanguage)}
                  <span
                    className={`category glyphicon glyphicon-chevron-${
                      this.state[d].isOpen ? 'down' : 'right'
                    }`}
                  />
                </a>
                {hyperLink && hyperLink[`${parent}-${d}`] ? (
                  <HyperLink
                    link={link}
                    description={description}
                    descriptionStyle={descStyle}
                    spanClassName='sub-category-links'
                  />) : null}
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
                  activeLayerIds={this.props.activeLayerIds}
                  currentLanguage={currentLanguage}
                  languageTranslations={languageTranslations}
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
