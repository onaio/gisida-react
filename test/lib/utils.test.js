import * as utils from '../../src/lib/utils';
import layer from '../fixtures/layers.json'

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
})

describe('getLastIndex', () => {

  test('Gets correct index for item', () => {
    expect(utils.getLastIndex(['a', 'b', 'c', 'd', 'e'], 'c')).toBe(2);
  });

  test('Returns undefined if item does not exist in array', () => {
    expect(utils.getLastIndex(['a', 'b', 'c', 'd', 'e'], 'f')).toBeUndefined();
  });
})

describe('isNewSeriesData', () => {

  test('Returns true for arrays of different lengths', () => {
    expect(utils.isNewSeriesData(['a','b','c'],['a','c'])).toBe(true);
  });

  test('Returns true for different arrays', () => {
    expect(utils.isNewSeriesData(['a','b','c'],['a','c','b'])).toBe(true);
  });

  test('Returns true for different arrays', () => {
    expect(utils.isNewSeriesData(['a','b','c'],['a'])).toBe(true);
  });

  test('Returns false for same arrays', () => {
    expect(utils.isNewSeriesData(['a','b','c'],['a','b','c'])).toBe(false);
  });
})

describe('hexToRgbA', () => {

  test('Converts Hex (with alpha) properly to RGBA', () => {
    expect(utils.hexToRgbA('#fbafff',0.8)).toBe('rgba(251, 175, 255, 0.8)');
  });

  test('Converts Hex (with alpha) properly to RGBA', () => {
    expect(utils.hexToRgbA('#FFDC00',1)).toBe('rgba(255, 220, 0, 1)');
  });

  test('Converts Hex (without alpha) properly to RGBA', () => {
    expect(utils.hexToRgbA('#fbafff')).toBe('rgba(251, 175, 255, 1)');
  });

  test('Throw an error for a bad hex', () => {
		expect(function(){utils.hexToRgbA('#fbaffffff')}).toThrow(new Error('Bad Hex'));
	});

})

describe('buildLayersObj', () => {
  layer["Education-adolescents-15-to-18"].visible = true;
  const layers = {...layer}
  const output = [layer["Education-adolescents-15-to-18"]]
  it('Should return correct layers', () => {
    expect(utils.buildLayersObj(layers)).toEqual(output)
  })
})