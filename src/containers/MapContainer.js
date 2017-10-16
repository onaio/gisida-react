import { connect } from 'react-redux'
//import { loadLayer } from 'gisida` // import gisida action
import Map from '../components/Map/Map'

const mapStateToProps = (state, ownProps) => {
  return {
    mapConfig: state.appState.APP.mapConfig,
    accessToken: state.appState.APP.accessToken
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    // onClick: () => {
    //   dispatch(setVisibilityFilter(ownProps.filter))
    // }
  }
}

const MapContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Map)

export default MapContainer