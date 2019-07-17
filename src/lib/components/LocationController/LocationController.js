import React from 'react';
import { connect } from 'react-redux';
import './LocationController.scss';
import { Actions } from 'gisida';

const mapStateToProps = (state, ownProps) => {
  const { LOC } = state;
  return {
    state: {
      location: { ...LOC.location },
      locations: { ...LOC.locations },
      active: LOC.active,
      mapId: ownProps.mapId,
    },
    store: { ...state },
    ...ownProps,
  }
}

class LocationController extends React.Component {
  onLocationClick(e) {
    const { dispatch } = this.props;
    e.preventDefault();
    if (e && 
        e.currentTarget &&
        e.currentTarget.dataset &&
        e.currentTarget.dataset.id) {
        dispatch(Actions.setLocation(this.props.mapId, e.currentTarget.dataset.id));
    }
  }

  render() {
    const { locations, active } = this.props.state;
    if (JSON.stringify(locations) === "{}") {
      return null;
    }
    return (<section className="location-controller">
      <h4 className="loc-title">Map Locations</h4>
      <ul className="loc-list">
        {locations && Object.keys(locations).map((l, i) => 
          <li key={i} className="loc-item">
            <a
              className="loc-link"
              style={{ fontWeight: (l === active ? 'bold' : 'normal') }}
              alt={`Center on ${locations[l].label}`}
              title={`Center on ${locations[l].label}`}
              onClick={(e) => { this.onLocationClick(e); }}
              data-id={l}
              // href={`/?loc=${loc}} // todo - hook in to router support
            >{locations[l].label}</a>
          </li>)}
      </ul>
    </section>);
  }
}

export default connect(mapStateToProps)(LocationController);
