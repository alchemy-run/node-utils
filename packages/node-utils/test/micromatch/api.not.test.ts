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
const sep = path.sep;
const { not } = micromatch;

describe('.not()', () => {
  beforeEach(() => {
    path.sep = '\\';
  });
  afterEach(() => {
    path.sep = sep;
  });

  describe('posix paths', () => {
    test('should return an array of matches for a literal string', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];
      expect_deepEqual(not(fixtures, '(a/b)'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(not(fixtures, 'a/b'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
    });

    test('should support regex logical or', () => {
      let fixtures = ['a/a', 'a/b', 'a/c'];
      expect_deepEqual(not(fixtures, 'a/(a|c)'), ['a/b']);
      expect_deepEqual(not(fixtures, 'a/(a|b|c)'), []);
    });

    test('should support regex ranges', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'a/x/y', 'a/x'];
      expect_deepEqual(not(fixtures, 'a/[b-c]'), ['a/a', 'a/x/y', 'a/x']);
      expect_deepEqual(not(fixtures, 'a/[a-z]'), ['a/x/y']);
    });

    test('should support globs (*)', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a'];
      expect_deepEqual(not(fixtures, 'a/*'), ['a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a']);
      expect_deepEqual(not(fixtures, 'a/*/a'), ['a/a', 'a/b', 'a/c', 'a/x', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a']);
      expect_deepEqual(not(fixtures, 'a/*/*'), ['a/a', 'a/b', 'a/c', 'a/x', 'a/a/a/a', 'a/a/a/a/a']);
      expect_deepEqual(not(fixtures, 'a/*/*/*'), ['a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a/a']);
      expect_deepEqual(not(fixtures, 'a/*/*/*/*'), ['a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a']);
    });

    test('should support globstars (**)', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'a/x', 'a/x/y', 'a/x/y/z'];
      expect_deepEqual(not(fixtures, 'a/**'), []);
      expect_deepEqual(not(fixtures, 'a/**/*'), []);
      expect_deepEqual(not(fixtures, 'a/**/**/*'), []);
    });

    test('should support negation patterns', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];
      expect_deepEqual(not(fixtures, '!a/b'), ['a/b']);
      expect_deepEqual(not(fixtures, '!a/(b)'), ['a/b']);
      expect_deepEqual(not(fixtures, '!(a/b)'), ['a/b']);
    });
  });

  describe('windows paths', () => {
    test('should return an array of matches for a literal string', () => {
      let fixtures = ['a', 'a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c'];
      expect_deepEqual(not(fixtures, '(a/b)'), ['a', 'a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(not(fixtures, 'a/b'), ['a', 'a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
    });

    test('should support regex logical or', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c'];
      expect_deepEqual(not(fixtures, 'a/(a|c)'), ['a/b']);
      expect_deepEqual(not(fixtures, 'a/(a|b|c)'), []);
    });

    test('should support regex ranges', () => {
      let format = str => str.replace(/\\/g, '/').replace(/^\.\//, '');
      let fixtures = ['.\\a\\a', 'a\\a', 'a\\b', 'a\\c', 'a\\x', 'a\\x\\y'];
      expect_deepEqual(not(fixtures, '[a-c]/[a-c]', { format }), ['a/x', 'a/x/y']);
      expect_deepEqual(not(fixtures, 'a/[b-c]', { format }), ['a/a', 'a/x', 'a/x/y']);
      expect_deepEqual(not(fixtures, 'a/[a-z]', { format }), ['a/x/y']);
    });

    test('should support globs (*)', () => {
      let format = str => str.replace(/\\/g, '/').replace(/^\.\//, '');
      let fixtures = ['a\\a', 'a/a', 'a\\b', '.\\a\\b', 'a\\c', 'a\\x', 'a\\a\\a', 'a\\a\\b', 'a\\a\\a\\a', 'a\\a\\a\\a\\a'];
      expect_deepEqual(not(fixtures, 'a/*', { format }), ['a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a']);
      expect_deepEqual(not(fixtures, 'a/*/a', { format }), ['a/a', 'a/b', 'a/c', 'a/x', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a']);
      expect_deepEqual(not(fixtures, 'a/*/*', { format }), ['a/a', 'a/b', 'a/c', 'a/x', 'a/a/a/a', 'a/a/a/a/a']);
      expect_deepEqual(not(fixtures, 'a/*/*/*', { format }), ['a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a/a']);
      expect_deepEqual(not(fixtures, 'a/*/*/*/*', { format }), ['a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a']);
    });

    test('should support globstars (**)', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'a\\x', 'a\\x\\y', 'a\\x\\y\\z'];
      let expected = ['a/a', 'a/b', 'a/c', 'a/x', 'a/x/y', 'a/x/y/z'];
      expect_deepEqual(not(fixtures, '*'), expected);
      expect_deepEqual(not(fixtures, '**'), []);
      expect_deepEqual(not(fixtures, '*/*'), ['a/x/y', 'a/x/y/z']);
      expect_deepEqual(not(fixtures, 'a/**'), []);
      expect_deepEqual(not(fixtures, 'a/x/**'), ['a/a', 'a/b', 'a/c']);
      expect_deepEqual(not(fixtures, 'a/**/*'), []);
      expect_deepEqual(not(fixtures, 'a/**/**/*'), []);
    });

    test('should support negation patterns', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c'];
      let expected = ['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];
      expect_deepEqual(not(fixtures, '!**'), expected);
      expect_deepEqual(not(fixtures, '!*/*'), expected);
      expect_deepEqual(not(fixtures, '!*'), []);
      expect_deepEqual(not(fixtures, '!a/b'), ['a/b']);
      expect_deepEqual(not(fixtures, '!a/(b)'), ['a/b']);
      expect_deepEqual(not(fixtures, '!(a/b)'), ['a/b']);
    });
  });
});

