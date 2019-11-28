import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer/Layer';
import { connect } from 'react-redux';
import { Actions } from 'gisida';

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

export class Layers extends Component {
  toggleSubMenu(e, layer) {
    e.preventDefault();
    const { openGroups } = this.props;
    const index = openGroups.indexOf(layer);
    this.props.dispatch(Actions.toggleGroups(this.props.mapId, layer, index));
  }

  render() {
    const { mapId, layers, currentRegion, preparedLayers } = this.props;

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
        (!currentRegion || (layer.region && layer.region === currentRegion)) &&
        !subLayerIds.includes(layer.id)
      ) {
        if (layer.id) {
          if (this.props.layerItem) {
            const CustomLayerItem = this.props.layerItem;

            layerItem.push(<CustomLayerItem key={layer.id} mapId={mapId} layer={layer} />);
          } else {
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
                      this.props.openGroups && this.props.openGroups.includes(d) ? 'down' : 'right'
                    }`}
                  />
                </a>
              </li>,
              this.props.openGroups && this.props.openGroups.includes(d) ? (
                <Layers
                  layerItem={this.props.layerItem}
                  key={`${d}-${i}`}
                  mapId={mapId}
                  layers={layer[d].layers}
                  currentRegion={currentRegion}
                  preparedLayers={preparedLayers}
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

Layers.propTypes = {
  mapId: PropTypes.string.isRequired,
  layers: PropTypes.arrayOf(PropTypes.any).isRequired,
  currentRegion: PropTypes.string,
};

export default connect(mapStateToProps)(Layers);
