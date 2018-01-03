import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import './StyleSelector.scss';


const mapStateToProps = (state, ownProps) => {
  return {
    style: 'mapbox://styles/mapbox/satellite-v9',
    styles: state.STYLES
  }
}

class StyleSelector extends Component {

  changeStyle = () => {

  }

  render() {
    const style = this.props.syle;
    const styles = this.props.styles;
    return (
      <div className="leaflet-left leaflet-top leaflet-right layer-selector">
        <div aria-haspopup="true" className="leaflet-control leaflet-control-layers">
          <a title="styles" className="leaflet-control-layers-toggle"> </a>
          <form className="leaflet-control-layers-list">
            <div className="leaflet-control-layers-base">
              {(style && styles.length) ?
                styles.map(b =>
                  (<label key={`label_${b.label}`} htmlFor="styles">
                    <input
                      readOnly
                      key={`input_${b.label}`}
                      type="radio"
                      name="leaflet-base-layers"
                      className="leaflet-control-layers-selector"
                      value={b.style}
                      onClick={e => this.changeStyle(e.target.value)}
                      checked={style === b.style}
                    />
                    <span>{b.label}</span>
                  </label>)) : <span />}
            </div>
            <div className="leaflet-control-layers-overlays" />
          </form>
        </div>
      </div>)
  }
}

StyleSelector.propTypes = {
  styles: PropTypes.arrayOf(PropTypes.any).isRequired,
  style: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(StyleSelector);
