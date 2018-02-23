/* eslint-disable no-loop-func */
import React from 'react';
import { connect } from 'react-redux';
import './Legend.scss';

const mapStateToProps = (state, ownProps) => {
  let layersObj = [];
  Object.keys(state.MAP.layers).forEach((key) => {
    const layer = state.MAP.layers[key];
    if (layer.visible) {
      layersObj.push(layer);
    }
  });
  return {
    layerObj: state.MAP.layers[state.MAP.activeLayerId],
    layersData: layersObj,
    MAP: state.MAP,
  }
}

class Legend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      setPrimary: false,
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  setPrimaryLayer(e) {
    e.preventDefault();
    const $target = $(e.target).hasClass('legend-row')
      ? $(e.target)
      : $(e.target).parents('.legend-row');
    if ($target.hasClass('primary')) return false;

    // $('.set-primary-layer.primary').removeClass('primary');
    $('.legend-row.primary').removeClass('primary');
    $target.addClass('primary');

    const nextLayerId = $target.data('layer');
    let nextLayerObj = this.props.layersData.find(lo => lo.id === nextLayerId);
    if (!nextLayerObj && this.props.MAP.layers[nextLayerId].layers) {
      let nextLayer;
      for (let l = 0; l < this.props.MAP.layers[nextLayerId].layers.length; l += 1) {
        nextLayer = this.props.MAP.layers[nextLayerId].layers[l];
        nextLayerObj = this.props.layersData.find(lo => lo.id === nextLayer);
        if (nextLayerObj) break;
      }
    }
    if (!nextLayerObj) {
      return false;
    }

    // Move the selected primary layer to the top of the map layers
    if (window.GisidaMap.getLayer(nextLayerId)) {
      window.GisidaMap.moveLayer(nextLayerId);
    }
    let layerObj;
    // Loop throught all active map layers
    for (let i = this.props.layersData.length - 1; i >= 0; i -= 1) {
      layerObj = this.props.layersData[i];
      // If 'layerObj' is not a fill OR the selected primary layer
      if (layerObj.type !== 'fill' && layerObj.id !== nextLayerId) {
        // If 'layerObj' is not the same type as the selected
        if (layerObj.type !== nextLayerObj.type) {
          // Move 'layerObj' to the top of the map layers
          if (window.GisidaMap.getLayer(layerObj.id)) {
            window.GisidaMap.moveLayer(layerObj.id);
          }
        }
      }
    }

    // Re-order this.state.layersObj array
    const nextlayersObj = this.props.layersData.filter(lo => lo.id !== nextLayerId);
    nextlayersObj.push(nextLayerObj);

    this.setState({
      setPrimary: true,
    });
    return true;
  }

  render() {
    const mapId = '01';
    const { layerObj } = this.props;
    if (!layerObj) {
      return false;
    }
    let shapesArr = [];
    const legendItems = [];
    const circleLayer = (layerObj && layerObj.credit && layerObj.type === 'circle' && !layerObj.categories.shape && layerObj.visible);
    const classKeys = ["sm", "md", "lg"];

    for (let c = 0; c < classKeys.length; c += 1) {
      shapesArr.push((
        <span
          className={`circle-${classKeys[c]}`}
          style={{ background: circleLayer ? layerObj.categories.color : ' none' }}
          key={classKeys[c]}
        >
        </span>
      ));
    }

    let primaryLegend;
    let layer;

    for (let l = 0; l < this.props.layersData.length; l += 1) {
      layer = this.props.layersData[l];

      const circleLayerType = (layer && layer.credit && layer.type === 'circle' && !layer.categories.shape && layer.visible);
      const symbolLayer = (layer && layer.credit && layer.categories.shape && layer.type !== 'circle');
      const fillLayerNoBreaks = (layer && layer.credit && layer.categories.breaks === 'no');
      const fillLayerWithBreaks = (layer && layer.credit && layer.type !== 'chart');
      const activeLayerSelected = layerObj.id === layer.id ? 'primary' : '';
      if (layerObj.id === layer.id) {
        primaryLegend = (
        <div
          id={`legend-${layer.id}-${mapId}`}
          className={`legend-shapes legend-row ${activeLayerSelected}`}
          data-layer={`${layer.id}`}
        >
          <b>
            {layer.label}
          </b>
          <div className="legend-symbols">
            {shapesArr}
          </div>
          <span>{layer.credit}</span>
        </div>);
        continue;
      }
      if (circleLayerType) {
        legendItems.unshift((
          <div
            id={`legend-${layer.id}-${mapId}`}
            className={`legend-shapes legend-row ${activeLayerSelected}`}
            data-layer={`${layer.id}`}
            onClick={(e) => this.setPrimaryLayer(e)}
          >
            <b>
              {layer.label}
            </b>
            <div className="legend-symbols">
              {shapesArr}
            </div>
            <span>{layer.credit}</span>
          </div>
        ));
      } else if (symbolLayer) {

      } else if (fillLayerNoBreaks) {

      } else if (fillLayerWithBreaks) {

      }
        else {
      }
    }

    legendItems.unshift(primaryLegend);

    return (
      <div>
        <div className={`legend ${mapId}`}>
          {legendItems}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Legend);
