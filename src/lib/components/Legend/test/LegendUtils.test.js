import React from 'react';
import { buildDescription, buildHyperLink, combinedLinks } from '../Utils';

describe('Legend Utils', () => {
  const layerObj = {
    legendDescription: 'layer desc',
  };
  const legendDescription = (
    <div className="description">
      <span className="glyphicon glyphicon-info-sign" />
      <p>layer desc</p>
    </div>
  );
  const combinedLinksResult = (
    <div className="combinedLinks">
      <div className="description">
        <span className="glyphicon glyphicon-info-sign" />
        <p>layer desc</p>
      </div>
        
    </div>
  );

  it('builds legend description correctly', () => {
    expect(buildDescription(layerObj)).toEqual(legendDescription);
  });
  it('builds legend description correctly', () => {
    expect(combinedLinks(legendDescription)).toEqual(combinedLinksResult);
  });
});
