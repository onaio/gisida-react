import React from 'react';
import PropTypes from 'prop-types';
import { Actions } from 'gisida';

require('./FilterSelectorPrev.scss');

class FilterSelectorPrev extends React.Component {
  constructor(props) {
    super(props);
    const { layerObj } = this.props;
    const filterOptionMapper = (opt, i) => {
      const optVal = {};
      optVal[opt] = true;
      return optVal;
    }
    let filterOptions = {};

    if (layerObj && layerObj.filterOptions) {
      filterOptions = Array.isArray(layerObj.filterOptions)
        ? layerObj.filterOptions.map((opt) => {
          const optVal = {};
          optVal[opt] = true;
          return optVal;
        })
        : Object.assign({}, layerObj.filterOptions);

      if (Array.isArray(layerObj.filterOptions)) {
        filterOptions = Object.assign.apply(this, filterOptions);
      }
    } else {
      filterOptions = {};
    }

    this.state = {
      options: filterOptions,
    };

    this.updateOptions = this.updateOptions.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { layerObj } = nextProps;
    let filterOptions;

    if (layerObj && layerObj.filterOptions) {
      filterOptions = Array.isArray(layerObj.filterOptions)
        ? layerObj.filterOptions.map((opt) => {
          const optVal = {};
          optVal[opt] = true;
          return optVal;
        })
        : Object.assign({}, layerObj.filterOptions);

      if (Array.isArray(layerObj.filterOptions)) {
        if (this.state && this.state.options) {
          filterOptions = filterOptions.concat([this.state.options]);
        }
        filterOptions = Object.assign.apply(this, filterOptions);
      }
    } else {
      filterOptions = {};
    }

    this.setState({ options: filterOptions });
  }

  updateOptions(val) {
    const { layerObj, mapId } = this.props;
    const options = this.state.options;
    options[val] = !options[val];
    this.props.dispatch(Actions.saveFilterOptions(mapId, options));
    // this.props.dispatch(Actions.addLayer(mapId, layerObj));
  }

  render() {
    if (this.state && this.state.options) {
      return (
        <nav id="filter-group" className="filter-group">
          {Object.keys(this.state.options).map((val, i) => {
            // val = (Object.keys(f))[0];
            return (
              <span key={`label_${val}`}>
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
              </span>
            );
            })
          }
        </nav>
      );
    }
    return (<nav />);
  }
}

FilterSelectorPrev.propTypes = {
  filterData: PropTypes.func.isRequired,
  layerObj: PropTypes.objectOf(PropTypes.any),
};

FilterSelectorPrev.defaultProps = {
  layerObj: {},
};

export default FilterSelectorPrev;
