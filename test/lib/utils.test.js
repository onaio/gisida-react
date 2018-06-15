import * as utils from '../../src/lib/utils';

//for isNewSeriesData:
import exInputForNewSeries from '/fixtures/is-new-series-data-input.js/';

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
//string
  test('Returns true for different arrays', () => {
    expect(utils.isNewSeriesData(['a','b','c'],['a','c','b'])).toBe(true);
  });

  test('Returns true for different arrays', () => {
    expect(utils.isNewSeriesData(['a','b','c'],['a'])).toBe(true);
  });

  test('Returns false for same arrays', () => {
    expect(utils.isNewSeriesData(['a','b','c'],['a','b','c'])).toBe(false);
  });
//object
  test('Returns true for different array of object', () => {
    expect(utils.isNewSeriesData(exInputForNewSeries[0],exInputForNewSeries[1])).toBe(true);
  });

  test('Returns false for same array of object', () => {
    expect(utils.isNewSeriesData(exInputForNewSeries[0],exInputForNewSeries[2])).toBe(false);
  });
//nested object
  test('Returns true for different array of nested object', () => {
    expect(utils.isNewSeriesData(exInputForNewSeries[3],exInputForNewSeries[4])).toBe(true);
  });

  test('Returns false for same array of nested object', () => {
    expect(utils.isNewSeriesData(exInputForNewSeries[3],exInputForNewSeries[5])).toBe(false);
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
/* for some reason only working with gisida?
  test('Throw an error for a bad hex', () => {
    expect(utils.hexToRgbA('#fbafff')).toThrow(new Error('Bad Hex'));
  }); 
*/

})


