/* eslint-disable no-loop-func */
import React from 'react';
import { connect } from 'react-redux';
import { Actions } from 'gisida'
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
    primaryLayer: state.MAP.primaryLayer,
  }
}

class Legend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      setPrimary: false,
    };
  }

  onUpdatePrimaryLayer(e) {
    e.preventDefault();
    const dispatch = this.props.dispatch;
    const targetLayer = e.currentTarget.getAttribute('data-layer');
    // dispatch primary layer id
    dispatch(Actions.updatePrimaryLayer(targetLayer));
  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    const mapId = '01';
    const { layerObj } = this.props;
    if (!layerObj) {
      return false;
    }
    let shapesArr = [];
    const legendItems = [];

    let primaryLegend;
    let layer;

    for (let l = 0; l < this.props.layersData.length; l += 1) {
      layer = this.props.layersData[l];
      const classKeys = ["sm", "md", "lg"];
      const circleLayerType = (layer && layer.credit && layer.type === 'circle' && !layer.categories.shape && layer.visible);
      const symbolLayer = (layer && layer.credit && layer.categories.shape && layer.type !== 'circle');
      const fillLayerNoBreaks = (layer && layer.credit && layer.categories.breaks === 'no');
      const fillLayerWithBreaks = (layer && layer.credit && layer.type !== 'chart');
      const activeLayerSelected =  this.props.primaryLayer === layer.id ? 'primary' : '';

      for (let c = 0; c < classKeys.length; c += 1) {
        shapesArr.push((
          <span
            className={`circle-${classKeys[c]}`}
            style={{ background: circleLayerType ? layer.categories.color : ' none' }}
            key={classKeys[c]}
          >
          </span>
        ));
      }

      if (layerObj.id === layer.id) {
        primaryLegend = (
        <div
          id={`legend-${layer.id}-${mapId}`}
          className={`legend-shapes legend-row ${activeLayerSelected}`}
          data-layer={`${layer.id}`}
          onClick={(e) => this.onUpdatePrimaryLayer(e)}
          key={l}
        >
          <b>
            {layer.label}
          </b>
          <div className="legend-symbols">
          <span
            className="circle-sm"
            style={{ background: layer.categories.color }}
          >
          </span>
          <span
            className="circle-md"
            style={{ background: layer.categories.color }}
          >
          </span>
          <span
            className="circle-lg"
            style={{ background: layer.categories.color }}
          >
          </span>
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
            key={l}
            onClick={(e) => this.onUpdatePrimaryLayer(e)}
          >
            <b>
              {layer.label}
            </b>
            <div className="legend-symbols">
              <span
                className="circle-sm"
                style={{ background: layer.categories.color }}
              >
              </span>
              <span
                className="circle-md"
                style={{ background: layer.categories.color }}
              >
              </span>
              <span
                className="circle-lg"
                style={{ background: layer.categories.color }}
              >
              </span>
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
