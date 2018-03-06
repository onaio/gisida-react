import React, { Component } from 'react';
import { Actions, parseMustache } from 'gisida';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import './DetailView.scss';

const mapStateToProps = (state, ownProps) => {
  const { detailView } = state.MAP;
  const layerObj = (detailView && detailView.layerId)
    ? state.MAP.layers[detailView.layerId] : null;
  return {
    MAP: state.MAP,
    layerObj,
    properties: detailView && detailView.properties,
    spec: layerObj && layerObj['detail-view'], 
  };
}

class DetailView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillReceiveProps(nextProps) {
    const { layerObj, properties, spec } = nextProps;
    if (!layerObj || !spec || !properties) {
      this.setState({ UID: null });
    } else {
      this.setState({
        UID: properties[spec.UID],
        title: properties[spec.title.prop],
        subTitle: properties[spec['sub-title'].prop],
        spec,
        properties,
      });
    }
  }

  onCloseClick(e) {
    e.preventDefault();
    this.props.dispatch(Actions.detailView(null));
  }


  parseDetailValue(spec, datum) {
    // 1) protect against empty strings, nulls, and undefineds
    if (!!!spec) return false;

    // 2) if single property then just get it from the datum
    if (typeof spec === 'string' && datum[spec]) {
      return datum[spec];
    // 3) if single property but it's undefined as datum prop, return false
    } else if (typeof spec === 'string' && !datum[spec]) {
      return false;
    }

    // 4) if prop is an object with mustache, render it to a html string
    if (spec.prop && datum[spec.prop] && spec.mustache) {
      return parseMustache(spec.mustache, datum);
    }

    // 5) if prop is a list and join is secified, create a list string
    if (Array.isArray(spec.prop) && spec.join) {
      const value = [];
      spec.prop.forEach((s) => {
        const d = (typeof s === 'string' && datum[s])
          ? datum[s]
          : this.parseDetailValue(s, datum);
        if (d) value.push(d);
      });
      return value.length ? value.join(spec.join) : false;
    }

    // 6) if array of props has no join value, reduce and return the first passing prop 
    if (Array.isArray(spec.prop)) {
      for (let p = 0; p < spec.prop.length; p += 1) {
        if (datum[spec.prop[p]] || datum[spec.prop[p].prop]) {
          return this.parseDetailValue(spec.prop[p], datum);
        }
      }
    }

    // 7) if all else fails, return false
    return false;
  }

  parseDetailAlt(spec, datum) {
    // 1) if icon is a simple string, return it
    if (typeof spec === 'string') {
      return spec;
    }

    // 2) if prop is an object with mustache, render it to a html string
    if (spec.prop && datum[spec.prop] && spec.mustache) {
      return parseMustache(spec.mustache, datum);
    }

    // 3) if all else fails, return false
    return false;
  }

  parseDetailIcon(spec, datum) {
    // 1) if icon is a simple string, return it
    if (typeof spec === 'string') {
      return spec;
    }

    // 2) if icon is an options object, parse and return
    if (spec.prop && datum[spec.prop] && spec[datum[spec.prop]]) {
      return {
        icon: spec[datum[spec.prop]].glyph,
        color: spec[datum[spec.prop]].color || false,
        alt: spec[datum[spec.prop]].alt
          ? this.parseDetailAlt(spec[datum[spec.prop]].alt, datum)
          : false,
      };
    }

    // 3) if all else fails, return false
    return false;
  }

  buildDetailListItem(detail, properties, i) {
    let value;
    let icon;
    let iconColor;
    let alt;

    // 1) Parse list item innerHTML (text) from prop(s)
    value = this.parseDetailValue(detail.value, properties);
    if (!value) return false;

    // 2) Parse glyphicon from icon (options); Note: this doesn't work with multiple props
    icon = this.parseDetailIcon(detail.icon, properties);
    if (icon instanceof Object) {
      alt = icon.alt;
      iconColor = icon.color;
      icon = icon.icon;
    }
    if (!icon) return false;
    
    // 3) Parse text for databallon
    if (!alt && detail.alt) {
      alt = this.parseDetailAlt(detail.alt, properties);
    }

    // 4) Return built detail list item
    return (
      <li key={i}>
        <i data-balloon={alt} data-balloon-pos="up">
          <span
            className={`glyphicon glyphicon-${icon}`}
            style={iconColor ? { color: iconColor } : {}}
          />
        </i>
        {typeof detail.value !== 'string' && detail.value.parser ?
          Parser(value)
        : (
          <span>{value}</span>
        )}
      </li>
    );
  }

  render() {
    const { UID, title, subTitle, spec, properties } = this.state;
    if (this.props.MAP.showFilterPanel || !UID || !spec) return null;

    // Build detail list items from spec
    const detailList = [];
    if (spec['basic-info']) {
      let detail;
      for (let i = 0; i < spec['basic-info'].length; i += 1) {
        detail = this.buildDetailListItem(spec['basic-info'][i], properties, i);
        if (detail) detailList.push(detail);
      }
    }

    return (
      <div className="detail-view-wrapper">
        <a
          className="close-btn"
          title="Close profile view"
          onClick={e => this.onCloseClick(e)}
          href="/detail-view"
        >
          <span className="glyphicon glyphicon-remove" />
        </a>

        <div className="detail-basic-details">
          <div className="detail-header">
            <h4>{title}</h4>
            {!!subTitle ? (<h6>{subTitle}</h6>) : ''}
          </div>
          <div className="detail-list">
            <ul>{detailList}</ul>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(DetailView);
