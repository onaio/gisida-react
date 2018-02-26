import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { Actions } from 'gisida';
import './StyleSelector.scss';


const mapStateToProps = (state, ownProps) => {
  
  return {
    styles: state.STYLES,
    MAP: state.MAP
  }
}

class StyleSelector extends Component {

  changeStyle = (e) => {
    const style = e.target.value;
    this.props.dispatch(Actions.changeStyle(style));
  }

  render() {
    const styles = this.props.styles;
    return (
      <div className="leaflet-left leaflet-top leaflet-right layer-selector" style={{ right: this.props.MAP.showFilterPanel ? '250px' : '0'}}>
        <div aria-haspopup="true" className="leaflet-control leaflet-control-layers">
          <a title="styles" className="leaflet-control-layers-toggle"> </a>
          <form className="leaflet-control-layers-list">
            <div className="leaflet-control-layers-base">
              {(styles && styles.length > 0) ?
                styles.map(s =>
                  (<label key={`label_${s.label}`} htmlFor="styles">
                    <input  
                      readOnly
                      key={`input_${s.label}`}
                      type="radio"
                      name="leaflet-base-layers"
                      className="leaflet-control-layers-selector"
                      value={s.url}
                      onClick={e => this.changeStyle(e)}
                      checked={!!s.current}
                    />
                    <span>{s.label}</span>
                  </label>)) : <span>No available styles</span>
              }
            </div>
            <div className="leaflet-control-layers-overlays" />
          </form>
        </div>
      </div>)
  }
}

StyleSelector.propTypes = {
  styles: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default connect(mapStateToProps)(StyleSelector);
