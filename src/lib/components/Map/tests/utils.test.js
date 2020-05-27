import { pushStyleToURL } from '../utils';
import Router from '../../../routes/router';

describe('pushStyleToURL', () => {
  beforeEach(() => {
    Router.history.push({
      pathname: '/',
    });
  });

  const style1 = {
    label: 'White',
    url: 'mapbox://styles/ona/cjsoqcbr70si61frucjcwli45',
  };
  const style2 = {
    label: 'Topography',
    url: 'mapbox://styles/ona/cjestgt7ldbet2sqnqth4xx8c',
  };
  const style3 = {
    label: 'Satellite Streets',
    url: 'mapbox://styles/ona/cjfjogvdmfpeb2sq0iuehve18',
  };

  it('pushes style to URL correctly', () => {
    const styles = [style1, style2, style3];
    pushStyleToURL(styles, style2, 'map-1');
    expect(window.location.href).toEqual('http://localhost/?map-1-style=1');
  });

  it('does not push style if style not in styles array', () => {
    const styles = [style1, style3];
    pushStyleToURL(styles, style2, 'map-1');
    expect(window.location.href).toEqual('http://localhost/');
  });
});
