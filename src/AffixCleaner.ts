import { Priority } from './enums/priority';

const prefixes: { [key: number]: string[] } = {
  4: ['وكال', 'وبال', 'فبال'],
  3: ['وال', 'فال', 'كال', 'بال', 'ولل', 'فلل'],
  2: [
    'ال',
    'لل',
    'لي',
    'لت',
    'لن',
    'لا',
    'فل',
    'فس',
    'في',
    'فت',
    'فن',
    'فا',
    'سي',
    'ست',
    'سن',
    'سا',
    'ول',
    'وس',
    'وي',
    'وت',
    'ون',
    'وا',
  ],
  1: ['ل', 'ب', 'ف', 'س', 'و', 'ي', 'ت', 'ن', 'ا'],
};

const suffixes: { [key: number]: string[] } = {
  4: [],
  3: ['\u062a\u0645\u0644', '\u0647\u0645\u0644', '\u062a\u0627\u0646', '\u062a\u064a\u0646', '\u0643\u0645\u0644'],
  2: [
    '\u0648\u0646',
    '\u0627\u062a',
    '\u0627\u0646',
    '\u064a\u0646',
    '\u062a\u0646',
    '\u0643\u0645',
    '\u0647\u0646',
    '\u0646\u0627',
    '\u064a\u0627',
    '\u0647\u0627',
    '\u062a\u0645',
    '\u0643\u0646',
    '\u0646\u064a',
    '\u0648\u0627',
    '\u0645\u0627',
    '\u0647\u0645',
  ],
  1: ['\u0629', '\u0647', '\u064a', '\u0643', '\u062a', '\u0627', '\u0646', 'و'],
};

export default class AffixCleaner {
  token;
  currentToken;
  prefix = '';
  suffix = '';

  constructor(token: string) {
    this.token = token;
    this.currentToken = token;
  }

  /**
   *
   * @param {number} count
   * @param {Priority} priority
   * @param {boolean} bothSides
   * @return {any}
   */
  remove(count: number, priority: Priority = Priority.suffix, bothSides = false) {
    if (!this.canRemoveAffix(count)) {
      return this.currentToken;
    }

    let affix: string | null = null;

    //TODO: Refactor this IMPORTANT
    if (priority === Priority.suffix) {
      let affix = this.getSuffix(count);
      this.removeSuffix(affix);
      if (!affix || bothSides) {
        affix = this.getPrefix(count);
        this.removePrefix(affix);
      }
    } else {
      affix = this.getPrefix(count);
      this.removePrefix(affix);
      if (!affix || bothSides) {
        affix = this.getSuffix(count);
        this.removeSuffix(affix);
      }
    }

    return this.currentToken;
  }

  /**
   *
   * @return {any}
   */
  removeAll() {
    let token = this.currentToken;
    while (true) {
      const len = token.length;
      token = this.remove(1, Priority.suffix, true);

      if (len == token.length) break;
    }
    return token;
  }

  /**
   *
   * @param {number} count
   * @return {string}
   */
  getPrefix(count: number) {
    const token = this.currentToken;
    const affixList = prefixes[count] || [];

    for (const prefix of affixList) {
      if (token.startsWith(prefix) && this.isValidPrefix(prefix)) {
        return prefix;
      }
    }
    return '';
  }

  /**
   *
   * @param {string} prefix
   * @return {boolean}
   */
  isValidPrefix(prefix: string) {
    const wholePrefix = this.prefix + prefix;
    const pList = prefixes[wholePrefix.length];
    return pList && pList.includes(wholePrefix);
  }

  /**
   *
   * @param {string} prefix
   */
  removePrefix(prefix: string) {
    if (this.currentToken.startsWith(prefix)) {
      this.currentToken = this.currentToken.substring(prefix.length);
      this.prefix = this.prefix + prefix;
    }
  }

  /**
   *
   * @param {number} count
   * @return {string}
   */
  getSuffix(count: number) {
    const token = this.currentToken;
    const affixList = suffixes[count] || [];

    for (const suffix of affixList) {
      //TODO: also check if is valid suffix
      if (token.endsWith(suffix)) {
        return suffix;
      }
    }
    return '';
  }

  /**
   *
   * @param {string} suffix
   */
  removeSuffix(suffix: string) {
    if (this.currentToken.endsWith(suffix)) {
      this.currentToken = this.currentToken.substring(0, this.currentToken.length - suffix.length);
      this.suffix = suffix + this.suffix;
    }
  }

  /**
   *
   * @param {number} count
   * @return {boolean}
   */
  canRemoveAffix(count: number) {
    return this.currentToken.length - count >= 3;
  }
}
