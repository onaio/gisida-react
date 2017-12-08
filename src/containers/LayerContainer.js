import { connect } from 'react-redux'
import Layer from '../components/Layer/Layer'

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLayerToggle: (e) => {
      //todo: Toggle set layer visible
      console.log('Toggle set layer visible');
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Layer);
