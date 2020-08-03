import React from 'react';
import { buildDescription, buildHyperLink, combinedLinks } from '../Utils';

describe('Legend Utils', () => {
  const layerObj = {
    legendDescription: 'layer desc',
    legendHyperlink: 'ona.io',
    legendHyperlinkText: 'Google doc Report',
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
        
      <a data-link="resourceLink" href="ona.io" target="_blank">
        <h5 data-link="resourceLink">Google doc Report</h5>
        <span className="glyphicon glyphicon-file" data-link="resourceLink" />
      </a>
    </div>
  );
  const legendHyperlink = (
    <a data-link="resourceLink" href="ona.io" target="_blank">
      <h5 data-link="resourceLink">Google doc Report</h5>
      <span className="glyphicon glyphicon-file" data-link="resourceLink" />
    </a>
  );

  it('builds legend description correctly', () => {
    expect(buildDescription(layerObj)).toEqual(legendDescription);
  });

  it('builds legend description correctly', () => {
    expect(buildHyperLink(layerObj)).toEqual(legendHyperlink);
  });
  it('builds legend description correctly', () => {
    expect(combinedLinks(legendDescription, legendHyperlink)).toEqual(combinedLinksResult);
  });
});
