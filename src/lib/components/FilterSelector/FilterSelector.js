import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions, prepareLayer  } from 'gisida';

require('./FilterSelector.scss');

const mapStateToProps = (state, ownProps) => {
  const layers = state.MAP.layers;
  let layerObj;
  // Get visible layer 
  Object.keys(layers).forEach((key) => {
    const layer = layers[key];
    if (layer.filterOptions && layer.visible) {
      layerObj = layer;
    }
  });

  // Set layer to undefined of layer is fro diffrent region
  const currentRegion = state.REGIONS.filter(region => region.current)[0];
  layerObj = (layerObj && layerObj.region === currentRegion.name) ? layerObj : undefined;
  return {
    layerObj: layerObj
  }
}

class FilterSelector extends React.Component {

  filterData = (filterOptions) => {
    const dispatch = this.props.dispatch;
    const layer = this.props.layerObj;
    window.GisidaMap.removeLayer(layer.id);
    window.GisidaMap.removeSource(layer.id);
    // // dispach prepare layer if layer data  has not been loaded into props
      prepareLayer(layer, dispatch, filterOptions);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.layerObj && nextProps.layerObj.filterOptions) {
      let filterOptions = nextProps.layerObj.filterOptions.map((opt) => {
        const optVal = {};
        optVal[opt] = true;
        return optVal;
      });
      if (this.state && this.state.options) {
        filterOptions = filterOptions.concat([this.state.options]);
      }
      this.setState({ options: Object.assign.apply(this, filterOptions) });
    } else this.setState({ options: {} });
  }

  updateOptions(val) {
    const options = this.state.options;
    options[val] = !options[val];
    this.setState({ options });
    this.filterData(options);
  }

  render() {
    if (this.state && this.state.options) {
      return (
        <nav id="filter-group" className="filter-group">
          {Object.keys(this.state.options).map(val =>
            (<span key={`label_${val}`}>
              <input
                type="checkbox"
                id={val}
                key={`input_${val}`}
                value={val}
                onChange={(e) => {
                  this.updateOptions(e.target.value);
                }}
                checked={this.state.options[val]}
              />
              <label htmlFor={val} key={`label_${val}`}>
                {val}
              </label>
            </span>))
          }
        </nav>
      );
    }
    return (<nav />);
  }
}

FilterSelector.propTypes = {
  layerObj: PropTypes.objectOf(PropTypes.any),
};

FilterSelector.defaultProps = {
  layerObj: {},
};


export default connect(mapStateToProps)(FilterSelector);
