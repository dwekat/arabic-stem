import Stemmer from './index';

describe('Stemmer', () => {
  let stemmer: Stemmer;

  beforeEach(() => {
    stemmer = new Stemmer();
  });

  // ---------------------------------------------------------------------------
  // Stop words
  // ---------------------------------------------------------------------------

  describe('stop words', () => {
    const stopWords = [
      'يكون', 'وليس', 'وكان', 'كذلك', 'التي', 'وبين', 'عليها',
      'مساء', 'الذي', 'وكانت', 'ولكن', 'والتي', 'تكون', 'اليوم',
      'اللذين', 'عليه', 'كانت', 'لذلك', 'أمام', 'هناك', 'منها',
      'مازال', 'لازال', 'لايزال', 'مايزال', 'اصبح', 'أصبح',
      'أمسى', 'امسى', 'أضحى', 'اضحى', 'مابرح', 'مافتئ',
      'ماانفك', 'لاسيما', 'ولايزال', 'الحالي', 'اليها', 'الذين',
      'فانه', 'والذي', 'وهذا', 'لهذا', 'فكان', 'ستكون',
      'اليه', 'يمكن', 'بهذا', 'الذى',
    ];

    it.each(stopWords)('returns empty stem for stop word "%s"', (word) => {
      const result = stemmer.stem(word);
      expect(result.stem).toEqual([]);
      expect(result.normalized).toBe(word);
    });
  });

  // ---------------------------------------------------------------------------
  // Short / edge inputs
  // ---------------------------------------------------------------------------

  describe('edge inputs', () => {
    it('returns empty stem for empty string', () => {
      const r = stemmer.stem('');
      expect(r.stem).toEqual([]);
      expect(r.normalized).toBe('');
    });

    it('returns empty stem for single char', () => {
      const r = stemmer.stem('ف');
      expect(r.stem).toEqual([]);
    });

    it('returns empty stem for 2-char token', () => {
      const r = stemmer.stem('في');
      expect(r.stem).toEqual([]);
    });

    it('trims leading and trailing whitespace', () => {
      const trimmed = stemmer.stem('يزرع');
      const padded = stemmer.stem('  يزرع  ');
      expect(padded.stem).toEqual(trimmed.stem);
      expect(padded.normalized).toBe(trimmed.normalized);
    });

    it('strips harakat (short vowels) before processing', () => {
      // يَزْرَعُ with diacritics
      const withH = stemmer.stem('\u064a\u064e\u0632\u0652\u0631\u064e\u0639\u064f');
      const without = stemmer.stem('يزرع');
      expect(withH.stem).toEqual(without.stem);
      expect(withH.normalized).toBe(without.normalized);
    });
  });

  // ---------------------------------------------------------------------------
  // preNormalize
  // ---------------------------------------------------------------------------

  describe('preNormalize', () => {
    it('normalizes hamza on alef أ → ا', () => {
      expect(stemmer.preNormalize('أكل')).toBe('اكل');
    });

    it('normalizes hamza below alef إ → ا', () => {
      expect(stemmer.preNormalize('إنسان')).toBe('انسان');
    });

    it('normalizes bare hamza ء → ا', () => {
      expect(stemmer.preNormalize('شيء')).toBe('شيا');
    });

    it('normalizes hamza on waw ؤ → ا (replaces whole char)', () => {
      // ؤ U+0624 is replaced wholesale with ا
      expect(stemmer.preNormalize('سؤال')).toBe('ساال');
    });

    it('normalizes hamza on ya ئ → ا', () => {
      expect(stemmer.preNormalize('شيئ')).toBe('شيا');
    });

    it('normalizes alef maksura ى → ي', () => {
      expect(stemmer.preNormalize('موسى')).toBe('موسي');
    });

    it('normalizes ta marbuta ة at end → ه', () => {
      expect(stemmer.preNormalize('مدرسة')).toBe('مدرسه');
    });

    it('does NOT replace ة when not at end', () => {
      expect(stemmer.preNormalize('كةاب')).toBe('كةاب');
    });

    it('returns token unchanged when nothing to normalize', () => {
      expect(stemmer.preNormalize('كتاب')).toBe('كتاب');
    });
  });

  // ---------------------------------------------------------------------------
  // postNormalize
  // ---------------------------------------------------------------------------

  describe('postNormalize', () => {
    it('3-letter: replaces ي in position 0 with ا', () => {
      expect(stemmer.postNormalize('يكب')[0]).toBe('ا');
    });

    it('3-letter: does NOT replace و in position 0 (no rule for it)', () => {
      expect(stemmer.postNormalize('وكب')[0]).toBe('و');
    });

    it('3-letter: replaces ا in position 1 with ي', () => {
      expect(stemmer.postNormalize('كاب')[1]).toBe('ي');
    });

    it('3-letter: replaces و in position 1 with ي', () => {
      expect(stemmer.postNormalize('كوب')[1]).toBe('ي');
    });

    it('3-letter: replaces ا in position 2 with ي', () => {
      expect(stemmer.postNormalize('كبا')[2]).toBe('ي');
    });

    it('3-letter: replaces و in position 2 with ي', () => {
      expect(stemmer.postNormalize('كبو')[2]).toBe('ي');
    });

    it('3-letter: replaces ه in position 2 with ي', () => {
      expect(stemmer.postNormalize('كبه')[2]).toBe('ي');
    });

    it('2-letter: appends ي', () => {
      expect(stemmer.postNormalize('كب')).toBe('كبي');
    });

    it('4-letter: unchanged', () => {
      expect(stemmer.postNormalize('كتاب')).toBe('كتاب');
    });

    it('empty string: unchanged', () => {
      expect(stemmer.postNormalize('')).toBe('');
    });

    it('1-letter: unchanged', () => {
      expect(stemmer.postNormalize('ك')).toBe('ك');
    });
  });

  // ---------------------------------------------------------------------------
  // getMatchesForPatterns
  // ---------------------------------------------------------------------------

  describe('getMatchesForPatterns', () => {
    it('returns capture groups joined for a 3-letter root pattern', () => {
      expect(stemmer.getMatchesForPatterns('كتب', [/(.)(.)(.)/])).toEqual(['كتب']);
    });

    it('returns empty array when nothing matches', () => {
      expect(stemmer.getMatchesForPatterns('كتب', [/^xyz$/])).toEqual([]);
    });

    it('collects results across multiple patterns', () => {
      const result = stemmer.getMatchesForPatterns('مكتب', [
        /\u0645(.)(.)(.)/, // مفعل → captures كتب
        /^xyz$/,
      ]);
      expect(result).toContain('كتب');
    });

    it('each pattern contributes at most one match', () => {
      const result = stemmer.getMatchesForPatterns('كتب', [/(.)(.)(.)/]);
      expect(result).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------------------
  // getMatches — guard when affixCleaner not initialized
  // ---------------------------------------------------------------------------

  describe('getMatches', () => {
    it('returns [] when affixCleaner is undefined', () => {
      const s = new Stemmer();
      expect(s.getMatches('كتب')).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // Pattern weight 7 — استفعال
  // ---------------------------------------------------------------------------

  describe('weight-7 patterns', () => {
    it('استفعال: استقبال → root قبل', () => {
      const { stem } = stemmer.stem('استقبال');
      expect(stem).toContain('قبل');
    });
  });

  // ---------------------------------------------------------------------------
  // Pattern weight 6
  // ---------------------------------------------------------------------------

  describe('weight-6 patterns', () => {
    it('استفعل: استخرج → root خرج', () => {
      const { stem } = stemmer.stem('استخرج');
      expect(stem).toContain('خرج');
    });

    it('مستفعل: مستقيم → root قيم', () => {
      const { stem } = stemmer.stem('مستقيم');
      expect(stem).toContain('قيم');
    });

    it('افتعال: احتفال → root حفل', () => {
      const { stem } = stemmer.stem('احتفال');
      expect(stem).toContain('حفل');
    });

    it('تفاعيل: تفاصيل → root فصل', () => {
      const { stem } = stemmer.stem('تفاصيل');
      expect(stem).toContain('فصل');
    });

    it('مفاعيل: مفاتيح → root فتح', () => {
      const { stem } = stemmer.stem('مفاتيح');
      expect(stem).toContain('فتح');
    });

    it('انفعال: انجفال → root جفل', () => {
      const { stem } = stemmer.stem('انجفال');
      expect(stem).toContain('جفل');
    });
  });

  // ---------------------------------------------------------------------------
  // Pattern weight 5
  // ---------------------------------------------------------------------------

  describe('weight-5 patterns', () => {
    it('مفعول: مشروع → root شرع', () => {
      const { stem } = stemmer.stem('مشروع');
      expect(stem).toContain('شرع');
    });

    it('مفعلة: مكتبة → root كتب', () => {
      const { stem } = stemmer.stem('مكتبة');
      expect(stem).toContain('كتب');
    });

    it('انفعل: انفجر → root فجر', () => {
      const { stem } = stemmer.stem('انفجر');
      expect(stem).toContain('فجر');
    });

    it('تفعيل: تحديث → root حدث', () => {
      const { stem } = stemmer.stem('تحديث');
      expect(stem).toContain('حدث');
    });

    it('فواعل: فوارس → root فرس', () => {
      const { stem } = stemmer.stem('فوارس');
      expect(stem).toContain('فرس');
    });

    it('افعال: اجمال → root جمل', () => {
      const { stem } = stemmer.stem('اجمال');
      expect(stem).toContain('جمل');
    });
  });

  // ---------------------------------------------------------------------------
  // Pattern weight 4
  // ---------------------------------------------------------------------------

  describe('weight-4 patterns', () => {
    it('مفعل: مدرس → root درس', () => {
      const { stem } = stemmer.stem('مدرس');
      expect(stem).toContain('درس');
    });

    it('فاعل: كاتب → root كتب', () => {
      const { stem } = stemmer.stem('كاتب');
      expect(stem).toContain('كتب');
    });

    it('فعيل: طبيب → root طبب', () => {
      const { stem } = stemmer.stem('طبيب');
      expect(stem).toContain('طبب');
    });

    it('افعل: اكرم → root كرم', () => {
      const { stem } = stemmer.stem('اكرم');
      expect(stem).toContain('كرم');
    });

    it('تفعل: تحرك → root حرك', () => {
      const { stem } = stemmer.stem('تحرك');
      expect(stem).toContain('حرك');
    });
  });

  // ---------------------------------------------------------------------------
  // Pattern weight 3 — bare trilateral root
  // ---------------------------------------------------------------------------

  describe('weight-3 patterns', () => {
    it('فعل: يزرع → root زرع', () => {
      const { stem } = stemmer.stem('يزرع');
      expect(stem).toContain('زرع');
    });

    it('فعل: كتب → root كتب', () => {
      const { stem } = stemmer.stem('كتب');
      expect(stem).toContain('كتب');
    });

    it('فعل: درس → root درس', () => {
      const { stem } = stemmer.stem('درس');
      expect(stem).toContain('درس');
    });
  });

  // ---------------------------------------------------------------------------
  // Prefix stripping
  // ---------------------------------------------------------------------------

  describe('prefix stripping', () => {
    it('2-char prefix ال: الكتاب stripped before matching', () => {
      const withPrefix = stemmer.stem('الكتاب');
      const without = stemmer.stem('كتاب');
      // normalized should converge to same root
      expect(withPrefix.normalized).toBe(without.normalized);
    });

    it('3-char prefix وال: والكتاب stripped before matching', () => {
      const r = stemmer.stem('والكتاب');
      expect(r.normalized).toBe('كتاب');
    });

    it('4-char prefix وكال: وكالدولة normalized to root', () => {
      const r = stemmer.stem('وكالدولة');
      // after stripping وكال and normalizing ة→ه, currentToken = دوله
      expect(r.normalized).toBe('دول');
    });

    it('4-char prefix فكال: فكالعادة strips prefix correctly', () => {
      const r = stemmer.stem('فكالعادة');
      const bare = stemmer.stem('عادة');
      expect(r.normalized).toBe(bare.normalized);
    });

    it('1-char prefix ي: يكتب stripped before matching', () => {
      const r = stemmer.stem('يكتب');
      expect(r.stem).not.toHaveLength(0);
    });

    it('1-char prefix ت: تكتب stripped before matching', () => {
      const r = stemmer.stem('تكتب');
      expect(r.stem).not.toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Suffix stripping
  // ---------------------------------------------------------------------------

  describe('suffix stripping', () => {
    it('2-char suffix ون: كاتبون → normalized drops suffix', () => {
      const withSuffix = stemmer.stem('كاتبون');
      const without = stemmer.stem('كاتب');
      expect(withSuffix.normalized).toBe(without.normalized);
    });

    it('2-char suffix ات: مكتبات → normalized drops suffix', () => {
      const r = stemmer.stem('مكتبات');
      expect(r.normalized).not.toContain('ات');
    });

    it('1-char suffix ة: مكتبة → normalized drops suffix', () => {
      const withSuffix = stemmer.stem('مكتبة');
      const without = stemmer.stem('مكتب');
      expect(withSuffix.normalized).toBe(without.normalized);
    });

    it('2-char suffix ين: كاتبين → normalized drops suffix', () => {
      const withSuffix = stemmer.stem('كاتبين');
      const without = stemmer.stem('كاتب');
      expect(withSuffix.normalized).toBe(without.normalized);
    });

    it('3-char suffix تان: طالبتان → normalized drops suffix', () => {
      const r = stemmer.stem('طالبتان');
      expect(r.normalized).not.toContain('تان');
    });
  });

  // ---------------------------------------------------------------------------
  // Combined prefix + suffix
  // ---------------------------------------------------------------------------

  describe('combined prefix and suffix stripping', () => {
    it('ال + ون: المدرسون → same normalized as مدرس', () => {
      const combined = stemmer.stem('المدرسون');
      const bare = stemmer.stem('مدرس');
      expect(combined.normalized).toBe(bare.normalized);
    });

    it('ال + ات: المكتبات → same normalized as مكتب', () => {
      const combined = stemmer.stem('المكتبات');
      const bare = stemmer.stem('مكتب');
      expect(combined.normalized).toBe(bare.normalized);
    });
  });

  // ---------------------------------------------------------------------------
  // Deduplication
  // ---------------------------------------------------------------------------

  describe('deduplication', () => {
    it('stem array contains no duplicate roots', () => {
      const words = ['يزرع', 'المستشفيات', 'السرور', 'مكتبة', 'كاتبون'];
      for (const word of words) {
        const { stem } = stemmer.stem(word);
        const unique = new Set(stem);
        expect(unique.size).toBe(stem.length);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Known regression inputs (original 3 tests)
  // ---------------------------------------------------------------------------

  describe('known regressions', () => {
    it('المستشفيات → stem [شفي, سشف], normalized مستشف', () => {
      const r = stemmer.stem('المستشفيات');
      expect(r.stem).toEqual(['شفي', 'سشف']);
      expect(r.normalized).toBe('مستشف');
    });

    it('يزرع → stem [زرع], normalized زرع', () => {
      const r = stemmer.stem('يزرع');
      expect(r.stem).toEqual(['زرع']);
      expect(r.normalized).toBe('زرع');
    });

    it('السرور → stem [سرر], normalized سرور', () => {
      const r = stemmer.stem('السرور');
      expect(r.stem).toEqual(['سرر']);
      expect(r.normalized).toBe('سرور');
    });
  });
});
