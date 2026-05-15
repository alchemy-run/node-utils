import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import path from "node:path";
import micromatch from "../../src/micromatch/index.ts";

const before = beforeAll;
const after = afterAll;

const expect_truthy = (v: unknown) => { expect(Boolean(v)).toBe(true); };
const expect_equal = (actual: unknown, expected: unknown) => {
  expect(actual).toBe(expected as any);
};
const expect_loose_equal = (actual: unknown, expected: unknown) => {
  // Mirrors assert.equal (== loose equality)
  expect(actual == expected).toBe(true);
};
const expect_deepEqual = (actual: unknown, expected: unknown) => {
  expect(actual).toEqual(expected as any);
};
const expect_notDeepEqual = (actual: unknown, expected: unknown) => {
  expect(actual).not.toEqual(expected as any);
};
const expect_notEqual = (actual: unknown, expected: unknown) => {
  expect(actual == expected).toBe(false);
};
const expect_throws = (fn: () => unknown, matcher?: any) => {
  if (matcher) expect(fn).toThrow(matcher);
  else expect(fn).toThrow();
};
const expect_doesNotThrow = (fn: () => unknown) => {
  expect(fn).not.toThrow();
};


import path from "node:path";
const isWindows = () => process.platform === 'win32' || path.sep === '\\';
const mm = micromatch;
const { isMatch, makeRe } = mm;

if (!process.env.ORIGINAL_PATH_SEP) {
  process.env.ORIGINAL_PATH_SEP = path.sep;
}

describe('special characters', () => {
  // See micromatch#127
  describe('unicode', () => {
    test('should match Japanese characters', () => {
      expect_truthy(isMatch('フォルダ/aaa.js', 'フ*/**/*'));
      expect_truthy(isMatch('フォルダ/aaa.js', 'フォ*/**/*'));
      expect_truthy(isMatch('フォルダ/aaa.js', 'フォル*/**/*'));
      expect_truthy(isMatch('フォルダ/aaa.js', 'フ*ル*/**/*'));
      expect_truthy(isMatch('フォルダ/aaa.js', 'フォルダ/**/*'));
    });
  });

  describe('regex', () => {
    test('should match common regex characters', () => {
      let fixtures = ['a c', 'a1c', 'a123c', 'a.c', 'a.xy.zc', 'a.zc', 'abbbbc', 'abbbc', 'abbc', 'abc', 'abq', 'axy zc', 'axy', 'axy.zc', 'axyzc', '^abc$'];

      expect_deepEqual(mm(fixtures, 'ab?bc'), ['abbbc']);
      expect_deepEqual(mm(fixtures, 'ab*c'), ['abbbbc', 'abbbc', 'abbc', 'abc']);
      expect_deepEqual(mm(fixtures, '^abc$'), ['^abc$']);
      expect_deepEqual(mm(fixtures, 'a.c'), ['a.c']);
      expect_deepEqual(mm(fixtures, 'a.*c'), ['a.c', 'a.xy.zc', 'a.zc']);
      expect_deepEqual(mm(fixtures, 'a*c'), ['a c', 'a1c', 'a123c', 'a.c', 'a.xy.zc', 'a.zc', 'abbbbc', 'abbbc', 'abbc', 'abc', 'axy zc', 'axy.zc', 'axyzc']);
      expect_deepEqual(mm(fixtures, 'a(\\w)+c'), ['a1c', 'a123c', 'abbbbc', 'abbbc', 'abbc', 'abc', 'axyzc'], 'Should match word characters');
      expect_deepEqual(mm(fixtures, 'a(\\W)+c'), ['a c', 'a.c'], 'Should match non-word characters');
      expect_deepEqual(mm(fixtures, 'a(\\d)+c'), ['a1c', 'a123c'], 'Should match numbers');
      expect_deepEqual(mm(['foo@#$%123ASD #$$%^&', 'foo!@#$asdfl;', '123'], '(\\d)+'), ['123']);
      expect_deepEqual(mm(['a123c', 'abbbc'], 'a(\\D)+c'), ['abbbc'], 'Should match non-numbers');
      expect_deepEqual(mm(['foo', ' foo '], '(f|o)+\\b'), ['foo'], 'Should match word boundaries');
    });
  });

  describe('slashes', () => {
    test('should match forward slashes', () => {
      expect_truthy(mm.isMatch('/', '/'));
    });

    test('should match backslashes', () => {
      expect_truthy(mm.isMatch('\\', '[\\\\/]'));
      expect_truthy(mm.isMatch('\\', '[\\\\/]+'));
      expect_truthy(mm.isMatch('\\\\', '[\\\\/]+'));
      expect_truthy(mm.isMatch('\\\\\\', '[\\\\/]+'));

      if (isWindows()) {
        mm(['\\'], '[\\\\/]', ['/']);
        mm(['\\', '\\\\', '\\\\\\'], '[\\\\/]+', ['/']);
      } else {
        mm(['\\'], '[\\\\/]', ['\\']);
        mm(['\\', '\\\\', '\\\\\\'], '[\\\\/]+', ['\\', '\\\\', '\\\\\\']);
      }

      path.sep = '\\';
      expect_truthy(mm.isMatch('\\', '[\\\\/]'));
      expect_truthy(mm.isMatch('\\', '[\\\\/]+'));
      expect_truthy(mm.isMatch('\\\\', '[\\\\/]+'));
      expect_truthy(mm.isMatch('\\\\\\', '[\\\\/]+'));
      mm(['\\'], '[\\\\/]', ['/']);
      mm(['\\', '\\\\', '\\\\\\'], '[\\\\/]+', ['/']);
      path.sep = process.env.ORIGINAL_PATH_SEP;
    });
  });

  describe('colons and drive letters', () => {
    test('should treat common URL characters as literals', () => {
      expect_truthy(mm.isMatch(':', ':'));
      expect_truthy(mm.isMatch(':/foo', ':/*'));
      expect_truthy(mm.isMatch('D://foo', 'D://*'));
      expect_truthy(mm.isMatch('D://foo', 'D:\\/\\/*'));
    });
  });

  describe('[ab] - brackets:', () => {
    test('should support regex character classes:', () => {
      expect_deepEqual(mm(['a/b.md', 'a/c.md', 'a/d.md', 'a/E.md'], 'a/[A-Z].md'), ['a/E.md']);
      expect_deepEqual(mm(['a/b.md', 'a/c.md', 'a/d.md'], 'a/[bd].md'), ['a/b.md', 'a/d.md']);
      expect_deepEqual(mm(['a-1.md', 'a-2.md', 'a-3.md', 'a-4.md', 'a-5.md'], 'a-[2-4].md'), ['a-2.md', 'a-3.md', 'a-4.md']);
      expect_deepEqual(mm(['a/b.md', 'b/b.md', 'c/b.md', 'b/c.md', 'a/d.md'], '[bc]/[bd].md'), ['b/b.md', 'c/b.md']);
    });

    test('should handle brackets', () => {
      expect_deepEqual(mm(['ab', 'ac', 'ad', 'a*', '*'], '[a*]*', { regex: true }), ['a*', '*']);
      expect_deepEqual(mm(['ab', 'ac', 'ad', 'a*', '*'], '[a*]*'), ['ab', 'ac', 'ad', 'a*', '*']);
    });

    test('should handle unclosed brackets', () => {
      expect_deepEqual(mm(['[!ab', '[ab'], '[!a*'), ['[!ab']);
    });
  });

  describe('(a|b) - logical OR:', () => {
    test('should support regex logical OR:', () => {
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c', 'b/a', 'b/b'], '(a|b)/b'), ['a/b', 'b/b']);
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'c/b'], '((a|b)|c)/b'), ['a/b', 'b/b', 'c/b']);
      expect_deepEqual(mm(['a/b.md', 'a/c.md', 'a/d.md'], 'a/(b|d).md'), ['a/b.md', 'a/d.md']);
      expect_deepEqual(mm(['a-1.md', 'a-2.md', 'a-3.md', 'a-4.md', 'a-5.md'], 'a-(2|3|4).md'), ['a-2.md', 'a-3.md', 'a-4.md']);
      expect_deepEqual(mm(['a/b.md', 'b/b.md', 'c/b.md', 'b/c.md', 'a/d.md'], '(b|c)/(b|d).md'), ['b/b.md', 'c/b.md']);
    });
  });

  describe('dollar $', () => {
    test('should match dollar signs', () => {
      expect_truthy(!isMatch('$', '!($)'));
      expect_truthy(!isMatch('$', '!$'));
      expect_truthy(isMatch('$$', '!$'));
      expect_truthy(isMatch('$$', '!($)'));
      expect_truthy(isMatch('$$$', '!($)'));
      expect_truthy(isMatch('^', '!($)'));

      expect_truthy(isMatch('$', '!($$)'));
      expect_truthy(!isMatch('$$', '!($$)'));
      expect_truthy(isMatch('$$$', '!($$)'));
      expect_truthy(isMatch('^', '!($$)'));

      expect_truthy(!isMatch('$', '!($*)'));
      expect_truthy(!isMatch('$$', '!($*)'));
      expect_truthy(!isMatch('$$$', '!($*)'));
      expect_truthy(isMatch('^', '!($*)'));

      expect_truthy(isMatch('$', '*'));
      expect_truthy(isMatch('$$', '*'));
      expect_truthy(isMatch('$$$', '*'));
      expect_truthy(isMatch('^', '*'));

      expect_truthy(isMatch('$', '$*'));
      expect_truthy(isMatch('$$', '$*'));
      expect_truthy(isMatch('$$$', '$*'));
      expect_truthy(!isMatch('^', '$*'));

      expect_truthy(isMatch('$', '*$*'));
      expect_truthy(isMatch('$$', '*$*'));
      expect_truthy(isMatch('$$$', '*$*'));
      expect_truthy(!isMatch('^', '*$*'));

      expect_truthy(isMatch('$', '*$'));
      expect_truthy(isMatch('$$', '*$'));
      expect_truthy(isMatch('$$$', '*$'));
      expect_truthy(!isMatch('^', '*$'));

      expect_truthy(!isMatch('$', '?$'));
      expect_truthy(isMatch('$$', '?$'));
      expect_truthy(!isMatch('$$$', '?$'));
      expect_truthy(!isMatch('^', '?$'));
    });
  });

  describe('caret ^', () => {
    test('should match carets', () => {
      expect_truthy(isMatch('^', '^'));
      expect_truthy(isMatch('^/foo', '^/*'));
      expect_truthy(isMatch('^/foo', '^/*'));
      expect_truthy(isMatch('foo^', '*^'));
      expect_truthy(isMatch('^foo/foo', '^foo/*'));
      expect_truthy(isMatch('foo^/foo', 'foo^/*'));

      expect_truthy(!isMatch('^', '!(^)'));
      expect_truthy(isMatch('^^', '!(^)'));
      expect_truthy(isMatch('^^^', '!(^)'));
      expect_truthy(isMatch('&', '!(^)'));

      expect_truthy(isMatch('^', '!(^^)'));
      expect_truthy(!isMatch('^^', '!(^^)'));
      expect_truthy(isMatch('^^^', '!(^^)'));
      expect_truthy(isMatch('&', '!(^^)'));

      expect_truthy(!isMatch('^', '!(^*)'));
      expect_truthy(!isMatch('^^', '!(^*)'));
      expect_truthy(!isMatch('^^^', '!(^*)'));
      expect_truthy(isMatch('&', '!(^*)'));

      expect_truthy(isMatch('^', '*'));
      expect_truthy(isMatch('^^', '*'));
      expect_truthy(isMatch('^^^', '*'));
      expect_truthy(isMatch('&', '*'));

      expect_truthy(isMatch('^', '^*'));
      expect_truthy(isMatch('^^', '^*'));
      expect_truthy(isMatch('^^^', '^*'));
      expect_truthy(!isMatch('&', '^*'));

      expect_truthy(isMatch('^', '*^*'));
      expect_truthy(isMatch('^^', '*^*'));
      expect_truthy(isMatch('^^^', '*^*'));
      expect_truthy(!isMatch('&', '*^*'));

      expect_truthy(isMatch('^', '*^'));
      expect_truthy(isMatch('^^', '*^'));
      expect_truthy(isMatch('^^^', '*^'));
      expect_truthy(!isMatch('&', '*^'));

      expect_truthy(!isMatch('^', '?^'));
      expect_truthy(isMatch('^^', '?^'));
      expect_truthy(!isMatch('^^^', '?^'));
      expect_truthy(!isMatch('&', '?^'));
    });
  });
});
