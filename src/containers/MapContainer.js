import { connect } from 'react-redux'
//import { loadLayer } from 'gisida` // import gisida action
import Map from '../components/Map/Map'

const mapStateToProps = (state, ownProps) => {
  
  return {
    mapConfig: state.APP.mapConfig,
    accessToken: state.APP.accessToken,
    layers: state.NODES
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