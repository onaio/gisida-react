import React from 'react';
export const buildTimestamp = (layerObj) => {
    if (
        layerObj['timestamp'] &&
        Array.isArray(layerObj.source.data.features || layerObj.source.data) &&
        (layerObj.source.data.features || layerObj.source.data).length > 1
      ) {
        return (layerObj.source.data.features || layerObj.source.data)
          .map(d => (d.properties && d.properties[layerObj['timestamp']]) || d[layerObj['timestamp']])
          .sort()
          .reverse()[0];
      }
      return null;
}

export const buildDescription = (layerObj) => {
    return <div className='description'>
                <span className='glyphicon glyphicon-info-sign' />
                <p>{layerObj['legendDescription']}</p>
		   </div>;
}

export const combinedLinks = (legendDescription) => {
    if (legendDescription) {
        return (<div className='combinedLinks'>
                    {legendDescription}&nbsp;&nbsp;
                </div>);
            } else {
                return null
            }
}