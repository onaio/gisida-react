/**
 * @jest-environment jest-environment-jsdom-global
 */

import * as utils from '../utils';
import * as fixtures from './fixtures';

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

describe('menuGroupHasVisibleLayers', () => {
  it('returns true if a group with no subgroups has visible layers', () => {
    const groupName = 'UNICEF';
    const children = [fixtures.mapLayer1, fixtures.mapLayer2];

    expect(utils.menuGroupHasVisibleLayers(groupName, children)).toEqual(true);
  });

  it('returns true if a group with subgroups has visible layers', () => {
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
    expect(utils.menuGroupHasVisibleLayers(groupName, children)).toEqual(true);
  });

  it('it false if a group with no subgroups has no visible layers', () => {
    const groupName = 'UNICEF';
    const children = [fixtures.mapLayer2];

    expect(utils.menuGroupHasVisibleLayers(groupName, children)).toEqual(false);
  });

  it('returns false if a group with subgroups has no visible layers', () => {
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
    expect(utils.menuGroupHasVisibleLayers(groupName, children)).toEqual(false);
  });
});

describe('getSharedLayersFromURL', () => {
  it('returns shared layers if layers are from map 1', () => {
    const sharedURL = 'https://test.onalabs.org/?map-1-layers=layer-1,layer-2';
    jsdom.reconfigure({
      url: sharedURL,
    });
    expect(window.location.href).toEqual(sharedURL);
    expect(utils.getSharedLayersFromURL('map-1')).toEqual(['layer-1', 'layer-2']);
    expect(utils.getSharedLayersFromURL('map-2')).toEqual([]);
  });

  it('returns shared layers if layers are from map 2', () => {
    const sharedURL = 'https://test.onalabs.org/?map-2-layers=layer-1,layer-2';
    jsdom.reconfigure({
      url: sharedURL,
    });
    expect(window.location.href).toEqual(sharedURL);
    expect(utils.getSharedLayersFromURL('map-2')).toEqual(['layer-1', 'layer-2']);
    expect(utils.getSharedLayersFromURL('map-1')).toEqual([]);
  });

  it('returns shared layers if layers are from map 1 and map 2', () => {
    const sharedURL =
      'https://test.onalabs.org/?map-1-layers=layer-1,layer-2&map-2-layers=layer-3,layer-4';
    jsdom.reconfigure({
      url: sharedURL,
    });
    expect(window.location.href).toEqual(sharedURL);
    expect(utils.getSharedLayersFromURL('map-1')).toEqual(['layer-1', 'layer-2']);
    expect(utils.getSharedLayersFromURL('map-2')).toEqual(['layer-3', 'layer-4']);
    // Query param `map-2-layers` is the first
    const sharedURLMap2First =
      'https://test.onalabs.org/?map-2-layers=layer-3,layer-4&map-1-layers=layer-1,layer-2';
    jsdom.reconfigure({
      url: sharedURLMap2First,
    });
    expect(window.location.href).toEqual(sharedURLMap2First);
    expect(utils.getSharedLayersFromURL('map-1')).toEqual(['layer-1', 'layer-2']);
    expect(utils.getSharedLayersFromURL('map-2')).toEqual(['layer-3', 'layer-4']);
  });

  it('return empty array if there are no shared layers', () => {
    const sharedURL = 'https://test.onalabs.org/';
    jsdom.reconfigure({
      url: sharedURL,
    });
    expect(window.location.href).toEqual(sharedURL);
    expect(utils.getSharedLayersFromURL('map-1')).toEqual([]);
  });

  it('returns shared layer if url ends with #', () => {
    const sharedURLMap1 = 'https://test.onalabs.org/?map-1-layers=layer-1,layer-2#';
    jsdom.reconfigure({
      url: sharedURLMap1,
    });
    expect(window.location.href).toEqual(sharedURLMap1);
    expect(utils.getSharedLayersFromURL('map-1')).toEqual(['layer-1', 'layer-2']);

    const sharedURLBoth =
      'https://test.onalabs.org/?map-1-layers=layer-1,layer-2&map-2-layers=layer-3,layer-4#';
    jsdom.reconfigure({
      url: sharedURLBoth,
    });
    expect(window.location.href).toEqual(sharedURLBoth);
    expect(utils.getSharedLayersFromURL('map-1')).toEqual(['layer-1', 'layer-2']);
    expect(utils.getSharedLayersFromURL('map-2')).toEqual(['layer-3', 'layer-4']);
    // Query param `map-2-layers` is the first
    const sharedURLMap2First =
      'https://test.onalabs.org/?map-2-layers=layer-3,layer-4&map-1-layers=layer-1,layer-2#';
    jsdom.reconfigure({
      url: sharedURLMap2First,
    });
    expect(window.location.href).toEqual(sharedURLMap2First);
    expect(utils.getSharedLayersFromURL('map-1')).toEqual(['layer-1', 'layer-2']);
    expect(utils.getSharedLayersFromURL('map-2')).toEqual(['layer-3', 'layer-4']);
  });
});
