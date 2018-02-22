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
  }
}

class Legend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      setPrimary: true,
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  onSetPrimaryClick(e) {
    // e.preventDefault();
    this.setState({
      setPrimary: !this.state.setPrimary,
    });
  }

  render() {
    const mapId = '01';
    const { layerObj } = this.props;
    if (!layerObj) {
      return false;
    }
    let shapesArr = [];
    const legendItems = [];
    const circleType = (layerObj && layerObj.credit && layerObj.type === 'circle' && !layerObj.categories.shape && layerObj.visible);
    const classKeys = ["sm", "md", "lg"];

    for (let c = 0; c < classKeys.length; c += 1) {
      shapesArr.push((
        <span
          className={`circle-${classKeys[c]}`}
          style={{ background: circleType ? layerObj.categories.color : ' none' }}
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
      const activeLayerSelected = layerObj.id === layer.id ? 'primary' : '';
      // const setPrimaryLayer = this.state.setPrimary ? activeLayerSelected : '';
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
      } else {
      }
    }

    legendItems.unshift(primaryLegend);

    return (
      <div>
        <div className={`legend ${mapId}`} onClick={(e) => this.onSetPrimaryClick(e)}>
          {legendItems}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Legend);
