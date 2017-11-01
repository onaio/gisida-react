import { connect } from 'react-redux'
import Menu from '../components/Menu/Menu'
import { groupBy } from '../lib/utils'

const mapStateToProps = (state, ownProps) => {

  const categories = [];
  const grouped = groupBy(state.NODES, 'category');
  grouped.map((group) => {
    if (group.hasOwnProperty('category')) {
      categories.push({
        layers: group,
        sector: group[0].category
      });
    } else {
      categories.push({
        layers: group,
        sector: "Default"
      });
    }
  });
  
  // todo - change to { categories: categories }
  return {
    sectorData: categories
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    // onToggleSectors: (e) => { ... },
    // onSectorClick: (e) => { ... }
  }
}

const StyleSelctorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);

export default StyleSelctorContainer;
