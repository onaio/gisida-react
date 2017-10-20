import React, { Component } from 'react';
import './Menu.css';
import PropTypes from 'prop-types';
import Layers from '../Layers/Layers';


const Menu = ({ sectorMenuId,
  mapTargetId,
  sectorData,
  layerData,
  onToggleSectors = f => f,
  onSectorClick = f => f,
  onLayerChange = f => f }) =>
  (<div id={`${sectorMenuId}-wrapper`} className="sectors-menu-wrapper">
    <a href="#" onClick={e => onToggleSectors(e)} className="open-btn"><span className="glyphicon glyphicon-list" /></a>
    <div id={sectorMenuId} className="sectors-menu">
      <a className="open-btn" onClick={e => onToggleSectors(e)} href="#"><span className="glyphicon glyphicon-remove" /></a>
      <ul className="sectors">
        {(sectorData && sectorData.length) > 0 ?
        sectorData.map((sector, i) =>
          // eslint-disable-next-line react/no-array-index-key
          (<li className="sector" key={i}><a href="#" onClick={e => onSectorClick(e)}>{sector.sector} <span className="caret" /></a>
            <Layers
              onLayerChange={onLayerChange}
              mapTargetId={mapTargetId}
              layers={sector.layers}
              layerData={layerData}
            />
            </li>)) :
          <li>No categores defined</li>
        }
      </ul>
    </div>
  </div>);

Menu.propTypes = {
  sectorMenuId: PropTypes.string.isRequired,
  mapTargetId: PropTypes.string.isRequired,
  sectorData: PropTypes.arrayOf(PropTypes.any).isRequired,
  layerData: PropTypes.objectOf(PropTypes.any).isRequired,
  onToggleSectors: PropTypes.func.isRequired,
  onSectorClick: PropTypes.func.isRequired,
  onLayerChange: PropTypes.func.isRequired,
};

export default Menu;
