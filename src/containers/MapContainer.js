import { connect } from 'react-redux'
import { Actions } from 'gisida'
import Map from '../components/Map/Map'

const mapStateToProps = (state, ownProps) => {
  return {
    mapConfig: state.APP.mapConfig,
    accessToken: state.APP.accessToken,
    layers: state.LAYERS
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
   
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
