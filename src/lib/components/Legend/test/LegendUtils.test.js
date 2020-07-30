import React from 'react';
import { buildDescription, buildHyperLink, combinedLinks } from '../Utils';

describe('Legend Utils', () => {
    const layerObj = { legendDescription: 'layer desc', legendHyperlink: 'ona.io', legendHyperlinkText: "Google doc Report" };
    const legendDescription = (
        <div className="description">
            <span className="glyphicon glyphicon-info-sign" />
            <p>layer desc</p>
        </div>
    );
    const combinedLinksResult = (<div className="combinedLinks">
        <div className="description">
            <span className="glyphicon glyphicon-info-sign" />
            <p>layer desc</p></div>&nbsp;&nbsp;
        <a href="ona.io"><h5>Google doc Report</h5>
            <span className="glyphicon glyphicon-file" />
        </a>
    </div>);
    const legendHyperlink = <a href="ona.io">
        <h5>Google doc Report</h5>
        <span className="glyphicon glyphicon-file" />
    </a>;

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
