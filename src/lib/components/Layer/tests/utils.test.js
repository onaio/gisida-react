import { pushLayerToURL } from '../utils';
import Router from '../../../routes/router';

describe('pushLayerToURL', () => {
  it('pushes layer to URL correctly', () => {
    const layer = {
      id: 'layer-id',
      visible: false,
    };
    pushLayerToURL(layer, 'map-1');
    expect(window.location.href).toEqual('http://localhost/?map-1-layers=layer-id');
  });

  it('pushes layer to url if other layers exist in URL', () => {
    Router.history.push({
      pathname: '/',
      search: '?map-1-layers=layer-1',
    });
    const layer = {
      id: 'layer-2',
      visible: false,
    };
    pushLayerToURL(layer, 'map-1');
    expect(window.location.href).toEqual(
      'http://localhost/?map-1-layers=layer-1&map-1-layers=layer-2'
    );
  });

  it('pops layer from URL if layer is deselected', () => {
    Router.history.push({
      pathname: '/',
      search: '?map-1-layers=layer-1&map-1-layers=layer-2',
    });
    const layer = {
      id: 'layer-2',
      visible: true,
    };
    pushLayerToURL(layer, 'map-1');
    expect(window.location.href).toEqual('http://localhost/?map-1-layers=layer-1');
  });
});
