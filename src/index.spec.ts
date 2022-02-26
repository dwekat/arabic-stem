/**
 *
 */
import Stemmer from './index';

describe('Stemmer', () => {
  let stemmer: Stemmer;

  beforeEach(() => {
    stemmer = new Stemmer();
  });

  it('Should stem correctly', () => {
    const stemmed = stemmer.stem('المستشفيات');
    expect(stemmed.stem).toEqual(['شفي', 'سشف']);
    expect(stemmed.normalized).toBe('مستشف');
  });

  it('Should stem correctly', () => {
    const stemmed = stemmer.stem('يزرع');
    expect(stemmed.stem).toEqual(['زرع']);
    expect(stemmed.normalized).toBe('زرع');
  });

  it('Should stem correctly', () => {
    const stemmed = stemmer.stem('السرور');
    expect(stemmed.stem).toEqual(['سرر']);
    expect(stemmed.normalized).toBe('سرور');
  });
});
