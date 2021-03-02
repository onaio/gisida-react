import * as utils from '../utils';
import * as fixtures from './fixtures';
import { category1, category2 } from '../components/Menu/tests/fixtures';
import Router from '../routes/router';

describe('formatNum', () => {
  test('Formats 1000 correctly', () => {
    expect(utils.formatNum(1000, 1)).toBe('1k');
  });

  test('Formats 10,000 correctly', () => {
    expect(utils.formatNum(100000, 1)).toBe('0.1M');
  });

  test('Formats 100,000 correctly', () => {
    expect(utils.formatNum(100000, 1)).toBe('0.1M');
  });

  test('Formats 1,000,000 correctly', () => {
    expect(utils.formatNum(1000000, 1)).toBe('1M');
  });
});

describe('getLastIndex', () => {
  test('Gets correct index for item', () => {
    expect(utils.getLastIndex(['a', 'b', 'c', 'd', 'e'], 'c')).toBe(2);
  });

  test('Returns undefined if item does not exist in array', () => {
    expect(utils.getLastIndex(['a', 'b', 'c', 'd', 'e'], 'f')).toBeUndefined();
  });
});

describe('isNewSeriesData', () => {
  test('Returns true for different arrays', () => {
    expect(utils.isNewSeriesData(['a', 'b', 'c'], ['a', 'c', 'b'])).toBe(true);
  });

  test('Returns true for different arrays', () => {
    expect(utils.isNewSeriesData(['a', 'b', 'c'], ['a'])).toBe(true);
  });

  test('Returns false for same arrays', () => {
    expect(utils.isNewSeriesData(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(false);
  });
});

describe('hexToRgbA', () => {
  test('Converts Hex (with alpha) properly to RGBA', () => {
    expect(utils.hexToRgbA('#fbafff', 0.8)).toBe('rgba(251, 175, 255, 0.8)');
  });

  test('Converts Hex (with alpha) properly to RGBA', () => {
    expect(utils.hexToRgbA('#FFDC00', 1)).toBe('rgba(255, 220, 0, 1)');
  });

  test('Converts Hex (without alpha) properly to RGBA', () => {
    expect(utils.hexToRgbA('#fbafff')).toBe('rgba(251, 175, 255, 1)');
  });
});

describe('getMenuGroupVisibleLayers', () => {
  it('returns visible layer ids for a group with no subgroups', () => {
    const groupName = 'UNICEF';
    const children = [fixtures.mapLayer1, fixtures.mapLayer2];

    expect(utils.getMenuGroupVisibleLayers(groupName, children)).toEqual([fixtures.mapLayer1.id]);
  });

  it('returns visible layer ids for a group with subgroups', () => {
    const groupName = 'WASH';
    const children = [
      {
        UNICEF: {
          category: 'UNICEF',
          layers: [fixtures.mapLayer1, fixtures.mapLayer2],
        },
        Cluster: {
          category: 'Cluster',
          layers: [
            {
              Province: {
                category: 'Province',
                layers: [fixtures.mapLayer3],
              },
              District: {
                category: 'District',
                layers: [fixtures.mapLayer4],
              },
            },
          ],
        },
      },
    ];
    expect(utils.getMenuGroupVisibleLayers(groupName, children)).toEqual([
      fixtures.mapLayer1.id,
      fixtures.mapLayer3.id,
    ]);
  });

  it('returns an empty array if a group with no subgroups has no visible layers', () => {
    const groupName = 'UNICEF';
    const children = [fixtures.mapLayer2];

    expect(utils.getMenuGroupVisibleLayers(groupName, children)).toEqual([]);
  });

  it('returns an empty array if a group with subgroups has no visible layers', () => {
    const groupName = 'WASH';
    const children = [
      {
        UNICEF: {
          category: 'UNICEF',
          layers: [fixtures.mapLayer2],
        },
        Cluster: {
          category: 'Cluster',
          layers: [
            {
              District: {
                category: 'District',
                layers: [fixtures.mapLayer4],
              },
            },
          ],
        },
      },
    ];
    expect(utils.getMenuGroupVisibleLayers(groupName, children)).toEqual([]);
  });
});

describe('getMenuGroupMapLayers', () => {
  it('returns all layer ids for a group without subgroups', () => {
    const groupName = 'UNICEF';
    const children = [fixtures.mapLayer1, fixtures.mapLayer2];

    expect(utils.getMenuGroupMapLayers(groupName, children)).toEqual([
      fixtures.mapLayer1.id,
      fixtures.mapLayer2.id,
    ]);
  });

  it('returns returns all layer Ids for a group with subgroups', () => {
    const groupName = 'WASH';
    const children = [
      {
        UNICEF: {
          category: 'UNICEF',
          layers: [fixtures.mapLayer1, fixtures.mapLayer2],
        },
        Cluster: {
          category: 'Cluster',
          layers: [
            {
              Province: {
                category: 'Province',
                layers: [fixtures.mapLayer3],
              },
              District: {
                category: 'District',
                layers: [fixtures.mapLayer4],
              },
            },
          ],
        },
      },
    ];
    expect(utils.getMenuGroupMapLayers(groupName, children)).toEqual([
      fixtures.mapLayer1.id,
      fixtures.mapLayer2.id,
      fixtures.mapLayer3.id,
      fixtures.mapLayer4.id,
    ]);
  });
});

describe('utils/menuGroupHasVisibleLayers', () => {
  it('returns true if a group with no subgroups has visible layers', () => {
    const groupName = 'Place Labels';
    const group = category1.layers[0][groupName];

    expect(utils.menuGroupHasVisibleLayers(groupName, group.layers, ['region-labels'])).toEqual(
      true
    );
  });

  it('returns true if a group with subgroups has visible layers', () => {
    const groupName = 'WFP, BRCiS, and CASH Consortium';
    const group = category2.layers[0][groupName];

    expect(
      utils.menuGroupHasVisibleLayers(groupName, group.layers, ['coverage-analysis-district'])
    ).toEqual(true);
  });

  it('it returns false if a group with no subgroups has no visible layers', () => {
    const groupName = 'Place Labels';
    const group = category1.layers[0][groupName];

    expect(utils.menuGroupHasVisibleLayers(groupName, group.layers, [])).toEqual(false);
  });

  it('returns false if a group with subgroups has no visible layers', () => {
    const groupName = 'WFP, BRCiS, and CASH Consortium';
    const group = category2.layers[0][groupName];

    expect(utils.menuGroupHasVisibleLayers(groupName, group.layers, [])).toEqual(false);
  });
});

describe('getSharedLayersFromURL', () => {
  it('returns shared layers if layers are from map 1', () => {
    Router.history.push({
      pathname: '/',
      search: '?map-1-layers=layer-1&map-1-layers=layer-2',
    });
    expect(utils.getSharedLayersFromURL('map-1')).toEqual(['layer-1', 'layer-2']);
    expect(utils.getSharedLayersFromURL('map-2')).toEqual([]);
  });

  it('returns shared layers if layers are from map 2', () => {
    Router.history.push({
      pathname: '/',
      search: '?map-2-layers=layer-1&map-2-layers=layer-2',
    });
    expect(utils.getSharedLayersFromURL('map-2')).toEqual(['layer-1', 'layer-2']);
    expect(utils.getSharedLayersFromURL('map-1')).toEqual([]);
  });

  it('returns shared layers if layers are from map 1 and map 2', () => {
    Router.history.push({
      pathname: '/',
      search:
        '?map-1-layers=layer-1&map-1-layers=layer-2&map-2-layers=layer-3&map-2-layers=layer-4',
    });
    expect(utils.getSharedLayersFromURL('map-1')).toEqual(['layer-1', 'layer-2']);
    expect(utils.getSharedLayersFromURL('map-2')).toEqual(['layer-3', 'layer-4']);
    // Query param `map-2-layers` is the first
    Router.history.push({
      pathname: '/',
      search: '?map-2-layers=layer-5&map-1-layers=layer-1',
    });
    expect(utils.getSharedLayersFromURL('map-1')).toEqual(['layer-1']);
    expect(utils.getSharedLayersFromURL('map-2')).toEqual(['layer-5']);
  });

  it('return empty array if there are no shared layers', () => {
    Router.history.push({
      pathname: '/',
    });
    expect(utils.getSharedLayersFromURL('map-1')).toEqual([]);
  });

  it('returns shared layer if url ends with #', () => {
    Router.history.push({
      pathname: '/',
      search: '?map-1-layers=layer-1&map-1-layers=layer-2#',
    });
    expect(utils.getSharedLayersFromURL('map-1')).toEqual(['layer-1', 'layer-2']);
  });
});

describe('getURLSearchParams', () => {
  it('returns an instance of URLSearchParams', () => {
    expect(utils.getURLSearchParams() instanceof URLSearchParams).toBe(true);
  });
});

describe('pushSearchParamsToURL', () => {
  it('pushes a query param string from an instance of URLSearchParams', () => {
    const paramsString = 'q=URLUtils.searchParams&topic=api';
    const searchParams = new URLSearchParams(paramsString);
    utils.pushSearchParamsToURL(searchParams);
    expect(window.location.href).toEqual('http://localhost/?q=URLUtils.searchParams&topic=api');
  });
});

describe('getSharedStyleFromURL', () => {
  it('gets shared map style correctly ', () => {
    Router.history.push({
      pathname: '/',
      search: '?map-1-layers=layer-1&map-1-style=0#',
    });
    expect(utils.getSharedStyleFromURL('map-1')).toEqual(0);
  });

  it('returns null if style not found', () => {
    Router.history.push({
      pathname: '/',
      search: '?map-1-layers=layer-1',
    });
    expect(utils.getSharedStyleFromURL('map-1')).toEqual(null);
  });

  it('it style value must be a number', () => {
    Router.history.push({
      pathname: '/',
      search: '?map-1-layers=layer-1&map-1-style=something',
    });
    expect(utils.getSharedStyleFromURL('map-1')).toEqual(NaN);
  });
});
