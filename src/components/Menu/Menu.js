import React, { Component } from 'react';
import './Menu.css';
import PropTypes from 'prop-types';
import Layers from '../Layers/Layers';

// todo - convert this to a class
const Menu = ({ menuId,
  mapTargetId,
  categories,
  onToggleMenu = f => f,
  onCategoryClick = f => f, }) =>
  (<div id={`${menuId}-wrapper`} className="sectors-menu-wrapper">
    <a href="#" onClick={e => onToggleMenu(e)} className="open-btn"><span className="glyphicon glyphicon-list" /></a>
    <div id={menuId} className="sectors-menu">
      <a className="open-btn" onClick={e => onToggleMenu(e)} href="#"><span className="glyphicon glyphicon-remove" /></a>
      <ul className="sectors">
        {(categories && categories.length) > 0 ?
          categories.map((category, i) =>
          // eslint-disable-next-line react/no-array-index-key
            (<li className="sector" key={i}><a href="#" onClick={e => onCategoryClick(e)}>{category.category} <span className="caret" /></a>
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
  </div>);

Menu.propTypes = {
  menuId: PropTypes.string.isRequired,
  mapTargetId: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(PropTypes.any).isRequired,
  onToggleMenu: PropTypes.func.isRequired,
  onCategoryClick: PropTypes.func.isRequired,
 
};

export default Menu;
