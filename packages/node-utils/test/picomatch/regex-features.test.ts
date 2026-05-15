import { describe, expect, test } from "bun:test";
import picomatch from "../../src/picomatch/index.ts";

const match = (list: string | string[], pattern: string, options: any = {}): string[] => {
  const isMatch = picomatch(pattern, options, true);
  const matches: Set<string> = options.matches || new Set();
  for (const item of ([] as string[]).concat(list)) {
    const m = (isMatch as any)(item, true);
    if (m && m.output && m.isMatch === true) matches.add(m.output);
  }
  return [...matches];
};

const expect_truthy = (v: unknown) => { expect(Boolean(v)).toBe(true); };
const expect_equal = (actual: unknown, expected: unknown) => {
  expect(actual).toBe(expected as any);
};
const expect_deepEqual = (actual: unknown, expected: unknown) => {
  expect(actual).toEqual(expected as any);
};
const expect_throws = (fn: () => unknown, matcher?: any) => {
  if (matcher) expect(fn).toThrow(matcher);
  else expect(fn).toThrow();
};
const expect_doesNotThrow = (fn: () => unknown) => {
  expect(fn).not.toThrow();
};


import * as utils from "../../src/picomatch/utils.ts";
const { isMatch } = picomatch;

describe('regex features', () => {
  describe('word boundaries', () => {
    test('should support word boundaries', () => {
      expect_truthy(isMatch('a', 'a\\b'));
    });

    test('should support word boundaries in parens', () => {
      expect_truthy(isMatch('a', '(a\\b)'));
    });
  });

  describe('regex lookarounds', () => {
    test('should support regex lookbehinds', () => {
      expect_truthy(isMatch('foo/cbaz', 'foo/*(?<!d)baz'));
      expect_truthy(!isMatch('foo/cbaz', 'foo/*(?<!c)baz'));
      expect_truthy(!isMatch('foo/cbaz', 'foo/*(?<=d)baz'));
      expect_truthy(isMatch('foo/cbaz', 'foo/*(?<=c)baz'));
    });
  });

  describe('regex back-references', () => {
    test('should support regex backreferences', () => {
      expect_truthy(!isMatch('1/2', '(*)/\\1'));
      expect_truthy(isMatch('1/1', '(*)/\\1'));
      expect_truthy(isMatch('1/1/1/1', '(*)/\\1/\\1/\\1'));
      expect_truthy(!isMatch('1/11/111/1111', '(*)/\\1/\\1/\\1'));
      expect_truthy(isMatch('1/11/111/1111', '(*)/(\\1)+/(\\1)+/(\\1)+'));
      expect_truthy(!isMatch('1/2/1/1', '(*)/\\1/\\1/\\1'));
      expect_truthy(!isMatch('1/1/2/1', '(*)/\\1/\\1/\\1'));
      expect_truthy(!isMatch('1/1/1/2', '(*)/\\1/\\1/\\1'));
      expect_truthy(isMatch('1/1/1/1', '(*)/\\1/(*)/\\2'));
      expect_truthy(!isMatch('1/1/2/1', '(*)/\\1/(*)/\\2'));
      expect_truthy(!isMatch('1/1/2/1', '(*)/\\1/(*)/\\2'));
      expect_truthy(isMatch('1/1/2/2', '(*)/\\1/(*)/\\2'));
    });
  });

  describe('regex character classes', () => {
    test('should not match with character classes when disabled', () => {
      expect_truthy(!isMatch('a/a', 'a/[a-z]', { nobracket: true }));
      expect_truthy(!isMatch('a/b', 'a/[a-z]', { nobracket: true }));
      expect_truthy(!isMatch('a/c', 'a/[a-z]', { nobracket: true }));
    });

    test('should match with character classes by default', () => {
      expect_truthy(isMatch('a/a', 'a/[a-z]'));
      expect_truthy(isMatch('a/b', 'a/[a-z]'));
      expect_truthy(isMatch('a/c', 'a/[a-z]'));

      expect_truthy(!isMatch('foo/bar', '**/[jkl]*'));
      expect_truthy(isMatch('foo/jar', '**/[jkl]*'));

      expect_truthy(isMatch('foo/bar', '**/[^jkl]*'));
      expect_truthy(!isMatch('foo/jar', '**/[^jkl]*'));

      expect_truthy(isMatch('foo/bar', '**/[abc]*'));
      expect_truthy(!isMatch('foo/jar', '**/[abc]*'));

      expect_truthy(!isMatch('foo/bar', '**/[^abc]*'));
      expect_truthy(isMatch('foo/jar', '**/[^abc]*'));

      expect_truthy(isMatch('foo/bar', '**/[abc]ar'));
      expect_truthy(!isMatch('foo/jar', '**/[abc]ar'));
    });

    test('should match character classes', () => {
      expect_truthy(!isMatch('abc', 'a[bc]d'));
      expect_truthy(isMatch('abd', 'a[bc]d'));
    });

    test('should match character class alphabetical ranges', () => {
      expect_truthy(!isMatch('abc', 'a[b-d]e'));
      expect_truthy(!isMatch('abd', 'a[b-d]e'));
      expect_truthy(isMatch('abe', 'a[b-d]e'));
      expect_truthy(!isMatch('ac', 'a[b-d]e'));
      expect_truthy(!isMatch('a-', 'a[b-d]e'));

      expect_truthy(!isMatch('abc', 'a[b-d]'));
      expect_truthy(!isMatch('abd', 'a[b-d]'));
      expect_truthy(isMatch('abd', 'a[b-d]+'));
      expect_truthy(!isMatch('abe', 'a[b-d]'));
      expect_truthy(isMatch('ac', 'a[b-d]'));
      expect_truthy(!isMatch('a-', 'a[b-d]'));
    });

    test('should match character classes with leading dashes', () => {
      expect_truthy(!isMatch('abc', 'a[-c]'));
      expect_truthy(isMatch('ac', 'a[-c]'));
      expect_truthy(isMatch('a-', 'a[-c]'));
    });

    test('should match character classes with trailing dashes', () => {
      expect_truthy(!isMatch('abc', 'a[c-]'));
      expect_truthy(isMatch('ac', 'a[c-]'));
      expect_truthy(isMatch('a-', 'a[c-]'));
    });

    test('should match bracket literals', () => {
      expect_truthy(isMatch('a]c', 'a[]]c'));
      expect_truthy(isMatch('a]c', 'a]c'));
      expect_truthy(isMatch('a]', 'a]'));

      expect_truthy(isMatch('a[c', 'a[\\[]c'));
      expect_truthy(isMatch('a[c', 'a[c'));
      expect_truthy(isMatch('a[', 'a['));
    });

    test('should support negated character classes', () => {
      expect_truthy(!isMatch('a]', 'a[^bc]d'));
      expect_truthy(!isMatch('acd', 'a[^bc]d'));
      expect_truthy(isMatch('aed', 'a[^bc]d'));
      expect_truthy(isMatch('azd', 'a[^bc]d'));
      expect_truthy(!isMatch('ac', 'a[^bc]d'));
      expect_truthy(!isMatch('a-', 'a[^bc]d'));
    });

    test('should match negated dashes', () => {
      expect_truthy(!isMatch('abc', 'a[^-b]c'));
      expect_truthy(isMatch('adc', 'a[^-b]c'));
      expect_truthy(!isMatch('a-c', 'a[^-b]c'));
    });

    test('should match negated pm', () => {
      expect_truthy(isMatch('a-c', 'a[^\\]b]c'));
      expect_truthy(!isMatch('abc', 'a[^\\]b]c'));
      expect_truthy(!isMatch('a]c', 'a[^\\]b]c'));
      expect_truthy(isMatch('adc', 'a[^\\]b]c'));
    });

    test('should match alpha-numeric characters', () => {
      expect_truthy(!isMatch('0123e45g78', '[\\de]+'));
      expect_truthy(isMatch('0123e456', '[\\de]+'));
      expect_truthy(isMatch('01234', '[\\de]+'));
    });

    test('should support valid regex ranges', () => {
      expect_truthy(!isMatch('a/a', 'a/[b-c]'));
      expect_truthy(!isMatch('a/z', 'a/[b-c]'));
      expect_truthy(isMatch('a/b', 'a/[b-c]'));
      expect_truthy(isMatch('a/c', 'a/[b-c]'));
      expect_truthy(isMatch('a/b', '[a-z]/[a-z]'));
      expect_truthy(isMatch('a/z', '[a-z]/[a-z]'));
      expect_truthy(isMatch('z/z', '[a-z]/[a-z]'));
      expect_truthy(!isMatch('a/x/y', 'a/[a-z]'));

      expect_truthy(isMatch('a.a', '[a-b].[a-b]'));
      expect_truthy(isMatch('a.b', '[a-b].[a-b]'));
      expect_truthy(!isMatch('a.a.a', '[a-b].[a-b]'));
      expect_truthy(!isMatch('c.a', '[a-b].[a-b]'));
      expect_truthy(!isMatch('d.a.d', '[a-b].[a-b]'));
      expect_truthy(!isMatch('a.bb', '[a-b].[a-b]'));
      expect_truthy(!isMatch('a.ccc', '[a-b].[a-b]'));

      expect_truthy(isMatch('a.a', '[a-d].[a-b]'));
      expect_truthy(isMatch('a.b', '[a-d].[a-b]'));
      expect_truthy(!isMatch('a.a.a', '[a-d].[a-b]'));
      expect_truthy(isMatch('c.a', '[a-d].[a-b]'));
      expect_truthy(!isMatch('d.a.d', '[a-d].[a-b]'));
      expect_truthy(!isMatch('a.bb', '[a-d].[a-b]'));
      expect_truthy(!isMatch('a.ccc', '[a-d].[a-b]'));

      expect_truthy(isMatch('a.a', '[a-d]*.[a-b]'));
      expect_truthy(isMatch('a.b', '[a-d]*.[a-b]'));
      expect_truthy(isMatch('a.a.a', '[a-d]*.[a-b]'));
      expect_truthy(isMatch('c.a', '[a-d]*.[a-b]'));
      expect_truthy(!isMatch('d.a.d', '[a-d]*.[a-b]'));
      expect_truthy(!isMatch('a.bb', '[a-d]*.[a-b]'));
      expect_truthy(!isMatch('a.ccc', '[a-d]*.[a-b]'));
    });

    test('should support valid regex ranges with glob negation patterns', () => {
      expect_truthy(!isMatch('a.a', '!*.[a-b]'));
      expect_truthy(!isMatch('a.b', '!*.[a-b]'));
      expect_truthy(!isMatch('a.a.a', '!*.[a-b]'));
      expect_truthy(!isMatch('c.a', '!*.[a-b]'));
      expect_truthy(isMatch('d.a.d', '!*.[a-b]'));
      expect_truthy(isMatch('a.bb', '!*.[a-b]'));
      expect_truthy(isMatch('a.ccc', '!*.[a-b]'));

      expect_truthy(!isMatch('a.a', '!*.[a-b]*'));
      expect_truthy(!isMatch('a.b', '!*.[a-b]*'));
      expect_truthy(!isMatch('a.a.a', '!*.[a-b]*'));
      expect_truthy(!isMatch('c.a', '!*.[a-b]*'));
      expect_truthy(!isMatch('d.a.d', '!*.[a-b]*'));
      expect_truthy(!isMatch('a.bb', '!*.[a-b]*'));
      expect_truthy(isMatch('a.ccc', '!*.[a-b]*'));

      expect_truthy(!isMatch('a.a', '![a-b].[a-b]'));
      expect_truthy(!isMatch('a.b', '![a-b].[a-b]'));
      expect_truthy(isMatch('a.a.a', '![a-b].[a-b]'));
      expect_truthy(isMatch('c.a', '![a-b].[a-b]'));
      expect_truthy(isMatch('d.a.d', '![a-b].[a-b]'));
      expect_truthy(isMatch('a.bb', '![a-b].[a-b]'));
      expect_truthy(isMatch('a.ccc', '![a-b].[a-b]'));

      expect_truthy(!isMatch('a.a', '![a-b]+.[a-b]+'));
      expect_truthy(!isMatch('a.b', '![a-b]+.[a-b]+'));
      expect_truthy(isMatch('a.a.a', '![a-b]+.[a-b]+'));
      expect_truthy(isMatch('c.a', '![a-b]+.[a-b]+'));
      expect_truthy(isMatch('d.a.d', '![a-b]+.[a-b]+'));
      expect_truthy(!isMatch('a.bb', '![a-b]+.[a-b]+'));
      expect_truthy(isMatch('a.ccc', '![a-b]+.[a-b]+'));
    });

    test('should support valid regex ranges in negated character classes', () => {
      expect_truthy(!isMatch('a.a', '*.[^a-b]'));
      expect_truthy(!isMatch('a.b', '*.[^a-b]'));
      expect_truthy(!isMatch('a.a.a', '*.[^a-b]'));
      expect_truthy(!isMatch('c.a', '*.[^a-b]'));
      expect_truthy(isMatch('d.a.d', '*.[^a-b]'));
      expect_truthy(!isMatch('a.bb', '*.[^a-b]'));
      expect_truthy(!isMatch('a.ccc', '*.[^a-b]'));

      expect_truthy(!isMatch('a.a', 'a.[^a-b]*'));
      expect_truthy(!isMatch('a.b', 'a.[^a-b]*'));
      expect_truthy(!isMatch('a.a.a', 'a.[^a-b]*'));
      expect_truthy(!isMatch('c.a', 'a.[^a-b]*'));
      expect_truthy(!isMatch('d.a.d', 'a.[^a-b]*'));
      expect_truthy(!isMatch('a.bb', 'a.[^a-b]*'));
      expect_truthy(isMatch('a.ccc', 'a.[^a-b]*'));
    });
  });

  describe('regex capture groups', () => {
    test('should support regex logical "or"', () => {
      expect_truthy(isMatch('a/a', 'a/(a|c)'));
      expect_truthy(!isMatch('a/b', 'a/(a|c)'));
      expect_truthy(isMatch('a/c', 'a/(a|c)'));

      expect_truthy(isMatch('a/a', 'a/(a|b|c)'));
      expect_truthy(isMatch('a/b', 'a/(a|b|c)'));
      expect_truthy(isMatch('a/c', 'a/(a|b|c)'));
    });

    test('should support regex character classes inside extglobs', () => {
      expect_truthy(!isMatch('foo/bar', '**/!([a-k])*'));
      expect_truthy(!isMatch('foo/jar', '**/!([a-k])*'));

      expect_truthy(!isMatch('foo/bar', '**/!([a-i])*'));
      expect_truthy(isMatch('foo/bar', '**/!([c-i])*'));
      expect_truthy(isMatch('foo/jar', '**/!([a-i])*'));
    });

    test('should support regex capture groups', () => {
      expect_truthy(isMatch('a/bb/c/dd/e.md', 'a/??/?/(dd)/e.md'));
      expect_truthy(isMatch('a/b/c/d/e.md', 'a/?/c/?/(e|f).md'));
      expect_truthy(isMatch('a/b/c/d/f.md', 'a/?/c/?/(e|f).md'));
    });

    test('should support regex capture groups with slashes', () => {
      expect_truthy(!isMatch('a/a', '(a/b)'));
      expect_truthy(isMatch('a/b', '(a/b)'));
      expect_truthy(!isMatch('a/c', '(a/b)'));
      expect_truthy(!isMatch('b/a', '(a/b)'));
      expect_truthy(!isMatch('b/b', '(a/b)'));
      expect_truthy(!isMatch('b/c', '(a/b)'));
    });

    test('should support regex non-capture groups', () => {
      expect_truthy(isMatch('a/bb/c/dd/e.md', 'a/**/(?:dd)/e.md'));
      expect_truthy(isMatch('a/b/c/d/e.md', 'a/?/c/?/(?:e|f).md'));
      expect_truthy(isMatch('a/b/c/d/f.md', 'a/?/c/?/(?:e|f).md'));
    });
  });

  describe('quantifiers', () => {
    test('should support regex quantifiers by escaping braces', () => {
      expect_truthy(isMatch('a   ', 'a \\{1,5\\}', { unescape: true }));
      expect_truthy(!isMatch('a   ', 'a \\{1,2\\}', { unescape: true }));
      expect_truthy(!isMatch('a   ', 'a \\{1,2\\}'));
    });

    test('should support extglobs with regex quantifiers', () => {
      expect_truthy(!isMatch('a  ', '@(!(a) \\{1,2\\})*', { unescape: true }));
      expect_truthy(!isMatch('a ', '@(!(a) \\{1,2\\})*', { unescape: true }));
      expect_truthy(!isMatch('a', '@(!(a) \\{1,2\\})*', { unescape: true }));
      expect_truthy(!isMatch('aa', '@(!(a) \\{1,2\\})*', { unescape: true }));
      expect_truthy(!isMatch('aaa', '@(!(a) \\{1,2\\})*', { unescape: true }));
      expect_truthy(!isMatch('b', '@(!(a) \\{1,2\\})*', { unescape: true }));
      expect_truthy(!isMatch('bb', '@(!(a) \\{1,2\\})*', { unescape: true }));
      expect_truthy(!isMatch('bbb', '@(!(a) \\{1,2\\})*', { unescape: true }));
      expect_truthy(isMatch(' a ', '@(!(a) \\{1,2\\})*', { unescape: true }));
      expect_truthy(isMatch('b  ', '@(!(a) \\{1,2\\})*', { unescape: true }));
      expect_truthy(isMatch('b ', '@(!(a) \\{1,2\\})*', { unescape: true }));

      expect_truthy(isMatch('a   ', '@(!(a \\{1,2\\}))*'));
      expect_truthy(isMatch('a   b', '@(!(a \\{1,2\\}))*'));
      expect_truthy(isMatch('a  b', '@(!(a \\{1,2\\}))*'));
      expect_truthy(isMatch('a  ', '@(!(a \\{1,2\\}))*'));
      expect_truthy(isMatch('a ', '@(!(a \\{1,2\\}))*'));
      expect_truthy(isMatch('a', '@(!(a \\{1,2\\}))*'));
      expect_truthy(isMatch('aa', '@(!(a \\{1,2\\}))*'));
      expect_truthy(isMatch('b', '@(!(a \\{1,2\\}))*'));
      expect_truthy(isMatch('bb', '@(!(a \\{1,2\\}))*'));
      expect_truthy(isMatch(' a ', '@(!(a \\{1,2\\}))*'));
      expect_truthy(isMatch('b  ', '@(!(a \\{1,2\\}))*'));
      expect_truthy(isMatch('b ', '@(!(a \\{1,2\\}))*'));
    });

    test('should basename paths', () => {
      expect_equal(utils.basename('/a/b/c'), 'c');
      expect_equal(utils.basename('/a/b/c/'), 'c');
      expect_equal(utils.basename('/a\\b/c', { windows: true }), 'c');
      expect_equal(utils.basename('/a\\b/c\\', { windows: true }), 'c');
      expect_equal(utils.basename('\\a/b\\c', { windows: true }), 'c');
      expect_equal(utils.basename('\\a/b\\c/', { windows: true }), 'c');
    });
  });
});
