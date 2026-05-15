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

describe('micromatch', () => {
  afterEach(() => (path.sep = sep));
  after(() => (path.sep = sep));

  describe('empty list', () => {
    test('should return an empty array', () => {
      expect_deepEqual(mm([], '*'), []);
    });
  });

  describe('posix paths', () => {
    test('should return an array of matches', () => {
      expect_deepEqual(mm(['a', 'a', 'a'], ['*', 'a*']), ['a']);
    });

    test('should return an array of matches for a literal string', () => {
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], '(a/b)'), ['a/b']);
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], 'a/b'), ['a/b']);
    });

    test('should return an array of matches for an array of literal strings', () => {
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], ['(a/b)', 'a/c']), ['a/b', 'a/c']);
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], ['a/b', 'b/b']), ['a/b', 'b/b']);
    });

    test('should support regex logical or', () => {
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c'], ['a/(a|c)']), ['a/a', 'a/c']);
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c'], ['a/(a|b|c)', 'a/b']), ['a/a', 'a/b', 'a/c']);
    });

    test('should support regex ranges', () => {
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c'], 'a/[b-c]'), ['a/b', 'a/c']);
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c', 'a/x/y', 'a/x'], 'a/[a-z]'), ['a/a', 'a/b', 'a/c', 'a/x']);
    });

    test('should support single globs (*)', () => {
      let fixtures = ['a', 'b', 'a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a', 'x/y', 'z/z'];
      expect_deepEqual(mm(fixtures, ['*']), ['a', 'b']);
      expect_deepEqual(mm(fixtures, ['*/*']), ['a/a', 'a/b', 'a/c', 'a/x', 'x/y', 'z/z']);
      expect_deepEqual(mm(fixtures, ['*/*/*']), ['a/a/a', 'a/a/b']);
      expect_deepEqual(mm(fixtures, ['*/*/*/*']), ['a/a/a/a']);
      expect_deepEqual(mm(fixtures, ['*/*/*/*/*']), ['a/a/a/a/a']);
      expect_deepEqual(mm(fixtures, ['a/*']), ['a/a', 'a/b', 'a/c', 'a/x']);
      expect_deepEqual(mm(fixtures, ['a/*/*']), ['a/a/a', 'a/a/b']);
      expect_deepEqual(mm(fixtures, ['a/*/*/*']), ['a/a/a/a']);
      expect_deepEqual(mm(fixtures, ['a/*/*/*/*']), ['a/a/a/a/a']);
      expect_deepEqual(mm(fixtures, ['a/*/a']), ['a/a/a']);
      expect_deepEqual(mm(fixtures, ['a/*/b']), ['a/a/b']);
    });

    test('should support globstars (**)', () => {
      let fixtures = ['a', 'a/', 'a/a', 'a/b', 'a/c', 'a/x', 'a/x/y', 'a/x/y/z'];
      expect_deepEqual(mm(fixtures, ['*{,/}']), ['a', 'a/']);
      expect_deepEqual(mm(fixtures, ['*/']), ['a/']);
      expect_deepEqual(mm(fixtures, ['*/*']), ['a/a', 'a/b', 'a/c', 'a/x']);
      expect_deepEqual(mm(fixtures, ['**']), fixtures);
      expect_deepEqual(mm(fixtures, ['**/a']), ['a', 'a/a']);
      expect_deepEqual(mm(fixtures, ['a/*']), ['a/a', 'a/b', 'a/c', 'a/x']);
      expect_deepEqual(mm(fixtures, ['a/**']), ['a', 'a/', 'a/a', 'a/b', 'a/c', 'a/x', 'a/x/y', 'a/x/y/z']);
      expect_deepEqual(mm(fixtures, ['a/**/*']), ['a/a', 'a/b', 'a/c', 'a/x', 'a/x/y', 'a/x/y/z']);
      expect_deepEqual(mm(fixtures, ['a/**/**/*']), ['a/a', 'a/b', 'a/c', 'a/x', 'a/x/y', 'a/x/y/z']);
      expect_deepEqual(mm(['a/b/foo/bar/baz.qux'], 'a/b/**/bar/**/*.*'), ['a/b/foo/bar/baz.qux']);
      expect_deepEqual(mm(['a/b/bar/baz.qux'], 'a/b/**/bar/**/*.*'), ['a/b/bar/baz.qux']);
    });

    test('should work with file extensions', () => {
      let fixtures = ['a.txt', 'a/b.txt', 'a/x/y.txt', 'a/x/y/z'];
      expect_deepEqual(mm(fixtures, ['a/**/*.txt']), ['a/b.txt', 'a/x/y.txt']);
      expect_deepEqual(mm(fixtures, ['a/*.txt']), ['a/b.txt']);
      expect_deepEqual(mm(fixtures, ['a*.txt']), ['a.txt']);
      expect_deepEqual(mm(fixtures, ['*.txt']), ['a.txt']);
    });

    test('should match literal brackets', () => {
      expect_deepEqual(mm(['a [b]'], 'a \\[b\\]'), ['a [b]']);
      expect_deepEqual(mm(['a [b] c'], 'a [b] c'), ['a [b] c']);
      expect_deepEqual(mm(['a [b]'], 'a \\[b\\]*'), ['a [b]']);
      expect_deepEqual(mm(['a [bc]'], 'a \\[bc\\]*'), ['a [bc]']);
      expect_deepEqual(mm(['a [b]', 'a [b].js'], 'a \\[b\\].*'), ['a [b].js']);
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
      expect_deepEqual(mm(fixtures, '(a/b)'), ['a/b']);
      expect_deepEqual(mm(fixtures, 'a/b'), ['a/b']);
      expect_deepEqual(mm(fixtures, '(a/b)', { windows: false }), []);
      expect_deepEqual(mm(fixtures, 'a/b', { windows: false }), []);
    });

    test('should return an array of matches for an array of literal strings', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c'];
      expect_deepEqual(mm(fixtures, ['(a/b)', 'a/c']), ['a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, ['a/b', 'b/b']), ['a/b', 'b/b']);
      expect_deepEqual(mm(fixtures, ['(a/b)', 'a/c'], { windows: false }), []);
      expect_deepEqual(mm(fixtures, ['a/b', 'b/b'], { windows: false }), []);
    });

    test('should support regex logical or', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c'];
      expect_deepEqual(mm(fixtures, ['a/(a|c)']), ['a/a', 'a/c']);
      expect_deepEqual(mm(fixtures, ['a/(a|b|c)', 'a/b']), ['a/a', 'a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, ['a/(a|c)'], { windows: false }), []);
      expect_deepEqual(mm(fixtures, ['a/(a|b|c)', 'a/b'], { windows: false }), []);
    });

    test('should support regex ranges', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'a\\x\\y', 'a\\x'];
      expect_deepEqual(mm(fixtures, 'a/[b-c]'), ['a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/[a-z]'), ['a/a', 'a/b', 'a/c', 'a/x']);
      expect_deepEqual(mm(fixtures, 'a/[b-c]', { windows: false }), []);
      expect_deepEqual(mm(fixtures, 'a\\\\[b-c]', { windows: false }), ['a\\b', 'a\\c']);
      expect_deepEqual(mm(fixtures, 'a/[a-z]', { windows: false }), []);
    });

    test('should support single globs (*)', () => {
      let fixtures = [
        'a',
        'b',
        'a\\a',
        'a\\b',
        'a\\c',
        'a\\x',
        'a\\a\\a',
        'a\\a\\b',
        'a\\a\\a\\a',
        'a\\a\\a\\a\\a',
        'x\\y',
        'z\\z'
      ];

      expect_deepEqual(mm(fixtures, ['*']), ['a', 'b']);
      expect_deepEqual(mm(fixtures, ['*/*']), ['a/a', 'a/b', 'a/c', 'a/x', 'x/y', 'z/z']);
      expect_deepEqual(mm(fixtures, ['*/*/*']), ['a/a/a', 'a/a/b']);
      expect_deepEqual(mm(fixtures, ['*/*/*/*']), ['a/a/a/a']);
      expect_deepEqual(mm(fixtures, ['*/*/*/*/*']), ['a/a/a/a/a']);
      expect_deepEqual(mm(fixtures, ['a/*']), ['a/a', 'a/b', 'a/c', 'a/x']);
      expect_deepEqual(mm(fixtures, ['a/*/*']), ['a/a/a', 'a/a/b']);
      expect_deepEqual(mm(fixtures, ['a/*/*/*']), ['a/a/a/a']);
      expect_deepEqual(mm(fixtures, ['a/*/*/*/*']), ['a/a/a/a/a']);
      expect_deepEqual(mm(fixtures, ['a/*/a']), ['a/a/a']);
      expect_deepEqual(mm(fixtures, ['a/*/b']), ['a/a/b']);

      let opts = { windows: false };
      expect_deepEqual(mm(fixtures, ['*/*'], opts), []);
      expect_deepEqual(mm(fixtures, ['*/*/*'], opts), []);
      expect_deepEqual(mm(fixtures, ['*/*/*/*'], opts), []);
      expect_deepEqual(mm(fixtures, ['*/*/*/*/*'], opts), []);
      expect_deepEqual(mm(fixtures, ['a/*'], opts), []);
      expect_deepEqual(mm(fixtures, ['a/*/*'], opts), []);
      expect_deepEqual(mm(fixtures, ['a/*/*/*'], opts), []);
      expect_deepEqual(mm(fixtures, ['a/*/*/*/*'], opts), []);
      expect_deepEqual(mm(fixtures, ['a/*/a'], opts), []);
      expect_deepEqual(mm(fixtures, ['a/*/b'], opts), []);
    });

    test('should support globstars (**)', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'a\\x', 'a\\x\\y', 'a\\x\\y\\z'];
      let expected = ['a/a', 'a/b', 'a/c', 'a/x', 'a/x/y', 'a/x/y/z'];
      expect_deepEqual(mm(fixtures, ['a/**']), expected);
      expect_deepEqual(mm(fixtures, ['a/**/*']), expected);
      expect_deepEqual(mm(fixtures, ['a/**/**/*']), expected);

      expect_deepEqual(mm(fixtures, ['a/**'], { windows: false }), []);
      expect_deepEqual(mm(fixtures, ['a/**/*'], { windows: false }), []);
      expect_deepEqual(mm(fixtures, ['a/**/**/*'], { windows: false }), []);
    });

    test('should work with file extensions', () => {
      let fixtures = ['a.txt', 'a\\b.txt', 'a\\x\\y.txt', 'a\\x\\y\\z'];
      expect_deepEqual(mm(fixtures, ['a\\\\**\\\\*.txt']), []);
      expect_deepEqual(mm(fixtures, ['a\\\\*\\\\*.txt']), []);
      expect_deepEqual(mm(fixtures, ['a\\\\*.txt']), []);
      expect_deepEqual(mm(fixtures, ['a/**/*.txt']), ['a/b.txt', 'a/x/y.txt']);
      expect_deepEqual(mm(fixtures, ['a/*/*.txt']), ['a/x/y.txt']);
      expect_deepEqual(mm(fixtures, ['a/*.txt']), ['a/b.txt']);
      expect_deepEqual(mm(fixtures, ['a*.txt']), ['a.txt']);
      expect_deepEqual(mm(fixtures, ['a.txt']), ['a.txt']);
    });
  });
});
