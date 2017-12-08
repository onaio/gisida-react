import { connect } from 'react-redux'
import Menu from '../components/Menu/Menu'
import { groupBy } from '../lib/utils'

const mapStateToProps = (state, ownProps) => {

  const categories = [];
  const grouped = groupBy(state.LAYERS, 'category'); 
  grouped.map((group) => {
    if (group[0].hasOwnProperty('category')) {
      categories.push({
        layers: group,
        category: group[0].category
      });
    } else {
      categories.push({
        layers: group,
        category: "Default"
      });
    }
  });
  return {
    categories: categories,
    // todo: provide missing props
    menuId: '',
    mapTargetId: '',
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onToggleMenu: (e) => {
      // todo: Show/Hide Menu
    },
    onCategoryClick: (e) => { 
      //todo: Expand/Collapes layer categories sub-menu
    }
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Menu);
