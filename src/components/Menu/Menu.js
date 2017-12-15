import React, { Component } from 'react';
import { connect } from 'react-redux'
import './Menu.css';
import PropTypes from 'prop-types';
import Layers from '../Layers/Layers';
import { groupBy } from '../../utils'

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

class Menu extends Component {

  onToggleMenu = (e) => {
    // todo: Show/Hide Menu
  }

  onCategoryClick= (e) => {
    //todo: Expand/Collapes layer categories sub-menu
  }

  render() {
    const menuId = this.props.menuId;
    const mapTargetId = this.props.mapTargetId;
    const categories = this.props.categories;
    return (
      <div id={`${menuId}-wrapper`} className="sectors-menu-wrapper">
        <a href="#" onClick={e => this.onToggleMenu(e)} className="open-btn"><span className="glyphicon glyphicon-list" /></a>
        <div id={menuId} className="sectors-menu">
          <a className="open-btn" onClick={e => this.onToggleMenu(e)} href="#"><span className="glyphicon glyphicon-remove" /></a>
          <ul className="sectors">
            {(categories && categories.length) > 0 ?
              categories.map((category, i) =>
                // eslint-disable-next-line react/no-array-index-key
                (<li className="sector" key={i}><a href="#" onClick={e => this.onCategoryClick(e)}>{category.category} <span className="caret" /></a>
                  {
                    // todo - create LayersContainer to handle layer related state changes
                  }
                  <Layers
                    mapTargetId={mapTargetId}
                    layers={category.layers}
                  />
                </li>)) :
              <li>No categories defined</li>
            }
          </ul>
        </div>
      </div>
    );
  }
}

Menu.propTypes = {
  // menuId: PropTypes.string.isRequired,
  // mapTargetId: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default connect(mapStateToProps)(Menu);
