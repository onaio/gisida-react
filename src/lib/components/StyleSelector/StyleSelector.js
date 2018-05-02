import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { Actions } from 'gisida';
import './StyleSelector.scss';


const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId] || {}
  return {
    MAP,
    styles: state.STYLES,
    showFilterPanel: MAP.showFilterPanel
  }
}

export class StyleSelector extends Component {

  changeStyle = (e) => {
    const style = e.target.value;
    this.props.dispatch(Actions.changeStyle(this.props.mapId, style));
  }

  render() {
    const { styles, mapId } = this.props;
    const sidebarOffset = '0';
    
    return (
      <div className="leaflet-left leaflet-top leaflet-right layer-selector" style={{ right: sidebarOffset }}>
        <div aria-haspopup="true" className="leaflet-control leaflet-control-layers">
          <a title="styles" className="leaflet-control-layers-toggle"> </a>
          <form className="leaflet-control-layers-list">
            <div className="leaflet-control-layers-base">
              {(styles && styles.length > 0) ?
                styles.map(s =>
                  (<label key={`label_${s.label}-${this.props.mapId}`} htmlFor={`${s.label}-${this.props.mapId}`}>
                    <input  
                      readOnly
                      id={`${s.label}-${this.props.mapId}`}
                      key={`input_${s.label}-${this.props.mapId}`}
                      type="radio"
                      name="leaflet-base-layers"
                      className="leaflet-control-layers-selector"
                      value={s.url}
                      onClick={e => this.changeStyle(e)}
                      checked={(!!s[mapId] && !!s[mapId].current) || !!s.current }
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
  showFilterPanel: PropTypes.bool
};

export default connect(mapStateToProps)(StyleSelector);
