import { connect } from 'react-redux'
import StyleSelector from '../components/StyleSelector/StyleSelector'

const mapStateToProps = (state, ownProps) => {
  return {
    style: 'mapbox://styles/mapbox/satellite-v9',
    styles: state.STYLES
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {

  }
}

const StyleSelctorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(StyleSelector);

export default StyleSelctorContainer