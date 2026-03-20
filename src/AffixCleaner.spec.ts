import AffixCleaner from './AffixCleaner';
import { Priority } from './enums/priority';

describe('AffixCleaner', () => {
  describe('constructor', () => {
    it('sets token and currentToken to the input', () => {
      const ac = new AffixCleaner('كتاب');
      expect(ac.token).toBe('كتاب');
      expect(ac.currentToken).toBe('كتاب');
      expect(ac.prefix).toBe('');
      expect(ac.suffix).toBe('');
    });
  });

  describe('canRemoveAffix', () => {
    it('returns true when removal keeps token >= 3 chars', () => {
      const ac = new AffixCleaner('كتاب'); // 4 chars
      expect(ac.canRemoveAffix(1)).toBe(true);
    });

    it('returns false when removal would drop token below 3 chars', () => {
      const ac = new AffixCleaner('كتب'); // 3 chars
      expect(ac.canRemoveAffix(1)).toBe(false);
    });

    it('returns false for count equal to length minus 2', () => {
      const ac = new AffixCleaner('كتاب'); // 4 chars
      expect(ac.canRemoveAffix(2)).toBe(false);
    });
  });

  describe('getPrefix', () => {
    it('returns 2-char prefix "ال" when token starts with it', () => {
      const ac = new AffixCleaner('الكتاب');
      expect(ac.getPrefix(2)).toBe('ال');
    });

    it('returns 3-char prefix "وال" when token starts with it', () => {
      const ac = new AffixCleaner('والكتاب');
      expect(ac.getPrefix(3)).toBe('وال');
    });

    it('returns 4-char prefix "وكال" when token starts with it', () => {
      const ac = new AffixCleaner('وكالدولة');
      expect(ac.getPrefix(4)).toBe('وكال');
    });

    it('returns empty string when no matching prefix', () => {
      const ac = new AffixCleaner('كتاب');
      expect(ac.getPrefix(2)).toBe('');
    });

    it('returns 1-char prefix "ل" when token starts with it', () => {
      const ac = new AffixCleaner('لكتاب');
      expect(ac.getPrefix(1)).toBe('ل');
    });
  });

  describe('getSuffix', () => {
    it('returns 2-char suffix "ون" when token ends with it', () => {
      const ac = new AffixCleaner('كاتبون');
      expect(ac.getSuffix(2)).toBe('ون');
    });

    it('returns 3-char suffix "تان" when token ends with it', () => {
      const ac = new AffixCleaner('طالبتان');
      expect(ac.getSuffix(3)).toBe('تان');
    });

    it('returns 1-char suffix "ة" when token ends with it', () => {
      const ac = new AffixCleaner('مدرسة');
      expect(ac.getSuffix(1)).toBe('ة');
    });

    it('returns empty string when no matching suffix', () => {
      const ac = new AffixCleaner('كتاب');
      expect(ac.getSuffix(2)).toBe('');
    });
  });

  describe('isValidPrefix', () => {
    it('returns true for a valid single prefix "ال"', () => {
      const ac = new AffixCleaner('الكتاب');
      expect(ac.isValidPrefix('ال')).toBe(true);
    });

    it('returns true for a valid 3-char prefix "وال"', () => {
      const ac = new AffixCleaner('والكتاب');
      expect(ac.isValidPrefix('وال')).toBe(true);
    });

    it('returns false for an invalid prefix combination', () => {
      const ac = new AffixCleaner('ززكتاب');
      expect(ac.isValidPrefix('زز')).toBe(false);
    });
  });

  describe('removePrefix', () => {
    it('removes the prefix from currentToken and updates prefix tracker', () => {
      const ac = new AffixCleaner('الكتاب');
      ac.removePrefix('ال');
      expect(ac.currentToken).toBe('كتاب');
      expect(ac.prefix).toBe('ال');
    });

    it('does nothing if token does not start with the given prefix', () => {
      const ac = new AffixCleaner('كتاب');
      ac.removePrefix('ال');
      expect(ac.currentToken).toBe('كتاب');
      expect(ac.prefix).toBe('');
    });

    it('accumulates prefix across multiple calls', () => {
      const ac = new AffixCleaner('وكالبيت');
      ac.removePrefix('و');
      ac.removePrefix('كال');
      expect(ac.currentToken).toBe('بيت');
      expect(ac.prefix).toBe('وكال');
    });
  });

  describe('removeSuffix', () => {
    it('removes the suffix from currentToken and updates suffix tracker', () => {
      const ac = new AffixCleaner('كاتبون');
      ac.removeSuffix('ون');
      expect(ac.currentToken).toBe('كاتب');
      expect(ac.suffix).toBe('ون');
    });

    it('does nothing if token does not end with the given suffix', () => {
      const ac = new AffixCleaner('كتاب');
      ac.removeSuffix('ون');
      expect(ac.currentToken).toBe('كتاب');
      expect(ac.suffix).toBe('');
    });

    it('accumulates suffix across multiple calls (prepends each)', () => {
      const ac = new AffixCleaner('طالبتان');
      ac.removeSuffix('ان');
      ac.removeSuffix('ت');
      expect(ac.currentToken).toBe('طالب');
      expect(ac.suffix).toBe('تان');
    });
  });

  describe('remove', () => {
    it('removes a 2-char suffix by default (Priority.suffix)', () => {
      const ac = new AffixCleaner('كاتبون');
      const result = ac.remove(2, Priority.suffix);
      expect(result).toBe('كاتب');
    });

    it('removes a 2-char prefix when Priority.prefix', () => {
      const ac = new AffixCleaner('الكتاب');
      const result = ac.remove(2, Priority.prefix);
      expect(result).toBe('كتاب');
    });

    it('removes both prefix and suffix when bothSides=true', () => {
      const ac = new AffixCleaner('الكاتبون');
      const result = ac.remove(2, Priority.prefix, true);
      // removes 'ال' prefix and 'ون' suffix
      expect(result).toBe('كاتب');
    });

    it('returns currentToken unchanged if canRemoveAffix is false', () => {
      const ac = new AffixCleaner('كتب'); // 3 chars — cannot remove 1
      const result = ac.remove(1, Priority.suffix);
      expect(result).toBe('كتب');
    });

    it('falls through to prefix when suffix not found and priority is suffix', () => {
      // 'الكتاب' has no 2-char suffix, so it should try prefix
      const ac = new AffixCleaner('الكتاب');
      const result = ac.remove(2, Priority.suffix);
      expect(result).toBe('كتاب');
    });

    it('falls through to suffix when prefix not found and priority is prefix', () => {
      const ac = new AffixCleaner('كاتبون');
      const result = ac.remove(2, Priority.prefix);
      // no 2-char prefix → falls through to suffix 'ون'
      expect(result).toBe('كاتب');
    });
  });

  describe('removeAll', () => {
    it('removes all 1-char affixes until stable', () => {
      const ac = new AffixCleaner('الكاتبة');
      // manually prime via remove to simulate stemmer usage
      ac.remove(2, Priority.prefix, true); // removes 'ال', possibly 'ة'
      const result = ac.removeAll();
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('returns token unchanged when no affixes match', () => {
      const ac = new AffixCleaner('كتاب');
      const result = ac.removeAll();
      expect(result).toBe('كتاب');
    });

    it('terminates and does not loop forever on stable input', () => {
      const ac = new AffixCleaner('درس');
      const result = ac.removeAll();
      expect(result).toBe('درس');
    });
  });
});
