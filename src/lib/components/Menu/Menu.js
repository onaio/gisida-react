import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import Layers from '../Layers/Layers';
import { groupBy } from '../../utils'
import './Menu.scss';

const mapStateToProps = (state, ownProps) => {
  const categories = [];
  const layers = [];
  // Get list of layers in state.LAYERS;
  for (var key in state.LAYERS) {
    layers.push(state.LAYERS[key]);
  } 
  // Group layers using category property
  const grouped = groupBy(layers, 'category');
  
  // Add layers to categories
  grouped.forEach(group => {
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
    menuId: 'sector-menu-1',
    mapTargetId: '',
  }
}

class Menu extends Component {

  onToggleMenu = (e) => {
    // todo: Show/Hide Menu
    const mapId  = 'map-1'
    e.preventDefault();
    const $wrapper = $(e.target).parents('.sectors-menu-wrapper');
    $wrapper.find('.sectors-menu').toggle();
    $wrapper.find('.open-btn').toggle();
    // todo - move this into the state....
    $(window).trigger('toggleSector', { mapId, sectorsId: $wrapper.attr('id') });
  }

  onCategoryClick= (e) => {
    //todo: Expand/Collapes layer categories sub-menu
    e.preventDefault();
    $(e.target).parent('li').find('.layers').toggle();
  }

  render() {
    const menuId = this.props.menuId;
    const mapTargetId = this.props.mapTargetId;
    const categories = this.props.categories;
    return (
      <div id={`${menuId}-wrapper`} className="sectors-menu-wrapper">
        <a onClick={e => this.onToggleMenu(e)} className="open-btn">
          <i className="fa fa-bars" aria-hidden="true" />
        </a>
        <div id={menuId} className="sectors-menu">
          <a className="close-btn" onClick={e => this.onToggleMenu(e)}>
            <i className="fa fa-remove" aria-hidden="true" />
          </a>
          <ul className="sectors">
            {(categories && categories.length) > 0 ?
              categories.map((category, i) =>
                // eslint-disable-next-line react/no-array-index-key
                (<li className="sector" key={i}>
                  <a onClick={e => this.onCategoryClick(e)}>{category.category}
                    <span className="caret" />
                  </a>
                  <Layers
                    mapTargetId={mapTargetId}
                    layers={category.layers}
                  />
                </li>)) :
              <li></li>
            }
          </ul>
        </div>
      </div>
    );
  }
}

Menu.propTypes = {
  menuId: PropTypes.string.isRequired,
  // mapTargetId: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default connect(mapStateToProps)(Menu);
