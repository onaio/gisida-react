import React, { Component } from 'react';
import './Menu.css';


function onToggleSectors() {

}

function onSectorClick() {

}

class Menu extends Component {
  render() {
    return (
      <div  className="layers-menu">
        <a href="#" onClick={e => onToggleSectors(e)} className="open-btn"><span className="glyphicon glyphicon-list" /></a>
        <div className="sectors-menu">
          <a className="close-btn" onClick={e => onToggleSectors(e)} href="#"><span className="glyphicon glyphicon-remove" /></a>
          <ul className="sectors">
            <li className="sector">
              <a href="#" onClick={e => onSectorClick(e)}>
              Test
                <span className="caret" /></a>
            </li>
            <li className="sector">
              <a href="#" onClick={e => onSectorClick(e)}>
                Test
                <span className="caret" /></a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Menu;
