// @ts-nocheck — mechanically ported from upstream JS tests; bun runs them as-is.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import path from "node:path";
import micromatch from "../../src/micromatch/index.ts";

const before = beforeAll;
const after = afterAll;

// All helpers accept an optional message arg (matching Node's assert API)
// even though we don't surface it — Bun's expect() builds its own diagnostic.
const expect_truthy = (v: unknown, _msg?: unknown) => {
  expect(Boolean(v)).toBe(true);
};
const expect_equal = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual).toBe(expected as any);
};
const expect_loose_equal = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual == expected).toBe(true);
};
const expect_deepEqual = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual).toEqual(expected as any);
};
const expect_notDeepEqual = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual).not.toEqual(expected as any);
};
const expect_notEqual = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual == expected).toBe(false);
};
const expect_throws = (fn: () => unknown, matcher?: any, _msg?: unknown) => {
  if (matcher) expect(fn).toThrow(matcher);
  else expect(fn).toThrow();
};
const expect_doesNotThrow = (fn: () => unknown, _msg?: unknown) => {
  expect(fn).not.toThrow();
};


const { isMatch } = micromatch;

describe('stars', () => {
  describe('single stars', () => {
    test('should match using one consecutive star', () => {
      expect_truthy(!isMatch('a/b/c/z.js', '*.js'));
      expect_truthy(!isMatch('a/b/z.js', '*.js'));
      expect_truthy(!isMatch('a/z.js', '*.js'));
      expect_truthy(isMatch('a/z.js', '*/z*.js'));
      expect_truthy(isMatch('a/z.js', 'a/z*.js'));
      expect_truthy(isMatch('ab', '*'));
      expect_truthy(isMatch('abc', '*'));
      expect_truthy(isMatch('abc', '*c'));
      expect_truthy(isMatch('abc', 'a*'));
      expect_truthy(isMatch('abc', 'a*c'));
      expect_truthy(isMatch('abc', 'abc'));
      expect_truthy(isMatch('one abc two', '*abc*'));
      expect_truthy(isMatch('oneabctwo', '*abc*'));
      expect_truthy(isMatch('z.js', '*.js'));
      expect_truthy(isMatch('z.js', 'z*.js'));
    });

    test('should support multiple non-consecutive stars in a path segment', () => {
      expect_truthy(!isMatch('a-b.c-d', '*-bc-*'));
      expect_truthy(isMatch('a-b.c-d', '*-*.*-*'));
      expect_truthy(isMatch('a-b.c-d', '*-b*c-*'));
      expect_truthy(isMatch('a-b.c-d', '*-b.c-*'));
      expect_truthy(isMatch('a-b.c-d', '*.*'));
      expect_truthy(isMatch('a-b.c-d', '*.*-*'));
      expect_truthy(isMatch('a-b.c-d', '*.*-d'));
      expect_truthy(isMatch('a-b.c-d', '*.c-*'));
      expect_truthy(isMatch('a-b.c-d', '*b.*d'));
      expect_truthy(isMatch('a-b.c-d', 'a*.c*'));
      expect_truthy(isMatch('a-b.c-d', 'a-*.*-d'));
      expect_truthy(isMatch('a.b', '*.*'));
      expect_truthy(isMatch('a.b', '*.b'));
      expect_truthy(isMatch('a.b', 'a.*'));
      expect_truthy(isMatch('a.b', 'a.b'));
    });

    test('should support stars following brackets', () => {
      expect_truthy(isMatch('a', '[a]*'));
      expect_truthy(isMatch('aa', '[a]*'));
      expect_truthy(isMatch('aaa', '[a]*'));
      expect_truthy(isMatch('az', '[a-z]*'));
      expect_truthy(isMatch('zzz', '[a-z]*'));
    });

    test('should support stars following parens', () => {
      expect_truthy(isMatch('a', '(a)*'));
      expect_truthy(isMatch('ab', '(a|b)*'));
      expect_truthy(isMatch('aa', '(a)*'));
      expect_truthy(isMatch('aaab', '(a|b)*'));
      expect_truthy(isMatch('aaabbb', '(a|b)*'));
    });

    test('should not match slashes with single stars', () => {
      expect_truthy(!isMatch('a/b', '(a)*'));
      expect_truthy(!isMatch('a/b', '[a]*'));
      expect_truthy(!isMatch('a/b', 'a*'));
      expect_truthy(!isMatch('a/b', '(a|b)*'));
    });

    test('should return true when one of the given patterns matches the string', () => {
      expect_truthy(isMatch('/ab', '*/*'));
      expect_truthy(isMatch('.', '.'));
      expect_truthy(!isMatch('a/.b', 'a/'));
      expect_truthy(isMatch('/ab', '/*'));
      expect_truthy(isMatch('/ab', '/??'));
      expect_truthy(isMatch('/ab', '/?b'));
      expect_truthy(isMatch('/cd', '/*'));
      expect_truthy(isMatch('a', 'a'));
      expect_truthy(isMatch('a/.b', 'a/.*'));
      expect_truthy(isMatch('a/b', '?/?'));
      expect_truthy(isMatch('a/b/c/d/e/j/n/p/o/z/c.md', 'a/**/j/**/z/*.md'));
      expect_truthy(isMatch('a/b/c/d/e/z/c.md', 'a/**/z/*.md'));
      expect_truthy(isMatch('a/b/c/xyz.md', 'a/b/c/*.md'));
      expect_truthy(isMatch('a/b/c/xyz.md', 'a/b/c/*.md'));
      expect_truthy(isMatch('a/b/z/.a', 'a/*/z/.a'));
      expect_truthy(!isMatch('a/b/z/.a', 'bz'));
      expect_truthy(isMatch('a/bb.bb/aa/b.b/aa/c/xyz.md', 'a/**/c/*.md'));
      expect_truthy(isMatch('a/bb.bb/aa/bb/aa/c/xyz.md', 'a/**/c/*.md'));
      expect_truthy(isMatch('a/bb.bb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('a/bb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('a/bbbb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('aaa', '*'));
      expect_truthy(isMatch('ab', '*'));
      expect_truthy(isMatch('ab', './*'));
      expect_truthy(isMatch('ab', 'ab'));
      expect_truthy(isMatch('ab/', './*/'));
    });

    test('should return false when the path does not match the pattern', () => {
      expect_truthy(!isMatch('/ab', ['*/']));
      expect_truthy(!isMatch('/ab', ['*/a']));
      expect_truthy(!isMatch('/ab', ['/']));
      expect_truthy(!isMatch('/ab', ['/?']));
      expect_truthy(!isMatch('/ab', ['/a']));
      expect_truthy(!isMatch('/ab', ['?/?']));
      expect_truthy(!isMatch('/ab', ['a/*']));
      expect_truthy(!isMatch('a/.b', ['a/']));
      expect_truthy(!isMatch('a/b/c', ['a/*']));
      expect_truthy(!isMatch('a/b/c', ['a/b']));
      expect_truthy(!isMatch('a/b/c/d/e/z/c.md', ['b/c/d/e']));
      expect_truthy(!isMatch('a/b/z/.a', ['b/z']));
      expect_truthy(!isMatch('ab', ['*/*']));
      expect_truthy(!isMatch('ab', ['/a']));
      expect_truthy(!isMatch('ab', ['a']));
      expect_truthy(!isMatch('ab', ['b']));
      expect_truthy(!isMatch('ab', ['c']));
      expect_truthy(!isMatch('abcd', ['ab']));
      expect_truthy(!isMatch('abcd', ['bc']));
      expect_truthy(!isMatch('abcd', ['c']));
      expect_truthy(!isMatch('abcd', ['cd']));
      expect_truthy(!isMatch('abcd', ['d']));
      expect_truthy(!isMatch('abcd', ['f']));
      expect_truthy(!isMatch('ef', ['/*']));
    });

    test('should match a path segment for each single star', () => {
      expect_truthy(!isMatch('aaa', '*/*/*'));
      expect_truthy(!isMatch('aaa/bb/aa/rr', '*/*/*'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa*'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa**'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa/*'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa/*ccc'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa/*z'));
      expect_truthy(!isMatch('aaa/bbb', '*/*/*'));
      expect_truthy(!isMatch('ab/zzz/ejkl/hi', '*/*jk*/*i'));
      expect_truthy(isMatch('aaa/bba/ccc', '*/*/*'));
      expect_truthy(isMatch('aaa/bba/ccc', 'aaa/**'));
      expect_truthy(isMatch('aaa/bbb', 'aaa/*'));
      expect_truthy(isMatch('ab/zzz/ejkl/hi', '*/*z*/*/*i'));
      expect_truthy(isMatch('abzzzejklhi', '*j*i'));
    });

    test('should match any character besides "/" with a single "*"', () => {
      expect_truthy(isMatch('foo', 'f*'));
      expect_truthy(!isMatch('foo', 'b*'));
      expect_truthy(!isMatch('bar', 'f*'));
      expect_truthy(isMatch('bar', 'b*'));
    });

    test('should support single globs (*)', () => {
      expect_truthy(isMatch('a', '*'));
      expect_truthy(isMatch('b', '*'));
      expect_truthy(!isMatch('a/a', '*'));
      expect_truthy(!isMatch('a/a/a', '*'));
      expect_truthy(!isMatch('a/a/b', '*'));
      expect_truthy(!isMatch('a/a/a/a', '*'));
      expect_truthy(!isMatch('a/a/a/a/a', '*'));

      expect_truthy(!isMatch('a', '*/*'));
      expect_truthy(isMatch('a/a', '*/*'));
      expect_truthy(!isMatch('a/a/a', '*/*'));

      expect_truthy(!isMatch('a', '*/*/*'));
      expect_truthy(!isMatch('a/a', '*/*/*'));
      expect_truthy(isMatch('a/a/a', '*/*/*'));
      expect_truthy(!isMatch('a/a/a/a', '*/*/*'));

      expect_truthy(!isMatch('a', '*/*/*/*'));
      expect_truthy(!isMatch('a/a', '*/*/*/*'));
      expect_truthy(!isMatch('a/a/a', '*/*/*/*'));
      expect_truthy(isMatch('a/a/a/a', '*/*/*/*'));
      expect_truthy(!isMatch('a/a/a/a/a', '*/*/*/*'));

      expect_truthy(!isMatch('a', '*/*/*/*/*'));
      expect_truthy(!isMatch('a/a', '*/*/*/*/*'));
      expect_truthy(!isMatch('a/a/a', '*/*/*/*/*'));
      expect_truthy(!isMatch('a/a/b', '*/*/*/*/*'));
      expect_truthy(!isMatch('a/a/a/a', '*/*/*/*/*'));
      expect_truthy(isMatch('a/a/a/a/a', '*/*/*/*/*'));
      expect_truthy(!isMatch('a/a/a/a/a/a', '*/*/*/*/*'));

      expect_truthy(!isMatch('a', 'a/*'));
      expect_truthy(isMatch('a/a', 'a/*'));
      expect_truthy(!isMatch('a/a/a', 'a/*'));
      expect_truthy(!isMatch('a/a/a/a', 'a/*'));
      expect_truthy(!isMatch('a/a/a/a/a', 'a/*'));

      expect_truthy(!isMatch('a', 'a/*/*'));
      expect_truthy(!isMatch('a/a', 'a/*/*'));
      expect_truthy(isMatch('a/a/a', 'a/*/*'));
      expect_truthy(!isMatch('b/a/a', 'a/*/*'));
      expect_truthy(!isMatch('a/a/a/a', 'a/*/*'));
      expect_truthy(!isMatch('a/a/a/a/a', 'a/*/*'));

      expect_truthy(!isMatch('a', 'a/*/*/*'));
      expect_truthy(!isMatch('a/a', 'a/*/*/*'));
      expect_truthy(!isMatch('a/a/a', 'a/*/*/*'));
      expect_truthy(isMatch('a/a/a/a', 'a/*/*/*'));
      expect_truthy(!isMatch('a/a/a/a/a', 'a/*/*/*'));

      expect_truthy(!isMatch('a', 'a/*/*/*/*'));
      expect_truthy(!isMatch('a/a', 'a/*/*/*/*'));
      expect_truthy(!isMatch('a/a/a', 'a/*/*/*/*'));
      expect_truthy(!isMatch('a/a/b', 'a/*/*/*/*'));
      expect_truthy(!isMatch('a/a/a/a', 'a/*/*/*/*'));
      expect_truthy(isMatch('a/a/a/a/a', 'a/*/*/*/*'));

      expect_truthy(!isMatch('a', 'a/*/a'));
      expect_truthy(!isMatch('a/a', 'a/*/a'));
      expect_truthy(isMatch('a/a/a', 'a/*/a'));
      expect_truthy(!isMatch('a/a/b', 'a/*/a'));
      expect_truthy(!isMatch('a/a/a/a', 'a/*/a'));
      expect_truthy(!isMatch('a/a/a/a/a', 'a/*/a'));

      expect_truthy(!isMatch('a', 'a/*/b'));
      expect_truthy(!isMatch('a/a', 'a/*/b'));
      expect_truthy(!isMatch('a/a/a', 'a/*/b'));
      expect_truthy(isMatch('a/a/b', 'a/*/b'));
      expect_truthy(!isMatch('a/a/a/a', 'a/*/b'));
      expect_truthy(!isMatch('a/a/a/a/a', 'a/*/b'));
    });

    test('should only match a single folder per star when globstars are used', () => {
      expect_truthy(!isMatch('a', '*/**/a'));
      expect_truthy(!isMatch('a/a/b', '*/**/a'));
      expect_truthy(isMatch('a/a', '*/**/a'));
      expect_truthy(isMatch('a/a/a', '*/**/a'));
      expect_truthy(isMatch('a/a/a/a', '*/**/a'));
      expect_truthy(isMatch('a/a/a/a/a', '*/**/a'));
    });

    test('should optionally match a trailing slash when single star is last char', () => {
      expect_truthy(isMatch('a', '*'));
      expect_truthy(isMatch('a/', '*{,/}'));
      expect_truthy(!isMatch('a/a', '*'));
      expect_truthy(!isMatch('a/b', '*'));
      expect_truthy(!isMatch('a/c', '*'));
      expect_truthy(!isMatch('a/x', '*'));
      expect_truthy(!isMatch('a/x/y', '*'));
      expect_truthy(!isMatch('a/x/y/z', '*'));

      expect_truthy(!isMatch('a', '*/'));
      expect_truthy(isMatch('a/', '*/'));
      expect_truthy(!isMatch('a/a', '*/'));
      expect_truthy(!isMatch('a/b', '*/'));
      expect_truthy(!isMatch('a/c', '*/'));
      expect_truthy(!isMatch('a/x', '*/'));
      expect_truthy(!isMatch('a/x/y', '*/'));
      expect_truthy(!isMatch('a/x/y/z', '*/'));

      expect_truthy(!isMatch('a', '*/*'));
      expect_truthy(!isMatch('a/', '*/*'));
      expect_truthy(isMatch('a/a', '*/*'));
      expect_truthy(isMatch('a/b', '*/*'));
      expect_truthy(isMatch('a/c', '*/*'));
      expect_truthy(isMatch('a/x', '*/*'));
      expect_truthy(!isMatch('a/x/y', '*/*'));
      expect_truthy(!isMatch('a/x/y/z', '*/*'));

      expect_truthy(!isMatch('a', 'a/*'));
      expect_truthy(!isMatch('a/', 'a/*'));
      expect_truthy(isMatch('a/a', 'a/*'));
      expect_truthy(isMatch('a/b', 'a/*'));
      expect_truthy(isMatch('a/c', 'a/*'));
      expect_truthy(isMatch('a/x', 'a/*'));
      expect_truthy(!isMatch('a/x/y', 'a/*'));
      expect_truthy(!isMatch('a/x/y/z', 'a/*'));
    });

    test('should support globstars (**)', () => {
      expect_truthy(isMatch('a', '**'));
      expect_truthy(isMatch('a/', '**'));
      expect_truthy(isMatch('a/a', '**'));
      expect_truthy(isMatch('a/b', '**'));
      expect_truthy(isMatch('a/c', '**'));
      expect_truthy(isMatch('a/x', '**'));
      expect_truthy(isMatch('a/x/y', '**'));
      expect_truthy(isMatch('a/x/y/z', '**'));

      expect_truthy(!isMatch('a/', '**/a'));
      expect_truthy(!isMatch('a/b', '**/a'));
      expect_truthy(!isMatch('a/c', '**/a'));
      expect_truthy(!isMatch('a/x', '**/a'));
      expect_truthy(!isMatch('a/x/y', '**/a'));
      expect_truthy(!isMatch('a/x/y/z', '**/a'));
      expect_truthy(isMatch('a', '**/a'));
      expect_truthy(isMatch('a/a', '**/a'));

      expect_truthy(isMatch('a', 'a/**'));
      expect_truthy(isMatch('a/', 'a/**'));
      expect_truthy(isMatch('a/a', 'a/**'));
      expect_truthy(isMatch('a/b', 'a/**'));
      expect_truthy(isMatch('a/c', 'a/**'));
      expect_truthy(isMatch('a/x', 'a/**'));
      expect_truthy(isMatch('a/x/y', 'a/**'));
      expect_truthy(isMatch('a/x/y/z', 'a/**'));

      expect_truthy(!isMatch('a', 'a/**/*'));
      expect_truthy(!isMatch('a/', 'a/**/*'));
      expect_truthy(isMatch('a/a', 'a/**/*'));
      expect_truthy(isMatch('a/b', 'a/**/*'));
      expect_truthy(isMatch('a/c', 'a/**/*'));
      expect_truthy(isMatch('a/x', 'a/**/*'));
      expect_truthy(isMatch('a/x/y', 'a/**/*'));
      expect_truthy(isMatch('a/x/y/z', 'a/**/*'));

      expect_truthy(!isMatch('a', 'a/**/**/*'));
      expect_truthy(!isMatch('a/', 'a/**/**/*'));
      expect_truthy(isMatch('a/a', 'a/**/**/*'));
      expect_truthy(isMatch('a/b', 'a/**/**/*'));
      expect_truthy(isMatch('a/c', 'a/**/**/*'));
      expect_truthy(isMatch('a/x', 'a/**/**/*'));
      expect_truthy(isMatch('a/x/y', 'a/**/**/*'));
      expect_truthy(isMatch('a/x/y/z', 'a/**/**/*'));

      expect_truthy(!isMatch('a', 'a/**/**/**/*'));
      expect_truthy(!isMatch('a/', 'a/**/**/**/*'));
      expect_truthy(isMatch('a/a', 'a/**/**/**/*'));
      expect_truthy(isMatch('a/b', 'a/**/**/**/*'));
      expect_truthy(isMatch('a/c', 'a/**/**/**/*'));
      expect_truthy(isMatch('a/x', 'a/**/**/**/*'));
      expect_truthy(isMatch('a/x/y', 'a/**/**/**/*'));
      expect_truthy(isMatch('a/x/y/z', 'a/**/**/**/*'));

      expect_truthy(isMatch('a/b/foo/bar/baz.qux', 'a/b/**/bar/**/*.*'));
      expect_truthy(isMatch('a/b/bar/baz.qux', 'a/b/**/bar/**/*.*'));
    });

    test('should work with file extensions', () => {
      expect_truthy(!isMatch('a.txt', 'a/**/*.txt'));
      expect_truthy(isMatch('a/b.txt', 'a/**/*.txt'));
      expect_truthy(isMatch('a/x/y.txt', 'a/**/*.txt'));
      expect_truthy(!isMatch('a/x/y/z', 'a/**/*.txt'));

      expect_truthy(!isMatch('a.txt', 'a/*.txt'));
      expect_truthy(isMatch('a/b.txt', 'a/*.txt'));
      expect_truthy(!isMatch('a/x/y.txt', 'a/*.txt'));
      expect_truthy(!isMatch('a/x/y/z', 'a/*.txt'));

      expect_truthy(isMatch('a.txt', 'a*.txt'));
      expect_truthy(!isMatch('a/b.txt', 'a*.txt'));
      expect_truthy(!isMatch('a/x/y.txt', 'a*.txt'));
      expect_truthy(!isMatch('a/x/y/z', 'a*.txt'));

      expect_truthy(isMatch('a.txt', '*.txt'));
      expect_truthy(!isMatch('a/b.txt', '*.txt'));
      expect_truthy(!isMatch('a/x/y.txt', '*.txt'));
      expect_truthy(!isMatch('a/x/y/z', '*.txt'));
    });

    test('should correctly match slashes', () => {
      expect_truthy(!isMatch('a/a/bb', 'a/**/b'));
      expect_truthy(!isMatch('a/bb', 'a/**/b'));
      expect_truthy(!isMatch('foo', '*/**'));
      expect_truthy(!isMatch('foo/bar', '**/'));
      expect_truthy(!isMatch('foo/bar', '**/*/'));
      expect_truthy(!isMatch('foo/bar', '*/*/'));
      expect_truthy(!isMatch('foo/bar/', '**/*', { strictSlashes: true }));
      expect_truthy(isMatch('/home/foo/..', '**/..'));
      expect_truthy(isMatch('a/a', '*/**/a'));
      expect_truthy(isMatch('foo/', '*/**'));
      expect_truthy(isMatch('foo/bar', '**/*'));
      expect_truthy(isMatch('foo/bar', '*/*'));
      expect_truthy(isMatch('foo/bar', '*/**'));
      expect_truthy(isMatch('foo/bar/', '**/'));
      expect_truthy(isMatch('foo/bar/', '**/*'));
      expect_truthy(isMatch('foo/bar/', '**/*/'));
      expect_truthy(isMatch('foo/bar/', '*/**'));
      expect_truthy(isMatch('foo/bar/', '*/*/'));
    });

    test('should optionally match trailing slashes with braces', () => {
      expect_truthy(isMatch('foo', '**/*'));
      expect_truthy(isMatch('foo', '**/*{,/}'));
      expect_truthy(isMatch('foo/', '**/*{,/}'));
      expect_truthy(isMatch('foo/bar', '**/*{,/}'));
      expect_truthy(isMatch('foo/bar/', '**/*{,/}'));
    });
  });
});
