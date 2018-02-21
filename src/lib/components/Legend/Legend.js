import React from 'react';
import { connect } from 'react-redux';
import './Legend.scss';

const mapStateToProps = (state, ownProps) => {
  return {
	layerObj: state.MAP.layers[state.MAP.activeLayerId],
  }
}

class Legend extends React.Component {

  componentWillReceiveProps(nextProps) {

  }

  render() {
	const mapId = '01';
	const { layerObj } = this.props;
	if (!layerObj) {
	  return false;
	}
	let shapesArr = [];
	const circleType = (layerObj && layerObj.credit && layerObj.type === 'circle' && !layerObj.categories.shape && layerObj.visible);
	const classKeys = ["circle-sm", "circle-md", "circle-lg"];

	for (let c = 0; c < classKeys.length; c+=1) {
		shapesArr.push((
			<span
           className={classKeys[categories]}
           style={{ background: circleType ? layerObj.categories.color : ' none'}}
           key={classKeys[c]}
	       >
	        </span>
		));
	}

    return (
    	<div>
        <div className={`legend ${mapId}`}>
          {circleType ?
        	<div
        	  id={`legend-${layerObj.id}-${mapId}`}
	      	  className="legend-shapes legend-row"
    	      data-layer={`${layerObj.id}`}
    	    >
    	      <b>
      	        {layerObj.label}
      	      </b>
    	      <div className="legend-symbols">
	           {shapesArr}
    	      </div>
    	      <span>{layerObj.credit}</span>
        	</div> : ''}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Legend);
