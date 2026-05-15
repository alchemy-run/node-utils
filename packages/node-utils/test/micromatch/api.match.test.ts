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
const mm = micromatch;
const sep = path.sep;

describe('.match()', () => {
  afterEach(() => (path.sep = sep));
  after(() => (path.sep = sep));

  describe('posix paths', () => {
    test('should return an array of matches for a literal string', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];
      expect_deepEqual(mm(fixtures, '(a/b)'), ['a/b']);
      expect_deepEqual(mm(fixtures, 'a/b'), ['a/b']);
    });

    test('should support regex logical or', () => {
      let fixtures = ['a/a', 'a/b', 'a/c'];
      expect_deepEqual(mm(fixtures, 'a/(a|c)'), ['a/a', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/(a|b|c)'), ['a/a', 'a/b', 'a/c']);
    });

    test('should support regex ranges', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'a/x/y', 'a/x'];
      expect_deepEqual(mm(fixtures, 'a/[b-c]'), ['a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/[a-z]'), ['a/a', 'a/b', 'a/c', 'a/x']);
    });

    test('should support negation patterns', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];
      expect_deepEqual(mm(fixtures, '!*/*'), []);
      expect_deepEqual(mm(fixtures, '!*/b'), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/*'), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/b'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/(b)'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/(*)'), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!(*/b)'), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, '!(a/b)'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
    });
  });

  describe('windows paths', () => {
    beforeEach(() => {
      path.sep = '\\';
    });

    afterEach(() => {
      path.sep = sep;
    });

    test('should return an array of matches for a literal string', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c'];
      expect_deepEqual(mm(fixtures, '(a/b)', { windows: false }), []);
      expect_deepEqual(mm(fixtures, '(a/b)'), ['a/b']);
      expect_deepEqual(mm(fixtures, 'a/b', { windows: false }), []);
      expect_deepEqual(mm(fixtures, 'a/b'), ['a/b']);
    });

    test('should support regex logical or', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c'];
      expect_deepEqual(mm(fixtures, 'a/(a|c)', { windows: false }), []);
      expect_deepEqual(mm(fixtures, 'a\\\\(a|c)', { windows: false }), ['a\\a', 'a\\c']);
      expect_deepEqual(mm(fixtures, 'a/(a|c)'), ['a/a', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/(a|b|c)', { windows: false }), []);
      expect_deepEqual(mm(fixtures, 'a/(a|b|c)'), ['a/a', 'a/b', 'a/c']);
    });

    test('should support regex ranges', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'a\\x\\y', 'a\\x'];
      expect_deepEqual(mm(fixtures, 'a/[b-c]', { windows: false }), []);
      expect_deepEqual(mm(fixtures, 'a/[b-c]'), ['a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/[a-z]', { windows: false }), []);
      expect_deepEqual(mm(fixtures, 'a/[a-z]'), ['a/a', 'a/b', 'a/c', 'a/x']);
    });

    test('should support negation patterns', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c'];
      expect_deepEqual(mm(fixtures, '!*/*'), []);
      expect_deepEqual(mm(fixtures, '!*/b', { windows: false }), ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);
      expect_deepEqual(mm(fixtures, '!*/b'), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/*', { windows: false }), ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);
      expect_deepEqual(mm(fixtures, '!a/*'), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/b', { windows: false }), ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);
      expect_deepEqual(mm(fixtures, '!a/b'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/(b)', { windows: false }), ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);
      expect_deepEqual(mm(fixtures, '!a/(b)'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/(*)', { windows: false }), ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);
      expect_deepEqual(mm(fixtures, '!a/(*)'), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!(*/b)', { windows: false }), ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);
      expect_deepEqual(mm(fixtures, '!(*/b)'), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, '!(a/b)', { windows: false }), ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);
      expect_deepEqual(mm(fixtures, '!(a/b)'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
    });
  });
});
