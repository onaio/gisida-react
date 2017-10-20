import { connect } from 'react-redux'
import Menu from '../components/Menu/Menu'
import { groupBy } from '../lib/utils'

const mapStateToProps = (state, ownProps) => {

  const categories = [];
  const grouped = groupBy(state.NODES, 'category');
  grouped.map((group) => {
    if (group[0].hasOwnProperty('category')) {
      categories.push({
        layers: group,
        sector: group[0].category
      });
    } else categories.push({
      layers: [],
      sector: "Default"
    });
  });
  
  return {
    sectorData: categories
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {

  }
}

const StyleSelctorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);

export default StyleSelctorContainer