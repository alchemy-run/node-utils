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


const { isMatch } = picomatch;

describe('stars', () => {
  describe('issue related', () => {
    test('should respect dots defined in glob pattern (micromatch/#23)', () => {
      expect_truthy(isMatch('z.js', 'z*'));
      expect_truthy(!isMatch('zzjs', 'z*.js'));
      expect_truthy(!isMatch('zzjs', '*z.js'));
    });
  });

  describe('single stars', () => {
    test('should match anything except slashes and leading dots', () => {
      expect_truthy(!isMatch('a/b/c/z.js', '*.js'));
      expect_truthy(!isMatch('a/b/z.js', '*.js'));
      expect_truthy(!isMatch('a/z.js', '*.js'));
      expect_truthy(isMatch('z.js', '*.js'));

      expect_truthy(!isMatch('a/.ab', '*/*'));
      expect_truthy(!isMatch('.ab', '*'));

      expect_truthy(isMatch('z.js', 'z*.js'));
      expect_truthy(isMatch('a/z', '*/*'));
      expect_truthy(isMatch('a/z.js', '*/z*.js'));
      expect_truthy(isMatch('a/z.js', 'a/z*.js'));

      expect_truthy(isMatch('ab', '*'));
      expect_truthy(isMatch('abc', '*'));

      expect_truthy(!isMatch('bar', 'f*'));
      expect_truthy(!isMatch('foo', '*r'));
      expect_truthy(!isMatch('foo', 'b*'));
      expect_truthy(!isMatch('foo/bar', '*'));
      expect_truthy(isMatch('abc', '*c'));
      expect_truthy(isMatch('abc', 'a*'));
      expect_truthy(isMatch('abc', 'a*c'));
      expect_truthy(isMatch('bar', '*r'));
      expect_truthy(isMatch('bar', 'b*'));
      expect_truthy(isMatch('foo', 'f*'));
    });

    test('should match spaces', () => {
      expect_truthy(isMatch('one abc two', '*abc*'));
      expect_truthy(isMatch('a         b', 'a*b'));
    });

    test('should support multiple non-consecutive stars in a path segment', () => {
      expect_truthy(!isMatch('foo', '*a*'));
      expect_truthy(isMatch('bar', '*a*'));
      expect_truthy(isMatch('oneabctwo', '*abc*'));
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

    test('should support multiple stars in a segment', () => {
      expect_truthy(!isMatch('a-b.c-d', '**-bc-**'));
      expect_truthy(isMatch('a-b.c-d', '**-**.**-**'));
      expect_truthy(isMatch('a-b.c-d', '**-b**c-**'));
      expect_truthy(isMatch('a-b.c-d', '**-b.c-**'));
      expect_truthy(isMatch('a-b.c-d', '**.**'));
      expect_truthy(isMatch('a-b.c-d', '**.**-**'));
      expect_truthy(isMatch('a-b.c-d', '**.**-d'));
      expect_truthy(isMatch('a-b.c-d', '**.c-**'));
      expect_truthy(isMatch('a-b.c-d', '**b.**d'));
      expect_truthy(isMatch('a-b.c-d', 'a**.c**'));
      expect_truthy(isMatch('a-b.c-d', 'a-**.**-d'));
      expect_truthy(isMatch('a.b', '**.**'));
      expect_truthy(isMatch('a.b', '**.b'));
      expect_truthy(isMatch('a.b', 'a.**'));
      expect_truthy(isMatch('a.b', 'a.b'));
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
      expect_truthy(isMatch('ab', 'ab'));
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

    test('should not match a trailing slash when a star is last char', () => {
      expect_truthy(!isMatch('a', '*/'));
      expect_truthy(!isMatch('a', '*/*'));
      expect_truthy(!isMatch('a', 'a/*'));
      expect_truthy(!isMatch('a/', '*/*'));
      expect_truthy(!isMatch('a/', 'a/*'));
      expect_truthy(!isMatch('a/a', '*'));
      expect_truthy(!isMatch('a/a', '*/'));
      expect_truthy(!isMatch('a/x/y', '*/'));
      expect_truthy(!isMatch('a/x/y', '*/*'));
      expect_truthy(!isMatch('a/x/y', 'a/*'));
      expect_truthy(!isMatch('a/', '*', { strictSlashes: true }));
      expect_truthy(isMatch('a/', '*'));
      expect_truthy(isMatch('a', '*'));
      expect_truthy(isMatch('a/', '*/'));
      expect_truthy(isMatch('a/', '*{,/}'));
      expect_truthy(isMatch('a/a', '*/*'));
      expect_truthy(isMatch('a/a', 'a/*'));
    });

    test('should work with file extensions', () => {
      expect_truthy(!isMatch('a.txt', 'a/**/*.txt'));
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

    test('should not match slashes when globstars are not exclusive in a path segment', () => {
      expect_truthy(!isMatch('foo/baz/bar', 'foo**bar'));
      expect_truthy(isMatch('foobazbar', 'foo**bar'));
    });

    test('should match slashes when defined in braces', () => {
      expect_truthy(isMatch('foo', 'foo{,/**}'));
    });

    test('should correctly match slashes', () => {
      expect_truthy(!isMatch('a/b', 'a*'));
      expect_truthy(!isMatch('a/a/bb', 'a/**/b'));
      expect_truthy(!isMatch('a/bb', 'a/**/b'));

      expect_truthy(!isMatch('foo', '*/**'));
      expect_truthy(!isMatch('foo/bar', '**/'));
      expect_truthy(!isMatch('foo/bar', '**/*/'));
      expect_truthy(!isMatch('foo/bar', '*/*/'));
      expect_truthy(!isMatch('foo/bar/', '**/*', { strictSlashes: true }));

      expect_truthy(isMatch('/home/foo/..', '**/..'));
      expect_truthy(isMatch('a', '**/a'));
      expect_truthy(isMatch('a/a', '**'));
      expect_truthy(isMatch('a/a', 'a/**'));
      expect_truthy(isMatch('a/', 'a/**'));
      expect_truthy(isMatch('a', 'a/**'));
      expect_truthy(!isMatch('a/a', '**/'));
      expect_truthy(isMatch('a', '**/a/**'));
      expect_truthy(isMatch('a', 'a/**'));
      expect_truthy(!isMatch('a/a', '**/'));
      expect_truthy(isMatch('a/a', '*/**/a'));
      expect_truthy(isMatch('a', 'a/**'));
      expect_truthy(isMatch('foo/', '*/**'));
      expect_truthy(isMatch('foo/bar', '**/*'));
      expect_truthy(isMatch('foo/bar', '*/*'));
      expect_truthy(isMatch('foo/bar', '*/**'));
      expect_truthy(isMatch('foo/bar/', '**/'));
      expect_truthy(isMatch('foo/bar/', '**/*'));
      expect_truthy(isMatch('foo/bar/', '**/*/'));
      expect_truthy(isMatch('foo/bar/', '*/**'));
      expect_truthy(isMatch('foo/bar/', '*/*/'));

      expect_truthy(!isMatch('bar/baz/foo', '*/foo'));
      expect_truthy(!isMatch('deep/foo/bar', '**/bar/*'));
      expect_truthy(!isMatch('deep/foo/bar/baz/x', '*/bar/**'));
      expect_truthy(!isMatch('ef', '/*'));
      expect_truthy(!isMatch('foo/bar', 'foo?bar'));
      expect_truthy(!isMatch('foo/bar/baz', '**/bar*'));
      expect_truthy(!isMatch('foo/bar/baz', '**/bar**'));
      expect_truthy(!isMatch('foo/baz/bar', 'foo**bar'));
      expect_truthy(!isMatch('foo/baz/bar', 'foo*bar'));
      expect_truthy(isMatch('foo', 'foo/**'));
      expect_truthy(isMatch('/ab', '/*'));
      expect_truthy(isMatch('/cd', '/*'));
      expect_truthy(isMatch('/ef', '/*'));
      expect_truthy(isMatch('a/b/j/c/z/x.md', 'a/**/j/**/z/*.md'));
      expect_truthy(isMatch('a/j/z/x.md', 'a/**/j/**/z/*.md'));

      expect_truthy(isMatch('bar/baz/foo', '**/foo'));
      expect_truthy(isMatch('deep/foo/bar/baz', '**/bar/*'));
      expect_truthy(isMatch('deep/foo/bar/baz/', '**/bar/**'));
      expect_truthy(isMatch('deep/foo/bar/baz/x', '**/bar/*/*'));
      expect_truthy(isMatch('foo/b/a/z/bar', 'foo/**/**/bar'));
      expect_truthy(isMatch('foo/b/a/z/bar', 'foo/**/bar'));
      expect_truthy(isMatch('foo/bar', 'foo/**/**/bar'));
      expect_truthy(isMatch('foo/bar', 'foo/**/bar'));
      expect_truthy(isMatch('foo/bar/baz/x', '*/bar/**'));
      expect_truthy(isMatch('foo/baz/bar', 'foo/**/**/bar'));
      expect_truthy(isMatch('foo/baz/bar', 'foo/**/bar'));
      expect_truthy(isMatch('XXX/foo', '**/foo'));
    });

    test('should ignore leading "./" when defined on pattern', () => {
      expect_truthy(isMatch('ab', './*'));
      expect_truthy(!isMatch('ab', './*/'));
      expect_truthy(isMatch('ab/', './*/'));
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
